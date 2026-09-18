import { ENDPOINTS, type EndpointKey } from "@/api/endpoints.generated";
import { FIXTURES } from "@/mocks/fixtures.generated";
import { mockOverride } from "@/mocks/dense";
import { supabase, FUNCTIONS_BASE_URL } from "@/integrations/supabase/client";

/**
 * Client único de chamada aos endpoints de creator.
 * - USE_MOCK (default true): devolve os fixtures gerados da doc — dá pra testar sem backend.
 * - USE_MOCK=false: chama o edge dispatcher `affiliate-proxy`, que assina e bate na TikTok.
 * Troca com a env VITE_USE_MOCK ("false" liga o modo live).
 */
export const USE_MOCK = import.meta.env.VITE_USE_MOCK !== "false";

export interface CallParams {
  pathParams?: Record<string, string | number>;
  query?: Record<string, string | number | boolean | undefined>;
  body?: Record<string, unknown>;
}

export interface CallResult<T = unknown> {
  ok: boolean;
  data?: T;
  error?: string;
  /** Causa classificada da falha — as telas usam pra reagir certo. */
  kind?: CreatorErrorKind;
  source: "mock" | "live";
  status?: number;
  raw?: unknown;
}

/**
 * Por que a chamada falhou. Isso importa porque as causas exigem ações MUITO
 * diferentes: reconectar a conta, habilitar escopo no Partner Center, ou nada
 * (indisponível na região). Antes tudo virava "conecte sua conta", o que era
 * enganoso para quem já estava conectado.
 */
export type CreatorErrorKind =
  | "not_connected"
  | "reauth_required"
  | "session_expired"
  | "missing_scope"
  | "unauthorized_region"
  | "api_error";

export const NOT_CONNECTED_MESSAGE =
  "Conta de creator não conectada. Conecte o TikTok para ver seus dados.";

export const REAUTH_REQUIRED_MESSAGE =
  "A autorização do TikTok expirou. Reconecte sua conta para voltar a carregar seus dados.";

/** Um erro já lançado por um hook veio de "conta não conectada"? */
export function isNotConnected(err: unknown): boolean {
  return err instanceof Error && err.message === NOT_CONNECTED_MESSAGE;
}

/**
 * O erro é "a autorização morreu, reconecte"? Diferente de `isNotConnected`:
 * aqui a conta ESTÁ conectada, mas o refresh_token venceu (ou a TikTok o
 * revogou), então nem a renovação automática salva — só um novo OAuth.
 */
export function isReauthRequired(err: unknown): boolean {
  return err instanceof Error && err.message === REAUTH_REQUIRED_MESSAGE;
}

/** Códigos de erro da TikTok observados em produção. */
const TIKTOK_MISSING_SCOPE = 105005;
const TIKTOK_UNAUTHORIZED_REGION = 98001004;

/** Extrai o `code` numérico da TikTok das duas formas que o edge repassa. */
function tiktokCode(raw?: string): number | null {
  if (!raw) return null;
  const m = raw.match(/"code":\s*(\d+)/) || raw.match(/TikTok API error \((\d+)\)/);
  return m ? Number(m[1]) : null;
}

export function classifyError(raw?: string, status?: number): CreatorErrorKind {
  if (raw === "CREATOR_REAUTH_REQUIRED") return "reauth_required";
  if (raw === "CREATOR_NOT_CONNECTED") return "not_connected";
  // Credencial vencida vindo crua da TikTok: o servidor renova sozinho, então
  // chegar aqui significa que a renovação não deu conta — trata como reconectar
  // em vez de despejar o texto em inglês da TikTok na tela do creator.
  if (raw && /expired credentials|header has expired/i.test(raw)) return "reauth_required";
  if (status === 409) return "not_connected";
  if (raw && /Sess[aã]o expirada|Invalid session|Missing Authorization/i.test(raw)) return "session_expired";
  const code = tiktokCode(raw);
  if (code === TIKTOK_MISSING_SCOPE) return "missing_scope";
  if (code === TIKTOK_UNAUTHORIZED_REGION && /region/i.test(raw || "")) return "unauthorized_region";
  return "api_error";
}

/** Mensagem em PT-BR que diz o que fazer, citando o escopo exato quando for o caso. */
export function friendlyError(kind: CreatorErrorKind, raw: string | undefined, key?: EndpointKey): string {
  const scopes = key ? ENDPOINTS[key]?.scopes?.join(", ") : undefined;
  switch (kind) {
    case "not_connected":
      return NOT_CONNECTED_MESSAGE;
    case "reauth_required":
      return REAUTH_REQUIRED_MESSAGE;
    case "session_expired":
      return "Sessão expirada. Faça login novamente.";
    case "missing_scope":
      return scopes
        ? `Escopo não autorizado. Este recurso exige ${scopes} — habilite no app do Partner Center e reautorize a conta.`
        : "Escopo não autorizado para este recurso. Habilite-o no Partner Center e reautorize a conta.";
    case "unauthorized_region":
      return "Recurso indisponível na sua região. A TikTok ainda não liberou este endpoint para a região da sua conta.";
    default: {
      const msg = (raw || "").match(/"message":"([^"]*)"/)?.[1];
      return msg || raw || "Falha ao chamar a API do TikTok.";
    }
  }
}

export async function callEndpoint<T = unknown>(
  key: EndpointKey,
  params: CallParams = {},
  signal?: AbortSignal
): Promise<CallResult<T>> {
  const def = ENDPOINTS[key];
  if (!def) {
    return { ok: false, error: `Endpoint desconhecido: ${key}`, kind: "api_error", source: USE_MOCK ? "mock" : "live" };
  }

  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 200)); // simula latência de rede
    // VITE_MOCK_DENSE=true troca o fixture estático por uma série de 90 dias com volume
    // realista (ver src/mocks/dense.ts). Desligado — o default — devolve null e nada muda.
    const denso = mockOverride(key, params);
    return { ok: true, data: (denso ?? FIXTURES[key]) as T, source: "mock" };
  }

  const { data: sess } = await supabase.auth.getSession();
  const jwt = sess.session?.access_token;
  if (!jwt) {
    return { ok: false, error: "Sessão expirada. Faça login novamente.", kind: "session_expired", source: "live" };
  }

  // resolve os path params ({video_id} etc.) no path antes de mandar pro edge
  let path = def.path;
  for (const p of def.pathParams) {
    const v = params.pathParams?.[p];
    if (v == null || v === "") {
      return { ok: false, error: `Falta o path param: ${p}`, kind: "api_error", source: "live" };
    }
    path = path.replace(`{${p}}`, encodeURIComponent(String(v)));
  }

  try {
    const res = await fetch(`${FUNCTIONS_BASE_URL}/affiliate-proxy`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwt}`,
        apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
      },
      body: JSON.stringify({
        method: def.method,
        path,
        hasBody: def.hasBody,
        query: params.query,
        body: params.body,
      }),
      signal,
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok || json.error) {
      const raw = json.error || `Erro ${res.status}`;
      const kind = classifyError(raw, res.status);
      return { ok: false, error: friendlyError(kind, raw, key), kind, source: "live", status: res.status, raw: json };
    }
    return { ok: true, data: json.data as T, source: "live", status: res.status, raw: json };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
      kind: "api_error",
      source: "live",
    };
  }
}

/** Lista os endpoints do manifesto (para telas/tester). */
export { ENDPOINTS, type EndpointKey };
