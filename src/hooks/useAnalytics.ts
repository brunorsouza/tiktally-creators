import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { callEndpoint, type EndpointKey } from "@/services/creatorClient";
import type {
  GetVideoPerformancesData,
  GetLiveRoomCoreStatsData,
  GetLiveRoomGmvTrendData,
  GetLiveRoomViewTrendsData,
  GetLiveRoomTrafficPerformanceData,
  GetLiveRoomInteractiveTrendsData,
  GetLiveRoomProductStatsData,
  GetLiveRoomUserPortraitsData,
} from "@/types/creator-api.generated";

/**
 * Hooks da área Analytics de creator: performance de vídeo (aba "Vídeos") e os 7
 * indicadores de sala de live (aba "Live"). Ver docs/TIKTOK_AFFILIATE_CREATOR_API.md,
 * seção "Analytics de conteúdo (creator scope)".
 *
 * Get Video Performances usa o escopo `creator.video.write` (pacote Content Posting),
 * que está INATIVO no app TikTally-prod hoje — mesma ressalva do Estúdio (ver
 * docs/RELATORIO_ESCOPOS_MVP.md). Em mock funciona normalmente; em live tende a falhar
 * por permissão até o pacote ser ativado.
 *
 * Os 7 endpoints de live room usam `creator.data.live.read.public` (pacote Live Data),
 * que está ATIVO no app — funcionam em live desde que se informe um `live_room_id`
 * válido (o ID de uma sala de live da própria conta).
 */

// =============== Vídeos ===============

export interface VideoPerformancesFilters {
  /** IDs de vídeo — todos precisam ser do mesmo autor. Limite de 100 por chamada. */
  videoIds: string[];
  /** Início do período (Unix, segundos) — só a parte de data é considerada pela API. */
  startTimeGe: number;
  /** Fim do período (Unix, segundos). */
  endTimeLe: number;
}

export const analyticsKeys = {
  all: ["analytics"] as const,
  videoPerformances: (userId?: string, filters?: VideoPerformancesFilters) =>
    [...analyticsKeys.all, "video-performances", userId, filters] as const,
  liveRoom: (metric: string, userId?: string, liveRoomId?: string) =>
    [...analyticsKeys.all, "live-room", metric, userId, liveRoomId] as const,
};

/**
 * Get Video Performances (202403) — métricas diárias por vídeo: anchor_display_rate,
 * click_through_rate, order_count, item_sold_count e gmv (objeto {amount,currency}).
 * Não retorna título nem thumbnail do vídeo (só métricas por `id`). `video_ids` vai
 * como string separada por vírgula na query, `start_time_ge`/`end_time_le` delimitam
 * o período (máx. 180 dias). `enabled` só dispara com ao menos 1 video_id.
 */
export function useVideoPerformances(filters: VideoPerformancesFilters) {
  const { user } = useAuth();
  return useQuery({
    queryKey: analyticsKeys.videoPerformances(user?.id, filters),
    queryFn: async ({ signal }) => {
      const r = await callEndpoint<GetVideoPerformancesData>(
        "getVideoPerformances",
        {
          query: {
            video_ids: filters.videoIds.join(","),
            start_time_ge: filters.startTimeGe,
            end_time_le: filters.endTimeLe,
          },
        },
        signal
      );
      if (!r.ok) throw new Error(r.error || "Falha ao carregar a performance dos vídeos");
      return r.data as GetVideoPerformancesData;
    },
    enabled: !!user && filters.videoIds.length > 0,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}

// =============== Live room (7 endpoints, todos GET com só {live_room_id} no path) ===============

/** Helper interno — os 7 endpoints de live room compartilham a mesma forma (GET, um único
 *  path param, sem query/body). Reduz a repetição mantendo cada hook público nomeado e
 *  documentado individualmente logo abaixo. */
function useLiveRoomQuery<T>(endpoint: EndpointKey, metric: string, liveRoomId: string) {
  const { user } = useAuth();
  return useQuery({
    queryKey: analyticsKeys.liveRoom(metric, user?.id, liveRoomId),
    queryFn: async ({ signal }) => {
      const r = await callEndpoint<T>(endpoint, { pathParams: { live_room_id: liveRoomId } }, signal);
      if (!r.ok) throw new Error(r.error || "Falha ao carregar os dados da live");
      return r.data as T;
    },
    enabled: !!user && !!liveRoomId.trim(),
    staleTime: 60 * 1000,
    retry: 1,
  });
}

/** Get Live Room Core Stats (202502) — KPIs gerais da live: GMV, vendas, pedidos,
 *  compradores, visualizações, CTR, tempo médio assistido, pico de espectadores etc. */
export function useLiveRoomCoreStats(liveRoomId: string) {
  return useLiveRoomQuery<GetLiveRoomCoreStatsData>("getLiveRoomCoreStats", "core-stats", liveRoomId);
}

/** Get Live Room GMV Trend (202502) — série temporal por `stats_type`: TREND_GMV (gmv.amount)
 *  e TREND_CREATED_ORDER (order_count), cada uma com seus próprios `data_points` (timestamp). */
export function useLiveRoomGmvTrend(liveRoomId: string) {
  return useLiveRoomQuery<GetLiveRoomGmvTrendData>("getLiveRoomGmvTrend", "gmv-trend", liveRoomId);
}

/** Get Live Room View Trends (202502) — série temporal de espectadores por `stats_type`:
 *  TREND_ONLINE_VIEWER, TREND_ENTER_VIEWER, TREND_LEFT_VIEWER (`data_points[].value` é string). */
export function useLiveRoomViewTrends(liveRoomId: string) {
  return useLiveRoomQuery<GetLiveRoomViewTrendsData>("getLiveRoomViewTrends", "view-trends", liveRoomId);
}

/** Get Live Room Traffic Performance (202502) — breakdown de fontes de tráfego: cada
 *  `source` (nome + watch_pv) com sua lista de `sub_sources`. */
export function useLiveRoomTrafficPerformance(liveRoomId: string) {
  return useLiveRoomQuery<GetLiveRoomTrafficPerformanceData>("getLiveRoomTrafficPerformance", "traffic", liveRoomId);
}

/** Get Live Room Interactive Trends (202502) — série temporal por `stats_type`: WATCH_PV,
 *  COMMENT_PV, SHARE_PV (`data_points[].value` é string). */
export function useLiveRoomInteractiveTrends(liveRoomId: string) {
  return useLiveRoomQuery<GetLiveRoomInteractiveTrendsData>(
    "getLiveRoomInteractiveTrends",
    "interactive-trends",
    liveRoomId
  );
}

/** Get Live Room Product Stats (202502) — lista de produtos exibidos/vendidos na live,
 *  com GMV, preço médio, pedidos, cliques, exposição e estoque por produto. */
export function useLiveRoomProductStats(liveRoomId: string) {
  return useLiveRoomQuery<GetLiveRoomProductStatsData>("getLiveRoomProductStats", "product-stats", liveRoomId);
}

/** Get Live Room User Portraits (202502) — demografia da audiência: gênero, idade, fãs
 *  (seguidor/não-seguidor) e região, em duas versões (todos os espectadores / só anúncios
 *  pagos — prefixo `all_` vs `paid_`). `region_indicators.value` já vem como share rate ×10.000. */
export function useLiveRoomUserPortraits(liveRoomId: string) {
  return useLiveRoomQuery<GetLiveRoomUserPortraitsData>("getLiveRoomUserPortraits", "user-portraits", liveRoomId);
}
