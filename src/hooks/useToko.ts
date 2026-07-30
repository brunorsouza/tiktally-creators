import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { callEndpoint } from "@/services/creatorClient";
import type { GetTokoProductMappersData, TokoProductMapperV2Data } from "@/types/creator-api.generated";

/**
 * Hooks da área Toko Mapper — conversão de ID de produto entre o formato Tokopedia
 * (`toko_pid`) e o formato TikTok Shop (`tts_pid`). Recurso exclusivo de agências/
 * creators cadastrados na Tokopedia (Indonésia); não se aplica ao mercado brasileiro
 * (aviso na própria página, `src/pages/TokoPage.tsx`).
 *
 * Os dois endpoints do manifesto têm a mesma entrada/saída:
 * - Body: `{ toko_pids: number[] }` — lista de IDs no formato Tokopedia.
 * - Resposta: `{ error?: { code, message }, product?: { toko_pid, tts_pid }[] }`.
 * Só diferem no método HTTP/versão e no escopo exigido:
 * - `getTokoProductMappers` (202606, `GET`) — sem escopo, `hasBody: true` mesmo
 *   sendo GET (o manifesto não lista query/path params — tudo vai no corpo; o
 *   client e o edge dispatcher cuidam de anexar o body na chamada).
 * - `tokoProductMapperV2` (202607, `POST`) — escopo `creator.affiliate.share_link.read`,
 *   hoje **ausente** no app TikTally-prod (ver docs/RELATORIO_ESCOPOS_MVP.md, item
 *   "Toko Mapper v2" na lista dos 4 endpoints bloqueados). Em mock funciona normal;
 *   em live tende a falhar por permissão até o pacote ser adicionado e re-autorizado.
 */

export const tokoKeys = {
  all: ["toko"] as const,
  mappers: (userId?: string, tokoPids?: number[]) => [...tokoKeys.all, "mappers", userId, tokoPids] as const,
};

/**
 * Get Toko Product Mappers (202606) — consulta sob demanda: o endpoint não tem um
 * modo "listar tudo", só devolve o mapeamento dos IDs Tokopedia informados. Por
 * isso o hook só dispara quando há ao menos um `toko_pid` na lista.
 */
export function useTokoProductMappers(tokoPids: number[]) {
  const { user } = useAuth();
  return useQuery({
    queryKey: tokoKeys.mappers(user?.id, tokoPids),
    queryFn: async ({ signal }) => {
      const r = await callEndpoint<GetTokoProductMappersData>(
        "getTokoProductMappers",
        { body: { toko_pids: tokoPids } },
        signal
      );
      if (!r.ok) throw new Error(r.error || "Falha ao consultar os mapeamentos Toko");
      return r.data as GetTokoProductMappersData;
    },
    enabled: !!user && tokoPids.length > 0,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}

/**
 * Toko Product Mapper V2 (202607) — cria/atualiza o mapeamento para os IDs
 * Tokopedia informados e devolve os `tts_pid` (TikTok Shop) correspondentes.
 */
export function useMapTokoProductV2() {
  return useMutation({
    mutationFn: async (tokoPids: number[]) => {
      const r = await callEndpoint<TokoProductMapperV2Data>("tokoProductMapperV2", {
        body: { toko_pids: tokoPids },
      });
      if (!r.ok) throw new Error(r.error || "Falha ao mapear os produtos Toko");
      return r.data as TokoProductMapperV2Data;
    },
  });
}
