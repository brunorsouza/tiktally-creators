// Dispatcher único dos endpoints de creator (nome no padrão do TikTally Seller:
// domínio-ação, como `ads-proxy`; o nome aparece na aba de rede do navegador e
// por isso não cita qual API externa é chamada).
// O front (que tem o manifesto ENDPOINTS) manda { method, path (já com path params
// resolvidos), hasBody, query?, body? }. Aqui validamos que o path é de um domínio
// permitido da Creator API, resolvemos o token de creator do usuário, assinamos e
// chamamos a TikTok. O escopo real ainda é imposto pela própria TikTok via token.

import { resolveCreatorAuth, NOT_CONNECTED, REAUTH_REQUIRED } from "../_shared/creatorAuth.ts";
import {
  callTikTok,
  getAppCredentials,
  getBaseUrl,
  corsHeaders,
  isExpiredCredentials,
} from "../_shared/tiktokSign.ts";

// Prefixos de path liberados.
//
// `/affiliate/` (sem o sufixo `_creator`) é o módulo mais antigo, onde vivem os
// endpoints de sala de live — inclusive o que lista as lives do creator. Ele não
// colide com `/affiliate_creator/`, que é outro prefixo.
const ALLOWED_PREFIXES = [
  "/affiliate_creator/",
  "/affiliate/",
  "/analytics/",
  "/open/",
];
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

    const auth = await resolveCreatorAuth(req);
    const { appKey, appSecret } = getAppCredentials();

    const call = (accessToken: string) =>
      callTikTok({
        method: method as "GET" | "POST" | "PUT" | "DELETE",
        path,
        accessToken,
        appKey,
        appSecret,
        baseUrl: getBaseUrl(),
        query: input.query as Record<string, string | number | undefined> | undefined,
        body: input.hasBody ? input.body : undefined,
      });

    let data: unknown;
    try {
      data = await call(auth.accessToken);
    } catch (err) {
      // A TikTok pode recusar um token que o nosso `expires_at` jurava válido
      // (revogação, relógio fora de sincronia, prazo encurtado do lado deles).
      // Nesse caso força a renovação e repete UMA vez — sem `auth.refreshed`
      // esse retry seria uma segunda tentativa com o mesmo token novo.
      if (!isExpiredCredentials(err) || auth.refreshed) throw err;
      const renewed = await resolveCreatorAuth(req, { force: true });
      data = await call(renewed.accessToken);
    }

    return json({ ok: true, path, data });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const status = message === NOT_CONNECTED || message === REAUTH_REQUIRED ? 409 : 400;
    return json({ ok: false, error: message }, status);
  }
});

function json(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
