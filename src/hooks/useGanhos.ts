import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { callEndpoint } from "@/services/creatorClient";
import type {
  SearchCreatorAffiliateOrdersData,
  CreatorSearchAffiliateTraceOrdersData,
} from "@/types/creator-api.generated";

/**
 * Filtro comum às duas buscas de pedidos de afiliado (área Ganhos & Rastreio).
 * Período sempre em Unix (segundos); cada hook mapeia pros nomes de campo do
 * body do seu próprio endpoint (eles divergem: `create_time_ge/lt` vs `time_ge/lt`).
 */
export interface GanhosFilters {
  /** Início do período (create_time), Unix em segundos. */
  createTimeGe: number;
  /** Fim do período (create_time), Unix em segundos. */
  createTimeLt: number;
  /** Cursor de paginação — vem do `next_page_token` da página anterior. */
  pageToken?: string;
  /** Itens por página (faixa válida da API: 1–100; default: 20). */
  pageSize?: number;
}

export const ganhosKeys = {
  all: ["ganhos"] as const,
  orders: (userId?: string, filters?: GanhosFilters) => [...ganhosKeys.all, "orders", userId, filters] as const,
  trace: (userId?: string, filters?: GanhosFilters) => [...ganhosKeys.all, "trace", userId, filters] as const,
};

/**
 * Search Creator Affiliate Orders (202410) — pedidos de afiliado por conteúdo.
 * Traz preço, commission_rate (centésimos de %), content_type (VIDEO/LIVE/…) e status.
 * Escopo `creator.affiliate_collaboration.read` (disponível no app TikTally-prod).
 */
export function useAffiliateOrders(filters: GanhosFilters) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ganhosKeys.orders(user?.id, filters),
    queryFn: async ({ signal }) => {
      const r = await callEndpoint<SearchCreatorAffiliateOrdersData>(
        "searchCreatorAffiliateOrders",
        {
          query: { page_size: filters.pageSize ?? 20, page_token: filters.pageToken },
          body: { create_time_ge: filters.createTimeGe, create_time_lt: filters.createTimeLt },
        },
        signal
      );
      if (!r.ok) throw new Error(r.error || "Falha ao carregar os pedidos de afiliado");
      return r.data as SearchCreatorAffiliateOrdersData;
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}

/**
 * Creator Search Affiliate Trace Orders (202505) — fonte principal da comissão em R$:
 * actual_commission, estimated_commission_base, commission_rate, estimated/actual
 * shop_ads_commission, estimated_bonus_commission, status (ORDERED/SETTLED/REFUNDED/FROZEN…).
 * Escopo `creator.affiliate.share_link.read` — pode ficar gated em live enquanto o escopo
 * não for liberado no app (ver docs/RELATORIO_ESCOPOS_MVP.md); em mock funciona normalmente.
 */
export function useTraceOrders(filters: GanhosFilters) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ganhosKeys.trace(user?.id, filters),
    queryFn: async ({ signal }) => {
      const r = await callEndpoint<CreatorSearchAffiliateTraceOrdersData>(
        "creatorSearchAffiliateTraceOrders",
        {
          query: { page_size: filters.pageSize ?? 20, page_token: filters.pageToken },
          body: {
            time_ge: filters.createTimeGe,
            time_lt: filters.createTimeLt,
            time_type: "CREATE_TIME",
          },
        },
        signal
      );
      if (!r.ok) throw new Error(r.error || "Falha ao carregar o rastreio de comissões");
      return r.data as CreatorSearchAffiliateTraceOrdersData;
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}
