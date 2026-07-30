// Helpers compartilhados para chamadas à TikTok Shop Open API — versão CREATOR.
// Diferença vs. o TikTally-seller: creator usa token `user_type=1` e NÃO precisa
// de shop_cipher (o token já identifica o creator). A assinatura HMAC é idêntica.
//
// Adaptado de tiktok-shop-tally/supabase/functions/_shared/tiktokSign.ts.

import { createHmac } from "https://deno.land/std@0.168.0/node/crypto.ts";

export const TIKTOK_API_PRODUCTION = "https://open-api.tiktokglobalshop.com";
export const TIKTOK_API_SANDBOX = "https://open-api-sandbox.tiktokglobalshop.com";

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

export function getBaseUrl(env?: string): string {
  return (env || Deno.env.get("TIKTOK_ENV") || "production") === "sandbox"
    ? TIKTOK_API_SANDBOX
    : TIKTOK_API_PRODUCTION;
}

export function getAppCredentials(): { appKey: string; appSecret: string } {
  const appKey = Deno.env.get("TIKTOK_APP_KEY");
  const appSecret = Deno.env.get("TIKTOK_APP_SECRET");
  if (!appKey || !appSecret) {
    throw new Error("Missing TIKTOK_APP_KEY or TIKTOK_APP_SECRET in environment");
  }
  return { appKey, appSecret };
}

/**
 * Algoritmo de sign da TikTok Open API.
 * 1) path + (params ordenados, sem `sign`/`access_token`) + body
 * 2) wrap: appSecret + str + appSecret
 * 3) HMAC-SHA256 (key = appSecret) → hex
 */
export function generateSignature(
  path: string,
  queryParams: Record<string, string>,
  body: string,
  appSecret: string
): string {
  const keys = Object.keys(queryParams)
    .filter((k) => k !== "sign" && k !== "access_token")
    .sort();
  const paramString = keys.map((k) => `${k}${queryParams[k]}`).join("");
  let signString = path + paramString;
  if (body) signString += body;
  const wrapped = appSecret + signString + appSecret;
  const hmac = createHmac("sha256", appSecret);
  hmac.update(wrapped);
  return hmac.digest("hex");
}

/**
 * Protege IDs grandes (19 dígitos) contra perda de precisão do JSON.parse.
 * Cita todo inteiro de 16+ dígitos que apareça como VALOR de uma chave.
 */
export function quoteBigIntegers(json: string): string {
  return json.replace(/("[\w.\-]+"\s*:\s*)(\d{16,})(?=\s*[,}\]])/g, '$1"$2"');
}

export interface CallTikTokOptions {
  method: "GET" | "POST" | "DELETE";
  path: string;
  accessToken: string; // creator access_token (user_type=1)
  appKey: string;
  appSecret: string;
  query?: Record<string, string | number | undefined>;
  body?: Record<string, unknown>;
  baseUrl?: string;
}

/** Wrapper único: monta query, assina, parseia, valida `code:0`. */
export async function callTikTok<T = unknown>(opts: CallTikTokOptions): Promise<T> {
  const { method, path, accessToken, appKey, appSecret, query, body } = opts;
  const baseUrl = opts.baseUrl || getBaseUrl();

  const queryParams: Record<string, string> = {
    app_key: appKey,
    timestamp: Math.floor(Date.now() / 1000).toString(),
  };
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v != null && v !== "") queryParams[k] = String(v);
    }
  }

  const bodyJson = body ? JSON.stringify(body) : "";
  queryParams.sign = generateSignature(path, queryParams, bodyJson, appSecret);

  const url = `${baseUrl}${path}?${new URLSearchParams(queryParams).toString()}`;
  const response = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      "x-tts-access-token": accessToken,
    },
    body: method === "GET" ? undefined : bodyJson || undefined,
  });

  const text = await response.text();
  if (!response.ok) throw new Error(`TikTok API HTTP ${response.status}: ${text}`);

  let result: { code: number; message?: string; data?: T };
  try {
    result = JSON.parse(quoteBigIntegers(text));
  } catch {
    throw new Error(`TikTok API returned non-JSON: ${text.slice(0, 300)}`);
  }
  if (result.code !== 0) {
    throw new Error(`TikTok API error (${result.code}): ${result.message || "Unknown"}`);
  }
  return (result.data ?? ({} as T)) as T;
}
