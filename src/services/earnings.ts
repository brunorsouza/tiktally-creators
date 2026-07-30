import { callEdge } from "./tiktok-creator";
import type { AffiliateOrder, Paginated } from "@/types/creator";

export interface EarningsFilters {
  /** Unix (segundos) — início da janela de criação do pedido. */
  createTimeGe?: number;
  /** Unix (segundos) — fim da janela. */
  createTimeLt?: number;
  pageToken?: string;
  pageSize?: number;
}

/**
 * Search Creator Affiliate Orders — /affiliate_creator/202410/orders/search
 * Edge fn: `creator-search-orders`.
 *
 * A API só retorna order_id + product_id + collaboration ids (não o valor de
 * comissão fechado). Para comissão estimada, cruzar com a taxa da colaboração
 * ou usar `creator-search-affiliate-trace-orders` (TODO fase 1.1).
 */
export async function searchAffiliateOrders(
  filters: EarningsFilters = {},
  signal?: AbortSignal
): Promise<Paginated<AffiliateOrder>> {
  return callEdge<Paginated<AffiliateOrder>>(
    "creator-search-orders",
    {
      create_time_ge: filters.createTimeGe,
      create_time_lt: filters.createTimeLt,
      page_token: filters.pageToken,
      page_size: filters.pageSize ?? 50,
    },
    signal
  );
}
