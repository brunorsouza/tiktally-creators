import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { callEdge } from "@/services/tiktok-creator";
import { USE_MOCK } from "@/services/creatorClient";

/**
 * Estado da conexão da conta de creator do usuário logado.
 * Vem da edge `account-connection` (action:"status") — só campos não-secretos.
 */
export interface CreatorConnectionStatus {
  connected: boolean;
  creator_open_id?: string;
  region?: string;
  scopes?: string[];
  expires_at?: string | null;
  connected_at?: string | null;
  /** Quando a autorização (refresh_token) morre de vez. */
  refresh_expires_at?: string | null;
  /** Último refresh automático do access_token. */
  last_refreshed_at?: string | null;
  /**
   * O access_token está vencido. Informativo: o servidor o renova sozinho na
   * próxima chamada. Não é motivo para pedir nada ao creator.
   */
  expired?: boolean;
  /**
   * A autorização venceu (ou foi revogada) e nem o refresh salva — este sim
   * exige que o creator reconecte a conta.
   */
  needs_reauth?: boolean;
}

export const connectionKeys = {
  all: ["creator-connection"] as const,
  me: (userId?: string) => [...connectionKeys.all, userId] as const,
};

/** Escopos que o token da @louiselanza tinha em 20/08 — usado só no modo mock. */
const MOCK_STATUS: CreatorConnectionStatus = {
  connected: true,
  creator_open_id: "mock-open-id",
  region: "BR",
  scopes: [
    "creator.affiliate.info",
    "creator.showcase.read",
    "creator.showcase.write",
    "creator.affiliate_collaboration.read",
    "creator.affiliate.link.write",
    "creator.data.live.read.public",
  ],
  expires_at: null,
  connected_at: null,
  refresh_expires_at: null,
  last_refreshed_at: null,
  expired: false,
  needs_reauth: false,
};

/** Lê o status da conexão do creator (conectado? quais escopos? expira quando?). */
export function useCreatorConnection() {
  const { user } = useAuth();
  return useQuery({
    queryKey: connectionKeys.me(user?.id),
    queryFn: async ({ signal }): Promise<CreatorConnectionStatus> => {
      if (USE_MOCK) return MOCK_STATUS;
      return await callEdge<CreatorConnectionStatus>(
        "account-connection",
        { action: "status" },
        signal
      );
    },
    enabled: !!user,
    staleTime: 60 * 1000,
    retry: 1,
  });
}

/**
 * Desconecta a conta de creator (apaga o token no servidor). Ao concluir,
 * invalida TUDO — a conexão, o perfil e qualquer dado de creator já carregado —
 * pra o app refletir o estado desconectado na hora.
 */
export function useDisconnectCreator() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (USE_MOCK) return { ok: true, disconnected: true };
      return await callEdge<{ ok: boolean; disconnected: boolean }>("account-connection", {
        action: "disconnect",
      });
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: connectionKeys.all });
      await qc.invalidateQueries({ queryKey: ["creator-profile"] });
      // demais dados dependentes da conexão (ganhos, analytics, vitrine, etc.)
      qc.invalidateQueries();
    },
  });
}
