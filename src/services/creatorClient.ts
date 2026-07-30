import { ENDPOINTS, type EndpointKey } from "@/api/endpoints.generated";
import { FIXTURES } from "@/mocks/fixtures.generated";
import { supabase, FUNCTIONS_BASE_URL } from "@/integrations/supabase/client";

/**
 * Client único de chamada aos endpoints de creator.
 * - USE_MOCK (default true): devolve os fixtures gerados da doc — dá pra testar sem backend.
 * - USE_MOCK=false: chama o edge dispatcher `creator-api`, que assina e bate na TikTok.
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
  source: "mock" | "live";
  status?: number;
  raw?: unknown;
}

export async function callEndpoint<T = unknown>(
  key: EndpointKey,
  params: CallParams = {},
  signal?: AbortSignal
): Promise<CallResult<T>> {
  const def = ENDPOINTS[key];
  if (!def) return { ok: false, error: `Endpoint desconhecido: ${key}`, source: USE_MOCK ? "mock" : "live" };

  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 200)); // simula latência de rede
    return { ok: true, data: FIXTURES[key] as T, source: "mock" };
  }

  const { data: sess } = await supabase.auth.getSession();
  const jwt = sess.session?.access_token;
  if (!jwt) return { ok: false, error: "Sessão expirada. Faça login novamente.", source: "live" };

  // resolve os path params ({video_id} etc.) no path antes de mandar pro edge
  let path = def.path;
  for (const p of def.pathParams) {
    const v = params.pathParams?.[p];
    if (v == null || v === "") return { ok: false, error: `Falta o path param: ${p}`, source: "live" };
    path = path.replace(`{${p}}`, encodeURIComponent(String(v)));
  }

  try {
    const res = await fetch(`${FUNCTIONS_BASE_URL}/creator-api`, {
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
      return { ok: false, error: json.error || `Erro ${res.status}`, source: "live", status: res.status, raw: json };
    }
    return { ok: true, data: json.data as T, source: "live", status: res.status, raw: json };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err), source: "live" };
  }
}

/** Lista os endpoints do manifesto (para telas/tester). */
export { ENDPOINTS, type EndpointKey };
