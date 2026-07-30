import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { callEndpoint } from "@/services/creatorClient";
import type {
  CreatorSearchOpenCollaborationProductData,
  GetOpenCollaborationProductListByProductIdsData,
  SearchCreatorTargetCollaborationsData,
} from "@/types/creator-api.generated";

/**
 * Hooks da área Descoberta & Colaborações ("o que promover"): marketplace de produtos
 * em colaboração ABERTA (qualquer creator pode entrar) e os convites de colaboração
 * ALVO (o creator foi convidado por uma loja específica).
 *
 * Nota: os `body` das requisições são montados como `Record<string, unknown>` — os
 * tipos `*Body` gerados (`CreatorSearchOpenCollaborationProductBody`,
 * `SearchCreatorTargetCollaborationsBody`) não têm index signature, então não dá pra
 * usá-los como tipo de uma variável local que vai direto pro `CallParams.body`. Os
 * nomes de campo abaixo seguem esses tipos à risca (conferir em creator-api.generated.ts).
 */

/** Campos aceitos por `sort_field` na busca de colaboração aberta (202405). */
export type OpenCollaborationSortField = "commission_rate" | "product_sales_price" | "commission" | "units_sold";
export type SortOrder = "ASC" | "DESC";

/** Filtros da busca de produtos em colaboração aberta (marketplace público). */
export interface OpenCollaborationFilters {
  /** Palavras-chave do título — casadas com AND entre si (máx. 20 palavras). */
  titleKeywords?: string[];
  /** ID da categoria (só categorias de primeiro nível são aceitas pela API). */
  categoryId?: string;
  /** Preço de venda mínimo — string decimal, ex.: "12.44". */
  priceGe?: string;
  /** Preço de venda máximo — string decimal. */
  priceLt?: string;
  /** Comissão mínima, em centésimos de % (ex.: 1000 = 10%). */
  commissionRateGe?: number;
  /** Comissão máxima, em centésimos de % (ex.: 8000 = 80%). */
  commissionRateLt?: number;
  sortField?: OpenCollaborationSortField;
  sortOrder?: SortOrder;
  /** Cursor de paginação — vem do `next_page_token` da página anterior. */
  pageToken?: string;
  /** Itens por página (faixa válida da API: 1–20). */
  pageSize?: number;
}

/** Filtros da busca de colaborações-alvo (convites) recebidas pelo creator. */
export interface TargetCollaborationsFilters {
  /** ID da loja (shop_id) — obrigatório pela API. Não existe endpoint de creator para
   *  listar "minhas lojas", então esse valor precisa ser digitado na tela. */
  shopId: string;
  /** Restringe por nome (LIVE apenas) ou por ID (LIVE/EXPIRED/DELETED/ENDED). */
  keywordType?: "TARGET_COLLABORATIONS_ID" | "TARGET_COLLABORATIONS_NAME";
  keyword?: string;
  /** Cursor de paginação — vem do `next_page_token` da página anterior. */
  pageToken?: string;
  /** Itens por página (faixa válida da API: 0–100). */
  pageSize?: number;
}

export const descobertaKeys = {
  all: ["descoberta"] as const,
  openProducts: (userId?: string, filters?: OpenCollaborationFilters) =>
    [...descobertaKeys.all, "open-products", userId, filters] as const,
  target: (userId?: string, filters?: TargetCollaborationsFilters) =>
    [...descobertaKeys.all, "target", userId, filters] as const,
  byIds: (userId?: string, productIds?: string[]) => [...descobertaKeys.all, "by-ids", userId, productIds] as const,
};

/**
 * Creator Search Open Collaboration Product (202405) — busca no marketplace de
 * produtos em colaboração ABERTA do TikTok Shop (qualquer creator registrado na
 * região pode promover). Filtra por keywords/categoria/faixa de preço/faixa de
 * comissão; ordena por commission_rate/product_sales_price/commission/units_sold;
 * pagina por page_token.
 */
