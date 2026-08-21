import { useQuery } from "@tanstack/react-query";
import { parseAmount } from "@/lib/formatters";
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

/** Teto de segurança: 20 páginas x 100 = 2000 pedidos por período. */
const MAX_PAGES = 20;
const FULL_PAGE_SIZE = 100;

/**
 * Todos os pedidos de afiliado do período, percorrendo a paginação até o fim.
 *
 * Por que existe: a API devolve no máximo ~100 pedidos por página, e somar só a
 * primeira página subestima a comissão. Em 30 dias esta conta tinha 376 pedidos e o
 * painel exibia o total de 98 — e como todo período estourava a primeira página, os
 * KPIs ficavam idênticos em 7, 30 e 90 dias, dando a impressão de filtro quebrado.
 *
 * `truncated` avisa quando o teto foi atingido, para a tela não afirmar um total
 * que na verdade está incompleto.
 */
export function useAllAffiliateOrders(filters: GanhosFilters) {
  const { user } = useAuth();
  return useQuery({
    queryKey: [...ganhosKeys.orders(user?.id, filters), "all"] as const,
    queryFn: async ({ signal }) => {
      const orders: NonNullable<SearchCreatorAffiliateOrdersData["orders"]> = [];
      let pageToken: string | undefined;
      let totalCount: number | undefined;
      let pages = 0;

      do {
        const r = await callEndpoint<SearchCreatorAffiliateOrdersData>(
          "searchCreatorAffiliateOrders",
          {
            query: { page_size: FULL_PAGE_SIZE, page_token: pageToken },
            body: { create_time_ge: filters.createTimeGe, create_time_lt: filters.createTimeLt },
          },
          signal
        );
        if (!r.ok) throw new Error(r.error || "Falha ao carregar os pedidos");
        const d = r.data as SearchCreatorAffiliateOrdersData;
        orders.push(...(d.orders ?? []));
        totalCount = d.total_count ?? totalCount;
        pageToken = d.next_page_token || undefined;
        pages += 1;
      } while (pageToken && pages < MAX_PAGES);

      return { orders, total_count: totalCount, truncated: !!pageToken };
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}

/**
 * Base de vendas da SKU — o que representa "GMV gerado" para o creator.
 *
 * NÃO é `price.amount`. A própria TikTok define a base de comissão como preço de
 * venda x quantidade, já descontadas devoluções e reembolsos; somar `price` ignora
 * a quantidade e não desconta nada. Medido nesta conta, a diferença foi de 14%.
 *
 * `actual_commission_base` só existe em pedido liquidado (ausente em 87% das SKUs do
 * mês corrente), então ele vale quando o pedido está SETTLED e a estimativa cobre o
 * resto — mesma regra que já usamos para a comissão.
 */
export function salesBaseOf(
  sku: {
    actual_commission_base?: { amount?: string };
    estimated_commission_base?: { amount?: string };
  },
  orderStatus?: string
): number {
  const actual = parseAmount(sku.actual_commission_base?.amount);
  if (orderStatus === "SETTLED" && actual) return actual;
  return parseAmount(sku.estimated_commission_base?.amount) || actual;
}
