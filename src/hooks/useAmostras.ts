import { useInfiniteQuery, useMutation, useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { callEndpoint } from "@/services/creatorClient";
import type {
  GetCreatorApplicableSampleLabelData,
  SearchCreatorSampleApplicationsData,
  GetCreatorSampleApplicationDetailData,
  CreatorSearchSampleApplicationFulfillmentsData,
  CreatorGetSampleRequestDeeplinkData,
} from "@/types/creator-api.generated";

/**
 * Hooks da área Amostras (samples grátis): solicitações de amostra que o creator fez
 * a lojas, o rastreio de envio/fulfillment dessas amostras, o detalhe de uma
 * solicitação específica e a checagem de elegibilidade produto a produto.
 *
 * Assim como em useDescoberta.ts, os `body` são montados como `Record<string, unknown>`
 * — os tipos `*Body` gerados não têm index signature, então não dá pra usá-los como tipo
 * de uma variável local que vai direto pro `CallParams.body`. Os nomes de campo abaixo
 * seguem esses tipos à risca (conferir em creator-api.generated.ts).
 */

/** `application_statuses` aceitos por Search Creator Sample Applications (202412). */
export type SampleApplicationStatus =
  | "PENDING"
  | "AWAITING_SHIPMENT"
  | "SHIPPED"
  | "CONTENT_PENDING"
  | "REJECT_CANCELLED"
  | "OVERDUE_CANCELLED"
  | "UNFULFILL_CANCELLED"
  | "DEL_OPEN_COLLAB"
  | "SELLER_NOT_SHIP_CANCELLED"
  | "WITHDRAW_CANCELLED"
  | "UNFULFILLABLE_CANCELLED"
  | "OPS_CANCELLED"
  | "OPS_FAILED"
  | "OPS_COMPLETED"
  | "COMPLETED";

/** `fulfillment_statuses` aceitos por Creator Search Sample Application Fulfillments (202409). */
export type SampleFulfillmentStatus =
  | "PENDING"
  | "ONGOING"
  | "SUCCEED"
  | "FAILED"
  | "OVERDUE"
  | "SUSPEND"
  | "CANCELLED"
  | "EXEMPTED";

/** Filtros da lista de solicitações de amostra. Sem filtro de período — o endpoint não
 *  aceita datas, só status (opcional) e paginação por cursor. */
export interface SampleApplicationsFilters {
  /** Se vazio/undefined, a API retorna solicitações de qualquer status. */
  statuses?: SampleApplicationStatus[];
  /** Cursor de paginação — vem do `next_page_token` da página anterior. */
  pageToken?: string;
  /** Itens por página (faixa válida da API: 1–50; default: 20). */
  pageSize?: number;
}

/** Filtros do rastreio de envio das amostras. `statuses` é obrigatório pela API (o
 *  endpoint não tem valor default nem paginação — sem page_token/page_size). */
export interface SampleFulfillmentsFilters {
  statuses: SampleFulfillmentStatus[];
  /** Default da API: expired_time. */
  sortField?: "expired_time" | "create_time";
  /** Default da API: ASC. */
  sortOrder?: "ASC" | "DESC";
}

/** Parâmetros do detalhe de uma solicitação. `productId` e `applicationType` são
 *  obrigatórios pela API; `applicationId`/`mainOrderId` dependem do tipo da aplicação
 *  (ver doc). Habilitado só quando `productId` está presente. */
export interface SampleApplicationDetailParams {
  productId?: string;
  applicationId?: string;
  /** FREE_SAMPLE | SAMPLE_COUPON | SAMPLE_CAMPAIGN — default "FREE_SAMPLE" se omitido. */
  applicationType?: string;
  mainOrderId?: string;
}

/**
 * Enum completo de `application_statuses` (Search Creator Sample Applications 202412).
 * Usado como padrão quando o usuário não filtra — a API exige a lista preenchida.
 */
export const ALL_APPLICATION_STATUSES = [
  "PENDING",
  "AWAITING_SHIPMENT",
  "SHIPPED",
  "CONTENT_PENDING",
  "REJECT_CANCELLED",
  "OVERDUE_CANCELLED",
  "UNFULFILL_CANCELLED",
  "DEL_OPEN_COLLAB",
  "SELLER_NOT_SHIP_CANCELLED",
  "WITHDRAW_CANCELLED",
  "UNFULFILLABLE_CANCELLED",
  "OPS_CANCELLED",
  "OPS_FAILED",
  "OPS_COMPLETED",
  "COMPLETED",
] as const;

export const amostrasKeys = {
  all: ["amostras"] as const,
  applicationsInfinite: (userId?: string, statuses?: readonly string[]) =>
    ["amostras", "applications", "infinite", userId, statuses] as const,
  applications: (userId?: string, filters?: SampleApplicationsFilters) =>
    [...amostrasKeys.all, "applications", userId, filters] as const,
  fulfillments: (userId?: string, filters?: SampleFulfillmentsFilters) =>
    [...amostrasKeys.all, "fulfillments", userId, filters] as const,
  detail: (userId?: string, params?: SampleApplicationDetailParams) =>
    [...amostrasKeys.all, "detail", userId, params] as const,
  label: (userId?: string, productId?: string) => [...amostrasKeys.all, "label", userId, productId] as const,
};

/**
 * Search Creator Sample Applications (202412) — lista as solicitações de amostra do
 * creator (id, produto/SKU, pedido, status e fulfillment resumido). Sem `total_count`
 * na resposta (só `next_page_token`). Escopo `creator.affiliate_collaboration.read`.
 */
export function useSampleApplications(filters: SampleApplicationsFilters) {
  const { user } = useAuth();
  return useQuery({
    queryKey: amostrasKeys.applications(user?.id, filters),
    queryFn: async ({ signal }) => {
      // `application_statuses` é de fato obrigatório: sem ele a TikTok responde
      // 98001004 "invalid status_list". Sem filtro do usuário, mandamos o enum
      // inteiro (equivale a "todos os status").
      const body: Record<string, unknown> = {
        application_statuses: filters.statuses?.length ? filters.statuses : ALL_APPLICATION_STATUSES,
      };
      const r = await callEndpoint<SearchCreatorSampleApplicationsData>(
        "searchCreatorSampleApplications",
        { query: { page_size: filters.pageSize ?? 20, page_token: filters.pageToken }, body },
        signal
      );
      if (!r.ok) throw new Error(r.error || "Falha ao carregar as solicitações de amostra");
      return r.data as SearchCreatorSampleApplicationsData;
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}

/**
 * Get Creator Sample Application Detail (202412) — detalhe de uma solicitação
 * específica. A lista (Search Creator Sample Applications) não devolve o campo `type`,
 * então quem chama esse hook a partir da lista deve assumir "FREE_SAMPLE" (fluxo
 * principal desta área); a partir dos Fulfillments dá pra usar `sample_application_type`
 * de fato. `enabled` só dispara com `productId` presente.
 */
export function useSampleApplicationDetail(params: SampleApplicationDetailParams) {
  const { user } = useAuth();
  return useQuery({
    queryKey: amostrasKeys.detail(user?.id, params),
    queryFn: async ({ signal }) => {
      const body: Record<string, unknown> = {
        product_id: params.productId,
        application_type: params.applicationType ?? "FREE_SAMPLE",
      };
      if (params.applicationId) body.application_id = params.applicationId;
      if (params.mainOrderId) body.main_order_id = params.mainOrderId;
      const r = await callEndpoint<GetCreatorSampleApplicationDetailData>(
        "getCreatorSampleApplicationDetail",
        { body },
        signal
      );
      if (!r.ok) throw new Error(r.error || "Falha ao carregar o detalhe da solicitação");
      return r.data as GetCreatorSampleApplicationDetailData;
    },
    enabled: !!user && !!params.productId,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}

/**
 * Creator Search Sample Application Fulfillments (202409) — envios/rastreio das
 * amostras aceitas (status do fulfillment, prazo, status do produto). `fulfillment_statuses`
 * é obrigatório pela API — sempre mandamos ao menos 1 valor. Sem paginação (a API não
 * expõe page_token pra esse endpoint) e sem nome de loja (só `shop_id`).
 */
export function useSampleApplicationFulfillments(filters: SampleFulfillmentsFilters) {
  const { user } = useAuth();
  return useQuery({
    queryKey: amostrasKeys.fulfillments(user?.id, filters),
    queryFn: async ({ signal }) => {
      const r = await callEndpoint<CreatorSearchSampleApplicationFulfillmentsData>(
        "creatorSearchSampleApplicationFulfillments",
        {
          query: { sort_field: filters.sortField, sort_order: filters.sortOrder },
          body: { fulfillment_statuses: filters.statuses },
        },
        signal
      );
      if (!r.ok) throw new Error(r.error || "Falha ao carregar os envios de amostra");
      return r.data as CreatorSearchSampleApplicationFulfillmentsData;
    },
    enabled: !!user && filters.statuses.length > 0,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}

/**
 * Get Creator Applicable Sample Label (202412) — checa se o creator pode solicitar
 * amostra grátis de UM produto específico (`product_id` obrigatório via query). Não
 * existe endpoint de creator pra "listar todos os produtos elegíveis" — é uma consulta
 * produto a produto, igual ao `shop_id` de Target Collaborations em Descoberta.
 */
export function useApplicableSampleLabel(productId: string) {
  const { user } = useAuth();
  return useQuery({
    queryKey: amostrasKeys.label(user?.id, productId),
    queryFn: async ({ signal }) => {
      const r = await callEndpoint<GetCreatorApplicableSampleLabelData>(
        "getCreatorApplicableSampleLabel",
        { query: { product_id: productId } },
        signal
      );
      if (!r.ok) throw new Error(r.error || "Falha ao verificar elegibilidade de amostra");
      return r.data as GetCreatorApplicableSampleLabelData;
    },
    enabled: !!user && !!productId,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}

/**
 * Creator Get Sample Request Deeplink (202512) — link que abre a solicitação de
 * amostra dentro do app da TikTok.
 *
 * Pré-condição verificada em produção: o produto precisa estar na vitrine do creator.
 * Fora disso a API responde 16032001 "please ensure creator has added product", que
 * é uma condição de uso, não falha do app — por isso a mensagem é traduzida aqui.
 */
export function useSampleRequestDeeplink() {
  return useMutation({
    mutationFn: async (input: { productId: string; skuId: string }) => {
      const r = await callEndpoint<CreatorGetSampleRequestDeeplinkData>(
        "creatorGetSampleRequestDeeplink",
        { query: { product_id: input.productId, sku_id: input.skuId } }
      );
      if (!r.ok) {
        if (/creator has added product/i.test(r.error || "")) {
          throw new Error(
            "Este produto precisa estar na sua vitrine antes de você solicitar a amostra."
          );
        }
        throw new Error(r.error || "Não foi possível gerar o link da solicitação");
      }
      return r.data as CreatorGetSampleRequestDeeplinkData;
    },
  });
}

/** Máximo aceito pela API neste endpoint (testado: 100 é recusado). */
export const SAMPLE_PAGE_SIZE = 50;

/**
 * Solicitações de amostra com rolagem infinita.
 *
 * O endpoint não devolve `total_count`, só `next_page_token` — não dá para mostrar
 * "x de y" nem pular páginas, então acumular conforme a rolagem é o modelo que
 * respeita o que a API oferece.
 */
export function useSampleApplicationsInfinite(statuses?: SampleApplicationStatus[]) {
  const { user } = useAuth();
  return useInfiniteQuery({
    queryKey: amostrasKeys.applicationsInfinite(user?.id, statuses),
    initialPageParam: undefined as string | undefined,
    queryFn: async ({ pageParam, signal }) => {
      const r = await callEndpoint<SearchCreatorSampleApplicationsData>(
        "searchCreatorSampleApplications",
        {
          query: { page_size: SAMPLE_PAGE_SIZE, page_token: pageParam },
          // Obrigatório: sem a lista, a API responde 98001004 "invalid status_list".
          body: { application_statuses: statuses?.length ? statuses : ALL_APPLICATION_STATUSES },
        },
        signal
      );
      if (!r.ok) throw new Error(r.error || "Falha ao carregar as solicitações de amostra");
      return r.data as SearchCreatorSampleApplicationsData;
    },
    getNextPageParam: (last) => last.next_page_token || undefined,
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}
