// Resolve o creator access_token do usuário autenticado do app — renovando-o
// quando preciso.
//
// Fluxo: o frontend manda o JWT do usuário (Supabase Auth) no Authorization.
// Aqui validamos esse JWT, descobrimos o user.id, e buscamos o `creator_tokens`
// dele com um client service-role (bypassa RLS de forma controlada no servidor).
//
// Por que o refresh vive aqui: o access_token da TikTok dura ~7 dias. Enquanto
// isso não existia, passado esse prazo TODA chamada de dados falhava com
// "Expired credentials ... has expired" e o creator só voltava a ver os dados se
// reconectasse a conta na mão. O refresh_token dura ~365 dias, então dá para
// renovar de forma transparente e o creator nunca mais percebe.

import { createClient, type SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.79.0";
import { getAppCredentials } from "./tiktokSign.ts";

const TIKTOK_REFRESH_URL = "https://auth.tiktok-shops.com/api/v2/token/refresh";

/** Renova de forma proativa quando falta menos que isso para expirar. */
const RENEW_MARGIN_MS = 10 * 60 * 1000; // 10 min
/** Lock mais velho que isso é tido como abandonado (a função morreu no meio). */
const LOCK_STALE_MS = 30 * 1000;
/** Espera máxima pelo refresh disparado por uma requisição concorrente. */
const LOCK_WAIT_TOTAL_MS = 8000;
const LOCK_POLL_MS = 400;

/** Nunca conectou uma conta de creator. */
export const NOT_CONNECTED = "CREATOR_NOT_CONNECTED";
/** Conectou, mas a autorização morreu de vez — só um novo OAuth resolve. */
export const REAUTH_REQUIRED = "CREATOR_REAUTH_REQUIRED";

export interface CreatorAuth {
  userId: string;
  accessToken: string;
  region: string | null;
  /** true se este token acabou de ser renovado nesta requisição. */
  refreshed: boolean;
}

interface TokenRow {
  access_token: string;
  refresh_token: string | null;
  region: string | null;
  expires_at: string | null;
  refresh_expires_at: string | null;
}

/** O que a função de claim devolve quando esta requisição leva o lock. */
interface ClaimRow {
  refresh_token: string | null;
  refresh_expires_at: string | null;
}

const ROW_COLUMNS = "access_token, refresh_token, region, expires_at, refresh_expires_at";

export interface ResolveOptions {
  /**
   * Renova mesmo que `expires_at` diga que o token está válido. Usado quando a
   * própria TikTok respondeu "expired credentials" — sinal de que a data
   * gravada aqui está dessincronizada da verdade do lado deles.
   */
  force?: boolean;
}

export async function resolveCreatorAuth(
  req: Request,
  opts: ResolveOptions = {}
): Promise<CreatorAuth> {
  const authHeader = req.headers.get("Authorization") || "";
  const jwt = authHeader.replace(/^Bearer\s+/i, "");
  if (!jwt) throw new Error("Missing Authorization bearer token");

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

  // 1) valida o JWT e pega o usuário
  const { data: userData, error: userErr } = await admin.auth.getUser(jwt);
  if (userErr || !userData.user) throw new Error("Invalid session");
  const userId = userData.user.id;

  // 2) busca o token de creator conectado
  const { data: row, error: tokErr } = await admin
    .from("creator_tokens")
    .select(ROW_COLUMNS)
    .eq("user_id", userId)
    .maybeSingle<TokenRow>();

  if (tokErr) throw new Error(`DB error: ${tokErr.message}`);
  if (!row?.access_token) throw new Error(NOT_CONNECTED); // front: "conecte o TikTok"

  // 3) ainda dá tempo? usa o que está gravado.
  const msLeft = msUntil(row.expires_at);
  const needsRenew = opts.force || msLeft === null || msLeft < RENEW_MARGIN_MS;
  if (!needsRenew) {
    return { userId, accessToken: row.access_token, region: row.region, refreshed: false };
  }

  // 4) renova. `expired` distingue "vencido de fato" de "vence logo": no segundo
  // caso o token atual ainda funciona, então uma requisição que perca o lock
  // segue com ele em vez de ficar esperando.
  const expired = opts.force || msLeft === null || msLeft <= 0;
  const accessToken = await renewAccessToken(admin, userId, row, expired);
  return { userId, accessToken, region: row.region, refreshed: true };
}

/**
 * Troca o refresh_token por um access_token novo e grava.
 *
 * O lock existe porque a TikTok ROTACIONA o refresh_token a cada uso: se as
 * várias chamadas que uma tela dispara em paralelo renovassem ao mesmo tempo,
 * cada uma invalidaria o token da outra e a conta caía de vez. Quem grava
 * `refresh_lock_at` primeiro renova; as demais aproveitam o resultado.
 */
async function renewAccessToken(
  admin: SupabaseClient,
  userId: string,
  row: TokenRow,
  expired: boolean
): Promise<string> {
  if (!row.refresh_token) throw new Error(REAUTH_REQUIRED);

  // refresh_token vencido: nenhuma chamada vai ressuscitar essa autorização.
  const refreshLeft = msUntil(row.refresh_expires_at);
  if (refreshLeft !== null && refreshLeft <= 0) throw new Error(REAUTH_REQUIRED);

  // O claim é um UPDATE..RETURNING dentro do Postgres (ver a função na
  // migration 0002): quem leva a linha renova, quem recebe zero linhas perdeu.
  // Feito aqui no client, seria um read-then-write com janela de corrida.
  const { data: claimRows, error: claimErr } = await admin.rpc("claim_creator_token_refresh", {
    p_user_id: userId,
    p_stale_seconds: Math.round(LOCK_STALE_MS / 1000),
  });

  if (claimErr) throw new Error(`DB error: ${claimErr.message}`);
  const claimed = (claimRows as ClaimRow[] | null)?.[0] ?? null;

  // Perdeu o lock: outra requisição está renovando agora.
  if (!claimed) {
    if (!expired) return row.access_token; // o atual ainda vale — segue a vida
    return await waitForFreshToken(admin, userId);
  }

  // Ganhou o lock. Usa o refresh_token relido no próprio UPDATE, que é o mais
  // recente que existe (outra requisição pode ter renovado entre o SELECT e o
  // claim, deixando o valor do passo 2 obsoleto).
  const refreshToken = claimed.refresh_token || row.refresh_token;

  // Releitura sob o lock: outra requisição pode ter concluído, nesse meio-tempo,
  // que a autorização morreu. Sem isto martelaríamos a TikTok com um
  // refresh_token que já sabemos inválido.
  const claimedRefreshLeft = msUntil(claimed.refresh_expires_at);
  if (claimedRefreshLeft !== null && claimedRefreshLeft <= 0) {
    await admin.from("creator_tokens").update({ refresh_lock_at: null }).eq("user_id", userId);
    throw new Error(REAUTH_REQUIRED);
  }

  try {
    const fresh = await requestTikTokRefresh(refreshToken);

    const { error: upErr } = await admin
      .from("creator_tokens")
      .update({
        access_token: fresh.access_token,
        // A TikTok pode devolver o mesmo refresh_token; só sobrescreve se veio.
        refresh_token: fresh.refresh_token || refreshToken,
        expires_at: epochToIso(fresh.access_token_expire_in),
        refresh_expires_at: epochToIso(fresh.refresh_token_expire_in),
        refresh_lock_at: null,
      })
      .eq("user_id", userId);
    if (upErr) throw new Error(`DB update failed: ${upErr.message}`);

    return fresh.access_token;
  } catch (err) {
    if (err instanceof RefreshRejected) {
      // A TikTok recusou a credencial. Marca a autorização como morta para as
      // próximas requisições não martelarem a API e para a tela de conexão
      // poder pedir a reautorização.
      await admin
        .from("creator_tokens")
        .update({ refresh_expires_at: new Date().toISOString(), refresh_lock_at: null })
        .eq("user_id", userId);
      throw new Error(REAUTH_REQUIRED);
    }
    // Falha transitória (rede, 5xx, timeout): libera o lock e deixa a próxima
    // requisição tentar de novo.
    await admin.from("creator_tokens").update({ refresh_lock_at: null }).eq("user_id", userId);
    throw err;
  }
}

/** Relê a linha até o vencedor do lock publicar o token novo. */
async function waitForFreshToken(admin: SupabaseClient, userId: string): Promise<string> {
  const deadline = Date.now() + LOCK_WAIT_TOTAL_MS;
  while (Date.now() < deadline) {
    await new Promise((r) => setTimeout(r, LOCK_POLL_MS));
    const { data } = await admin
      .from("creator_tokens")
      .select("access_token, expires_at, refresh_expires_at")
      .eq("user_id", userId)
      .maybeSingle<Pick<TokenRow, "access_token" | "expires_at" | "refresh_expires_at">>();

    if (!data) throw new Error(NOT_CONNECTED);

    // O vencedor concluiu que a autorização morreu — não há o que esperar.
    const refreshLeft = msUntil(data.refresh_expires_at);
    if (refreshLeft !== null && refreshLeft <= 0) throw new Error(REAUTH_REQUIRED);

    const msLeft = msUntil(data.expires_at);
    if (msLeft !== null && msLeft > 0) return data.access_token;
  }
  throw new Error("Renovando o acesso ao TikTok. Tente novamente em alguns segundos.");
}

/** A TikTok recusou o refresh_token (vs. falha transitória de rede/servidor). */
class RefreshRejected extends Error {}

interface RefreshData {
  access_token: string;
  refresh_token?: string;
  access_token_expire_in?: number;
  refresh_token_expire_in?: number;
}

/**
 * GET auth.tiktok-shops.com/api/v2/token/refresh
 *   ?app_key&app_secret&refresh_token&grant_type=refresh_token
 * Mesma família do endpoint usado no `account-connect` e a mesma resposta.
 */
async function requestTikTokRefresh(refreshToken: string): Promise<RefreshData> {
  const { appKey, appSecret } = getAppCredentials();
  const params = new URLSearchParams({
    app_key: appKey,
    app_secret: appSecret,
    refresh_token: refreshToken,
    grant_type: "refresh_token",
  });

  const resp = await fetch(`${TIKTOK_REFRESH_URL}?${params.toString()}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  const text = await resp.text();

  // HTTP quebrado é transitório (5xx/proxy): não condena a autorização.
  if (!resp.ok) throw new Error(`TikTok refresh HTTP ${resp.status}: ${text.slice(0, 300)}`);

  let result: { code: number; message?: string; data?: RefreshData };
  try {
    result = JSON.parse(text);
  } catch {
    throw new Error(`TikTok refresh returned non-JSON: ${text.slice(0, 300)}`);
  }

  // code != 0 aqui é a TikTok dizendo que a credencial não serve mais.
  if (result.code !== 0 || !result.data?.access_token) {
    throw new RefreshRejected(`TikTok refresh error (${result.code}): ${result.message || "Unknown"}`);
  }
  return result.data;
}

/** ms até o instante ISO; null se não houver data gravada. */
function msUntil(iso: string | null): number | null {
  if (!iso) return null;
  const t = new Date(iso).getTime();
  return Number.isNaN(t) ? null : t - Date.now();
}

/** A TikTok manda os prazos como epoch em segundos. */
function epochToIso(epochSeconds?: number): string | null {
  return epochSeconds ? new Date(epochSeconds * 1000).toISOString() : null;
}