export function useOpenCollaborationProducts(filters: OpenCollaborationFilters) {
  const { user } = useAuth();
  return useQuery({
    queryKey: descobertaKeys.openProducts(user?.id, filters),
    queryFn: async ({ signal }) => {
      const body: Record<string, unknown> = {};
      if (filters.titleKeywords?.length) body.title_keywords = filters.titleKeywords;
      if (filters.categoryId) body.category = { id: filters.categoryId };
      if (filters.priceGe || filters.priceLt) {
        body.sales_price_range = {
          ...(filters.priceGe ? { amount_ge: filters.priceGe } : {}),
          ...(filters.priceLt ? { amount_lt: filters.priceLt } : {}),
        };
      }
      if (filters.commissionRateGe != null || filters.commissionRateLt != null) {
        body.commission_rate_range = {
          ...(filters.commissionRateGe != null ? { rate_ge: filters.commissionRateGe } : {}),
          ...(filters.commissionRateLt != null ? { rate_lt: filters.commissionRateLt } : {}),
        };
      }
      const r = await callEndpoint<CreatorSearchOpenCollaborationProductData>(
        "creatorSearchOpenCollaborationProduct",
        {
          query: {
            page_size: filters.pageSize ?? 20,
            page_token: filters.pageToken,
            sort_field: filters.sortField,
            sort_order: filters.sortOrder,
          },
          body,
        },
        signal
      );
      if (!r.ok) throw new Error(r.error || "Falha ao buscar produtos em colaboração aberta");
      return r.data as CreatorSearchOpenCollaborationProductData;
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}

/**
 * Get Open Collaboration Product List By Product Ids (202509) — detalhes completos
 * de produtos de colaboração aberta a partir de uma lista de IDs. Alimenta o "ver
 * detalhes" da grade de produtos (traz `shop_ads_commission`, que a busca não retorna).
 * Sem body — os IDs vão via query `product_ids`, separados por vírgula (mesma
 * convenção documentada para `video_ids` em Analytics: "Use ',' to separate array
 * elements when send in the query").
 */
export function useOpenCollaborationByIds(productIds: string[]) {
  const { user } = useAuth();
  return useQuery({
    queryKey: descobertaKeys.byIds(user?.id, productIds),
    queryFn: async ({ signal }) => {
      const r = await callEndpoint<GetOpenCollaborationProductListByProductIdsData>(
        "getOpenCollaborationProductListByProductIds",
        { query: { product_ids: productIds.join(",") } },
        signal
      );
      if (!r.ok) throw new Error(r.error || "Falha ao carregar os detalhes do produto");
      return r.data as GetOpenCollaborationProductListByProductIdsData;
    },
    enabled: !!user && productIds.length > 0,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}

/**
 * Search Creator Target Collaborations (202405) — convites de colaboração ALVO que o
 * creator recebeu de uma loja específica (`shop_id`, obrigatório pela API). Cada
 * colaboração tem status LIVE/EXPIRED/DELETED/ENDED e uma lista de produtos com a
 * comissão negociada. Pagina por page_token.
 */
export function useTargetCollaborations(filters: TargetCollaborationsFilters) {
  const { user } = useAuth();
  return useQuery({
    queryKey: descobertaKeys.target(user?.id, filters),
    queryFn: async ({ signal }) => {
      const body: Record<string, unknown> = { shop_id: filters.shopId };
      if (filters.keyword) {
        body.keyword = filters.keyword;
        body.keyword_type = filters.keywordType ?? "TARGET_COLLABORATIONS_NAME";
      }
      const r = await callEndpoint<SearchCreatorTargetCollaborationsData>(
        "searchCreatorTargetCollaborations",
        { query: { page_size: filters.pageSize ?? 20, page_token: filters.pageToken }, body },
        signal
      );
      if (!r.ok) throw new Error(r.error || "Falha ao buscar as colaborações-alvo");
      return r.data as SearchCreatorTargetCollaborationsData;
    },
    enabled: !!user && !!filters.shopId,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}
