import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { callEndpoint } from "@/services/creatorClient";
import type { GetShowcaseProductsData } from "@/types/creator-api.generated";

export const showcaseKeys = {
  all: ["showcase"] as const,
  list: (userId?: string) => [...showcaseKeys.all, "list", userId] as const,
};

/** Get Showcase Products (202405) — produtos na vitrine do creator. */
export function useShowcaseProducts() {
  const { user } = useAuth();
  return useQuery({
    queryKey: showcaseKeys.list(user?.id),
    queryFn: async ({ signal }) => {
      const r = await callEndpoint<GetShowcaseProductsData>(
        "getShowcaseProducts",
        { query: { page_size: 50 } },
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
