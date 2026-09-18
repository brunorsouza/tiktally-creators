// POST account-connection — status OU disconnect da conta de creator conectada.
//
// Body: { action: "status" | "disconnect" }  (default: "status")
//  - status:     lê creator_tokens do usuário do app e devolve um resumo
//                SANITIZADO (nunca access_token/refresh_token).
//  - disconnect: apaga a linha creator_tokens do usuário → conta desconectada.
//
// Self-contained de propósito (corsHeaders inline, sem ../_shared) pra deploy
// via Supabase MCP, que não resolve imports de irmãos.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.79.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    // 1) valida a sessão do usuário DO APP (mesmo padrão do account-connect)
    const jwt = (req.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "");
    if (!jwt) throw new Error("Missing session");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

    const { data: userData, error: userErr } = await admin.auth.getUser(jwt);
    if (userErr || !userData.user) throw new Error("Invalid session");
    const userId = userData.user.id;

    const { action = "status" } = await req.json().catch(() => ({ action: "status" }));

    // ── DISCONNECT ──────────────────────────────────────────────────────────
    if (action === "disconnect") {
      const { error } = await admin.from("creator_tokens").delete().eq("user_id", userId);
      if (error) throw new Error(`DB delete failed: ${error.message}`);
      return json({ ok: true, disconnected: true });
    }

    // ── STATUS (default) ─────────────────────────────────────────────────────
    // Só colunas não-secretas. access_token/refresh_token NUNCA saem daqui.
    const { data, error } = await admin
      .from("creator_tokens")
      .select(
        "creator_user_open_id, region, scopes, expires_at, refresh_expires_at, created_at, updated_at"
      )
      .eq("user_id", userId)
      .maybeSingle();
    if (error) throw new Error(`DB read failed: ${error.message}`);

    if (!data) return json({ ok: true, connected: false });

    const scopes = (data.scopes || "")
      .split(",")
      .map((s: string) => s.trim())
      .filter(Boolean);
    const expiresAt = data.expires_at ? new Date(data.expires_at) : null;
    const expired = expiresAt ? expiresAt.getTime() < Date.now() : false;

    // `expired` virou informativo: o access_token vencido é renovado sozinho no
    // próximo uso. O que de fato exige ação do creator é o refresh_token ter
    // morrido — aí nenhuma renovação funciona e só um novo OAuth resolve.
    const refreshExpiresAt = data.refresh_expires_at ? new Date(data.refresh_expires_at) : null;
    const needsReauth = refreshExpiresAt ? refreshExpiresAt.getTime() < Date.now() : false;

    return json({
      ok: true,
      connected: true,
      creator_open_id: data.creator_user_open_id,
      region: data.region,
      scopes,
      expires_at: data.expires_at,
      refresh_expires_at: data.refresh_expires_at,
      // created_at, não updated_at: a linha passa a ser escrita a cada refresh,
      // então `updated_at` é "renovado em", não "conectado em".
      connected_at: data.created_at,
      last_refreshed_at: data.updated_at,
      expired,
      needs_reauth: needsReauth,
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
