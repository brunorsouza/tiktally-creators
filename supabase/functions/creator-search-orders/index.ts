// POST Search Creator Affiliate Orders — /affiliate_creator/202410/orders/search
// scope creator.affiliate_collaboration.read
//
// Body aceito do frontend: { create_time_ge, create_time_lt, page_token, page_size }
// Retorna { items, next_page_token, total_count } normalizado.

import { resolveCreatorAuth } from "../_shared/creatorAuth.ts";
import { callTikTok, getAppCredentials, getBaseUrl, corsHeaders } from "../_shared/tiktokSign.ts";

interface OrdersResponse {
  orders?: unknown[];
  next_page_token?: string;
  total_count?: number;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { accessToken } = await resolveCreatorAuth(req);
    const { appKey, appSecret } = getAppCredentials();
    const input = await req.json().catch(() => ({}));

    const pageSize = Math.min(Math.max(Number(input.page_size) || 50, 1), 100);

    const data = await callTikTok<OrdersResponse>({
      method: "POST",
      path: "/affiliate_creator/202410/orders/search",
      accessToken,
      appKey,
      appSecret,
      baseUrl: getBaseUrl(),
      query: {
        page_size: pageSize,
        page_token: input.page_token || undefined,
      },
      body: {
        create_time_ge: input.create_time_ge || undefined,
        create_time_lt: input.create_time_lt || undefined,
      },
    });

    return json({
      ok: true,
      data: {
        items: data.orders ?? [],
        next_page_token: data.next_page_token,
        total_count: data.total_count,
      },
    });
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
