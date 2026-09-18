// POST account-connect — troca o `code` do OAuth de creator pelo
// creator access_token e grava em `creator_tokens`.
//
// Mesmo endpoint e mesmo nome do TikTally-seller: GET
// https://auth.tiktok-shops.com/api/v2/token/get?app_key&app_secret&auth_code&grant_type=authorized_code
// A resposta traz access_token / refresh_token / access_token_expire_in / open_id / granted_scopes.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.79.0";
import { getAppCredentials, corsHeaders } from "../_shared/tiktokSign.ts";

const TIKTOK_TOKEN_URL = "https://auth.tiktok-shops.com/api/v2/token/get";

interface TokenResponse {
  code: number;
  message?: string;
  data?: {
    access_token: string;
    refresh_token: string;
    access_token_expire_in: number; // epoch (segundos)
    refresh_token_expire_in?: number;
    open_id?: string;
    seller_name?: string;
    seller_base_region?: string;
    granted_scopes?: string[];
    user_type?: number;
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    // 1) valida a sessão do usuário DO APP
    const jwt = (req.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "");
    if (!jwt) throw new Error("Missing session");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

    const { data: userData, error: userErr } = await admin.auth.getUser(jwt);
    if (userErr || !userData.user) throw new Error("Invalid session");
    const userId = userData.user.id;

    // 2) code do body
    const { code } = await req.json();
    if (!code) throw new Error("Missing authorization code");

    // 3) troca o code pelo token
    const { appKey, appSecret } = getAppCredentials();
    const params = new URLSearchParams({
      app_key: appKey,
      app_secret: appSecret,
      auth_code: code,
      grant_type: "authorized_code",
    });
    const resp = await fetch(`${TIKTOK_TOKEN_URL}?${params.toString()}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    if (!resp.ok) {
      throw new Error(`TikTok token endpoint HTTP ${resp.status}: ${await resp.text()}`);
    }
    const result: TokenResponse = await resp.json();
    if (result.code !== 0 || !result.data) {
      throw new Error(`TikTok token error (${result.code}): ${result.message || "Unknown"}`);
    }

    const d = result.data;

    // Garante que é um token de CREATOR (user_type=1). Se vier 0 (seller) ou 3
    // (partner), o usuário autorizou pelo link errado — rejeita em vez de gravar
    // um token de vendedor como se fosse de creator.
    if (d.user_type != null && d.user_type !== 1) {
      throw new Error(
        `Token não é de creator (user_type=${d.user_type}). Autorize pelo link de creator ` +
          `(shop.tiktok.com/alliance/creator/auth), não pelo do vendedor.`
      );
    }

    // 4) upsert em creator_tokens (1 por usuário do app)
    const { error: upErr } = await admin.from("creator_tokens").upsert(
      {
        user_id: userId,
        access_token: d.access_token,
        refresh_token: d.refresh_token,
        creator_user_open_id: d.open_id ?? null,
        expires_at: d.access_token_expire_in
          ? new Date(d.access_token_expire_in * 1000).toISOString()
          : null,
        // Sem isto não há como distinguir "access_token venceu, dá pra renovar"
        // de "a autorização acabou, precisa reconectar".
        refresh_expires_at: d.refresh_token_expire_in
          ? new Date(d.refresh_token_expire_in * 1000).toISOString()
          : null,
        refresh_lock_at: null, // conexão nova zera qualquer lock de refresh velho
        scopes: (d.granted_scopes || []).join(","),
        region: d.seller_base_region ?? "BR",
      },
      { onConflict: "user_id" }
    );
    if (upErr) throw new Error(`DB upsert failed: ${upErr.message}`);

    return json({
      ok: true,
      creator_open_id: d.open_id,
      granted_scopes: d.granted_scopes || [],
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return json({ ok: false, error: message }, 400);
  }
});

function json(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
