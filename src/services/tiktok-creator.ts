import { supabase, FUNCTIONS_BASE_URL } from "@/integrations/supabase/client";

/**
 * Helper único pra chamar edge functions autenticadas.
 *
 * Fluxo: o frontend manda o JWT do usuário do app (Supabase). A edge function
 * resolve o `creator_tokens` daquele usuário e faz a chamada assinada à TikTok
 * com o access_token de creator (`user_type=1`). O token da TikTok NUNCA chega
 * ao browser.
 */
export async function callEdge<T = unknown>(
  fn: string,
  body?: Record<string, unknown>,
  signal?: AbortSignal
): Promise<T> {
  const { data: sessionData } = await supabase.auth.getSession();
  const jwt = sessionData.session?.access_token;
  if (!jwt) throw new Error("Sessão expirada. Faça login novamente.");

  const res = await fetch(`${FUNCTIONS_BASE_URL}/${fn}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${jwt}`,
      apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    },
    body: JSON.stringify(body ?? {}),
    signal,
  });

  const text = await res.text();
  let json: { ok?: boolean; data?: T; error?: string };
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    throw new Error(`Resposta inválida da função ${fn}: ${text.slice(0, 200)}`);
  }

  if (!res.ok || json.error) {
    throw new Error(json.error || `Erro ${res.status} em ${fn}`);
  }
  return (json.data ?? json) as T;
}
