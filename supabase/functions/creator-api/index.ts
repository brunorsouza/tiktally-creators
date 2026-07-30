// Dispatcher único dos endpoints de creator.
// O front (que tem o manifesto ENDPOINTS) manda { method, path (já com path params
// resolvidos), hasBody, query?, body? }. Aqui validamos que o path é de um domínio
// permitido da Creator API, resolvemos o token de creator do usuário, assinamos e
// chamamos a TikTok. O escopo real ainda é imposto pela própria TikTok via token.

import { resolveCreatorAuth } from "../_shared/creatorAuth.ts";
import { callTikTok, getAppCredentials, getBaseUrl, corsHeaders } from "../_shared/tiktokSign.ts";

// Prefixos de path liberados (todos os 36 endpoints caem aqui).
const ALLOWED_PREFIXES = ["/affiliate_creator/", "/analytics/", "/open/"];
const ALLOWED_METHODS = ["GET", "POST", "PUT", "DELETE"];

interface Payload {
  method?: string;
  path?: string;
  hasBody?: boolean;
  query?: Record<string, string | number | boolean | undefined>;
  body?: Record<string, unknown>;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const input: Payload = await req.json().catch(() => ({}));
    const method = (input.method || "GET").toUpperCase();
    const path = String(input.path || "");

    if (!ALLOWED_METHODS.includes(method)) throw new Error(`Método inválido: ${method}`);
    if (!ALLOWED_PREFIXES.some((p) => path.startsWith(p)) || path.includes("..")) {
      throw new Error(`Path não permitido: ${path}`);
    }
    if (/\{[a-z_]+\}/i.test(path)) throw new Error(`Path param não resolvido: ${path}`);

    const { accessToken } = await resolveCreatorAuth(req);
    const { appKey, appSecret } = getAppCredentials();

    const data = await callTikTok({
      method: method as "GET" | "POST" | "PUT" | "DELETE",
      path,
      accessToken,
      appKey,
      appSecret,
      baseUrl: getBaseUrl(),
      query: input.query as Record<string, string | number | undefined> | undefined,
      body: input.hasBody ? input.body : undefined,
    });

    return json({ ok: true, path, data });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const status = message === "CREATOR_NOT_CONNECTED" ? 409 : 400;
    return json({ ok: false, error: message }, status);
  }
});

function json(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
