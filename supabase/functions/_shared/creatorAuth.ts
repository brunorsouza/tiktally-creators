// Resolve o creator access_token do usuário autenticado do app.
//
// Fluxo: o frontend manda o JWT do usuário (Supabase Auth) no Authorization.
// Aqui validamos esse JWT, descobrimos o user.id, e buscamos o `creator_tokens`
// dele com um client service-role (bypassa RLS de forma controlada no servidor).

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.79.0";

export interface CreatorAuth {
  userId: string;
  accessToken: string;
  region: string | null;
}

export async function resolveCreatorAuth(req: Request): Promise<CreatorAuth> {
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
  const { data: tokenRow, error: tokErr } = await admin
    .from("creator_tokens")
    .select("access_token, region, expires_at")
    .eq("user_id", userId)
    .maybeSingle();

  if (tokErr) throw new Error(`DB error: ${tokErr.message}`);
  if (!tokenRow?.access_token) {
    throw new Error("CREATOR_NOT_CONNECTED"); // frontend trata como "conecte o TikTok"
  }

  // TODO fase 1: checar expires_at e dar refresh via creator-token-refresh.

  return { userId, accessToken: tokenRow.access_token, region: tokenRow.region ?? null };
}
