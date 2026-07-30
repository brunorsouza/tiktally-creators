// GET Creator Profile — /affiliate_creator/202508/profiles (scope creator.affiliate.info)
// Retorna o perfil do creator conectado.

import { resolveCreatorAuth } from "../_shared/creatorAuth.ts";
import { callTikTok, getAppCredentials, getBaseUrl, corsHeaders } from "../_shared/tiktokSign.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { accessToken } = await resolveCreatorAuth(req);
    const { appKey, appSecret } = getAppCredentials();

    const data = await callTikTok({
      method: "GET",
      path: "/affiliate_creator/202508/profiles",
      accessToken,
      appKey,
      appSecret,
      baseUrl: getBaseUrl(),
    });

    return json({ ok: true, data });
  } catch (err) {
    return handleError(err);
  }
});

function json(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function handleError(err: unknown): Response {
  const message = err instanceof Error ? err.message : String(err);
  const status = message === "CREATOR_NOT_CONNECTED" ? 409 : 400;
  return json({ ok: false, error: message }, status);
}
