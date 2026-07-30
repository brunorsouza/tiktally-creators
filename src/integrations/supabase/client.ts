import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  console.error("Missing Supabase env vars:", {
    SUPABASE_URL: SUPABASE_URL ? "set" : "MISSING",
    SUPABASE_PUBLISHABLE_KEY: SUPABASE_PUBLISHABLE_KEY ? "set" : "MISSING",
  });
  throw new Error(
    "Supabase não configurado. Preencha VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY no .env (veja .env.example)."
  );
}

// import { supabase } from "@/integrations/supabase/client";
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  },
});

// Base URL das edge functions. Use SEMPRE `${FUNCTIONS_BASE_URL}/nome-da-fn` em
// fetch direto pra edge, pra respeitar um eventual custom domain. Nunca termina com barra.
const FUNCTIONS_URL_OVERRIDE = import.meta.env.VITE_SUPABASE_FUNCTIONS_URL;
if (FUNCTIONS_URL_OVERRIDE) {
  (supabase as unknown as { functionsUrl: URL }).functionsUrl = new URL(FUNCTIONS_URL_OVERRIDE);
}

export const FUNCTIONS_BASE_URL = (
  FUNCTIONS_URL_OVERRIDE || `${SUPABASE_URL}/functions/v1`
).replace(/\/$/, "");
