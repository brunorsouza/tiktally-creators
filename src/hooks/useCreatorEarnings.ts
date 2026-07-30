import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { searchAffiliateOrders, type EarningsFilters } from "@/services/earnings";

export const earningsKeys = {
  all: ["creator-earnings"] as const,
  list: (userId?: string, filters?: EarningsFilters) =>
    [...earningsKeys.all, userId, filters ?? {}] as const,
};

/** Pedidos de afiliado do creator (base do Painel de Ganhos). */
export function useCreatorEarnings(filters: EarningsFilters = {}) {
  const { user } = useAuth();
  return useQuery({
    queryKey: earningsKeys.list(user?.id, filters),
    queryFn: ({ signal }) => searchAffiliateOrders(filters, signal),
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });
}
