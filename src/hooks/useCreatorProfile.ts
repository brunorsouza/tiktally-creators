import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { callEndpoint } from "@/services/creatorClient";
import type { GetCreatorProfileData } from "@/types/creator-api.generated";

export const profileKeys = {
  all: ["creator-profile"] as const,
  me: (userId?: string) => [...profileKeys.all, userId] as const,
};

/** Perfil do creator conectado (Get Creator Profile, 202508). Passa pelo creatorClient (mock/live). */
export function useCreatorProfile() {
  const { user } = useAuth();
  return useQuery({
    queryKey: profileKeys.me(user?.id),
    queryFn: async ({ signal }) => {
      const r = await callEndpoint<GetCreatorProfileData>("getCreatorProfile", {}, signal);
      if (!r.ok) throw new Error(r.error || "Falha ao carregar o perfil");
      return r.data as GetCreatorProfileData;
    },
    enabled: !!user,
    staleTime: 10 * 60 * 1000,
    retry: 1,
  });
}
