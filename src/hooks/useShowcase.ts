import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { callEndpoint } from "@/services/creatorClient";
import type { GetShowcaseProductsData } from "@/types/creator-api.generated";

/** Máximo aceito pela API (range documentado: [1-20]). */
export const SHOWCASE_PAGE_SIZE = 20;

/** `origin` é OBRIGATÓRIO na API: de onde vem a consulta da vitrine. */
export type ShowcaseOrigin = "SHOWCASE" | "LIVE";

export const showcaseKeys = {
  infinite: (userId?: string, origin?: ShowcaseOrigin) =>
    ["showcase", "infinite", userId, origin] as const,
  all: ["showcase"] as const,
  list: (userId?: string, origin?: ShowcaseOrigin, pageToken?: string) =>
    [...showcaseKeys.all, "list", userId, origin, pageToken] as const,
};

/**
 * Get Showcase Products (202405) — produtos na vitrine do creator.
 *
 * Dois parâmetros que a API exige e que faltavam:
 * - `origin` é Required (SHOWCASE | LIVE). Sem ele a TikTok devolve
 *   36009004 "Origin is a required field and has not been provided."
 * - `page_size` tem range válido [1-20]; 50 era rejeitado.
 *
 * Pagina por `page_token` (cursor só pra frente — a API não devolve token de volta).
 */
export function useShowcaseProducts(origin: ShowcaseOrigin = "SHOWCASE", pageToken?: string) {
  const { user } = useAuth();
  return useQuery({
    queryKey: showcaseKeys.list(user?.id, origin, pageToken),
    queryFn: async ({ signal }) => {
      const r = await callEndpoint<GetShowcaseProductsData>(
        "getShowcaseProducts",
        { query: { page_size: SHOWCASE_PAGE_SIZE, origin, page_token: pageToken } },
        signal
      );
      if (!r.ok) throw new Error(r.error || "Falha ao carregar a vitrine");
      return r.data as GetShowcaseProductsData;
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });
}

function useShowcaseMutation(key: "addShowcaseProducts" | "removeShowcaseProducts" | "topShowcaseProducts") {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: Record<string, unknown>) => {
      const r = await callEndpoint(key, { body });
      if (!r.ok) throw new Error(r.error || "Operação falhou");
      return r;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: showcaseKeys.all }),
  });
}

/** Add Showcase Products (202405). Body: { add_type: "PRODUCT_ID", product_ids: [...] }. */
export function useAddShowcaseProducts() {
  return useShowcaseMutation("addShowcaseProducts");
}
/** Remove Showcase Products (202409). Body: { product_ids: [...] }. */
export function useRemoveShowcaseProducts() {
  return useShowcaseMutation("removeShowcaseProducts");
}
/** Top Showcase Products (202409). Body: { product_ids: [...] } (ordem = prioridade). */
export function useTopShowcaseProducts() {
  return useShowcaseMutation("topShowcaseProducts");
}

/**
 * Vitrine com rolagem infinita.
 *
 * A API devolve no máximo 20 itens por página e o cursor (`next_page_token`) só anda
 * pra frente — com centenas de produtos, paginar por botão obriga o creator a clicar
 * dezenas de vezes. Aqui cada página é acumulada e a tela pede a próxima quando o fim
 * da lista se aproxima.
 */
export function useShowcaseProductsInfinite(origin: ShowcaseOrigin = "SHOWCASE") {
  const { user } = useAuth();
  return useInfiniteQuery({
    queryKey: showcaseKeys.infinite(user?.id, origin),
    initialPageParam: undefined as string | undefined,
    queryFn: async ({ pageParam, signal }) => {
      const r = await callEndpoint<GetShowcaseProductsData>(
        "getShowcaseProducts",
        { query: { page_size: SHOWCASE_PAGE_SIZE, origin, page_token: pageParam } },
        signal
      );
      if (!r.ok) throw new Error(r.error || "Falha ao carregar a vitrine");
      return r.data as GetShowcaseProductsData;
    },
    // Sem token não há próxima página — evita loop infinito no fim da lista.
    getNextPageParam: (last) => last.next_page_token || undefined,
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });
}
