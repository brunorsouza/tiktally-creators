import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { callEndpoint, type EndpointKey } from "@/services/creatorClient";
import { useAffiliateOrders, useAllAffiliateOrders, salesBaseOf, type GanhosFilters } from "@/hooks/useGanhos";
import { parseAmount } from "@/lib/formatters";
import type {
  GetVideoPerformancesData,
  GetLiveRoomCoreStatsData,
  GetLiveRoomGmvTrendData,
  GetLiveRoomViewTrendsData,
  GetLiveRoomTrafficPerformanceData,
  GetLiveRoomInteractiveTrendsData,
  GetLiveRoomProductStatsData,
  GetLiveRoomUserPortraitsData,
  GetLiveRoomInfoData,
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

export interface VideoPerformanceTotals {
  id: string;
  gmv: number;
  currency: string;
  orders: number;
  itemsSold: number;
  ctr: number;
  anchor: number;
  /** Início/fim cobertos pelos pontos somados — a página formata como data. */
  minStart?: number;
  maxEnd?: number;
}

/** Soma/agrega as métricas diárias (`performances[]`) de um vídeo num único total do período. */
export function aggregateVideoPerformance(
  v: NonNullable<GetVideoPerformancesData["videos"]>[number]
): VideoPerformanceTotals {
  const perfs = v.performances ?? [];
  let gmv = 0;
  let orders = 0;
  let itemsSold = 0;
  let ctrSum = 0;
  let anchorSum = 0;
  let currency = "BRL";
  let minStart: number | undefined;
  let maxEnd: number | undefined;
  for (const p of perfs) {
    const m = p.metrics;
    gmv += parseAmount(m?.gmv?.amount);
    if (m?.gmv?.currency) currency = m.gmv.currency;
    orders += m?.order_count ?? 0;
    itemsSold += m?.item_sold_count ?? 0;
    ctrSum += parseFloat(m?.click_through_rate ?? "0") || 0;
    anchorSum += parseFloat(m?.anchor_display_rate ?? "0") || 0;
    const s = p.time_range?.start_time;
    const e = p.time_range?.end_time;
    if (s != null) minStart = minStart == null ? s : Math.min(minStart, s);
    if (e != null) maxEnd = maxEnd == null ? e : Math.max(maxEnd, e);
  }
  const n = perfs.length || 1;
  return { id: v.id ?? "—", gmv, currency, orders, itemsSold, ctr: ctrSum / n, anchor: anchorSum / n, minStart, maxEnd };
}

/** KPIs agregados de um conjunto de vídeos já somados por `aggregateVideoPerformance`. */
export function aggregateVideoKpis(rows: VideoPerformanceTotals[]) {
  const gmv = rows.reduce((s, r) => s + r.gmv, 0);
  const orders = rows.reduce((s, r) => s + r.orders, 0);
  const itemsSold = rows.reduce((s, r) => s + r.itemsSold, 0);
  const avgCtr = rows.length ? rows.reduce((s, r) => s + r.ctr, 0) / rows.length : 0;
  const avgAnchor = rows.length ? rows.reduce((s, r) => s + r.anchor, 0) / rows.length : 0;
  const currency = rows[0]?.currency ?? "BRL";
  return { gmv, orders, itemsSold, avgCtr, avgAnchor, currency };
}

// =============== Ranking: receita x retorno por vídeo ===============

export interface ContentVideoRow {
  /** content_id do SKU em Search Creator Affiliate Orders — o MESMO identificador usado
   *  como video_id em Get Video Performances (é o que liga as duas fontes). */
  id: string;
  /**
   * Rótulo amigável do vídeo. Get Video Performances não devolve título nem thumbnail
   * (só métricas por id) — usamos o produto mais associado a esse content_id nos pedidos
   * de afiliado como nome de exibição; cai para "Vídeo {id}" quando não há pedido algum
   * (vídeo consultado manualmente, sem venda no período).
   */
  label: string;
  shopName?: string;
  /** Receita: GMV do vídeo no período — soma de `metrics.gmv` (Get Video Performances). */
  gmv: number;
  gmvCurrency: string;
  /** `order_count`/`item_sold_count` somados (Get Video Performances — granularidade diária). */
  ordersFromPerf: number;
  itemsSold: number;
  /** Média de `click_through_rate` no período (Get Video Performances). */
  ctr: number;
  /**
   * Retorno: comissão do vídeo no período — soma, por SKU com esse `content_id` e
   * `content_type === "VIDEO"` (Search Creator Affiliate Orders), de `actual_commission`
   * quando o pedido está SETTLED, senão `estimated_commission` (mesma regra de
   * resolução usada em Ganhos/Painel).
   */
  commission: number;
  commissionCurrency: string;
  /** Fatia da comissão acima ainda não liquidada (pedidos fora de SETTLED). */
  pendingCommission: number;
  /** Nº de pedidos de afiliado (linhas de SKU) que geraram a comissão acima. */
  ordersFromAffiliate: number;
  /** Teve retorno de Get Video Performances? Quando falso, só há dado de comissão (orders). */
  hasPerformance: boolean;
}

interface VideoOrdersAgg {
  commission: number;
  pendingCommission: number;
  salesBase: number;
  ordersCount: number;
  currency: string;
  shopName?: string;
  productNames: Map<string, number>;
}

/**
 * Cruza "quanto esse vídeo pagou de comissão" (Search Creator Affiliate Orders) com
 * "quanto de GMV esse vídeo gerou" (Get Video Performances) — a base do ranking de
 * receita x retorno em Analytics.
 *
 * Por que os dois: nenhum endpoint sozinho responde as duas perguntas. Orders traz
 * comissão, nome do produto e da loja, mas não GMV oficial nem CTR de vídeo — e
 * Get Video Performances traz GMV/CTR por vídeo, mas nenhuma informação de comissão
 * (ver docs/TIKTOK_AFFILIATE_CREATOR_API.md). O elo entre os dois é `content_id`
 * (orders, quando `content_type === "VIDEO"`) == `id` (video performances).
 *
 * Os video_ids consultados vêm 100% dos PRÓPRIOS pedidos do período — o creator não
 * precisa descobrir/colar IDs na mão para ver o ranking.
 */
export function useVideoContentPerformance(range: GanhosFilters) {
  const orders = useAllAffiliateOrders(range);

  const ordersAgg = useMemo(() => {
    const map = new Map<string, VideoOrdersAgg>();
    for (const o of orders.data?.orders ?? []) {
      const isSettled = o.status === "SETTLED";
      for (const s of o.skus ?? []) {
        if (s.content_type !== "VIDEO" || !s.content_id) continue;
        const row: VideoOrdersAgg = map.get(s.content_id) ?? {
          commission: 0,
          pendingCommission: 0,
          salesBase: 0,
          ordersCount: 0,
          currency: "BRL",
          productNames: new Map<string, number>(),
        };
        const actual = parseAmount(s.actual_commission?.amount);
        const estimate = parseAmount(s.estimated_commission?.amount);
        const resolved = isSettled ? actual || estimate : estimate;
        row.commission += resolved;
        if (!isSettled) row.pendingCommission += resolved;
        row.salesBase += salesBaseOf(s, o.status);
        row.ordersCount += 1;
        if (s.price?.currency) row.currency = s.price.currency;
        if (s.shop_name) row.shopName = s.shop_name;
        if (s.product_name) row.productNames.set(s.product_name, (row.productNames.get(s.product_name) ?? 0) + 1);
        map.set(s.content_id, row);
      }
    }
    return map;
  }, [orders.data]);

  const videoIds = useMemo(() => [...ordersAgg.keys()], [ordersAgg]);

  const perf = useVideoPerformances({
    videoIds,
    startTimeGe: range.createTimeGe,
    endTimeLe: range.createTimeLt,
  });

  const rows = useMemo<ContentVideoRow[]>(() => {
    const perfMap = new Map<string, VideoPerformanceTotals>();
    for (const v of perf.data?.videos ?? []) {
      if (!v.id) continue;
      perfMap.set(v.id, aggregateVideoPerformance(v));
    }
    const ids = new Set([...ordersAgg.keys(), ...perfMap.keys()]);
    return [...ids].map((id) => {
      const agg = ordersAgg.get(id);
      const p = perfMap.get(id);
      const topProduct = agg?.productNames.size
        ? [...agg.productNames.entries()].sort((a, b) => b[1] - a[1])[0][0]
        : undefined;
      return {
        id,
        label: topProduct ?? `Vídeo ${id}`,
        shopName: agg?.shopName,
        gmv: p?.gmv ?? 0,
        gmvCurrency: p?.currency ?? agg?.currency ?? "BRL",
        ordersFromPerf: p?.orders ?? 0,
        itemsSold: p?.itemsSold ?? 0,
        ctr: p?.ctr ?? 0,
        commission: agg?.commission ?? 0,
        commissionCurrency: agg?.currency ?? "BRL",
        pendingCommission: agg?.pendingCommission ?? 0,
        ordersFromAffiliate: agg?.ordersCount ?? 0,
        hasPerformance: !!p,
      };
    });
  }, [ordersAgg, perf.data]);

  // Mesma cautela de "sem resposta != zero" usada em Ganhos/Painel.
  const ordersNoData = orders.isPending && !orders.isError;
  const perfPending = videoIds.length > 0 && perf.isPending && !perf.isError;

  return {
    rows,
    videoIds,
    isLoading: orders.isLoading || ordersNoData || (videoIds.length > 0 && perf.isLoading) || perfPending,
    // Só bloqueia a aba inteira se os PEDIDOS falharem — sem eles não há retorno nem vídeos.
    error: orders.error,
    // Falha isolada do Get Video Performances (GMV) — escopo `creator.video.write`, hoje
    // inativo em live. NÃO derruba a aba: o retorno (comissão) vem dos pedidos e segue
    // válido; a receita/GMV fica "—" com um aviso até o escopo ser ativado.
    gmvError: perf.error,
  };
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

/**
 * Get Live Room Info (202309) — a sala de live "atual" da conta autenticada
 * (id/status/title/start_time), sem precisar de nenhum parâmetro de busca.
 *
 * Existe para alimentar os 7 endpoints acima sem o creator ter que descobrir e colar o
 * próprio `live_room_id` na mão: chama-se este endpoint primeiro, usa-se `data.id` como
 * `live_room_id` dos demais. Quando não há live em andamento (ou fora do mock), a tela
 * cai de volta no fluxo manual (ID digitado ou lives recentes vindas dos pedidos).
 */
export function useLiveRoomInfo() {
  const { user } = useAuth();
  return useQuery({
    queryKey: [...analyticsKeys.all, "live-room-info", user?.id] as const,
    queryFn: async ({ signal }) => {
      const r = await callEndpoint<GetLiveRoomInfoData>("getLiveRoomInfo", {}, signal);
      if (!r.ok) throw new Error(r.error || "Falha ao carregar a live atual");
      return r.data as GetLiveRoomInfoData;
    },
    enabled: !!user,
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

/**
 * Lives recentes do creator, derivadas dos pedidos de afiliado.
 *
 * A Affiliate Creator API não tem endpoint que liste "minhas salas de live", mas os
 * pedidos trazem `content_type: "LIVE"` com o `content_id` correspondente — e esse
 * `content_id` É o `live_room_id` aceito pelos 7 endpoints de /analytics/202502/live_rooms.
 * Sem isso o usuário teria que descobrir o ID por fora, o que torna a aba inutilizável.
 *
 * O período vem de fora (mesmo `range` do PeriodPicker da página) em vez de uma janela
 * fixa: os 7 endpoints de live room não aceitam filtro de data (cada um é de UMA sessão,
 * via `live_room_id`), então o único lugar onde "período" faz sentido na aba Live é aqui,
 * em ESCOLHER qual live analisar — não dentro da análise de uma live já escolhida.
 *
 * Retorna os IDs distintos, do mais recente para o mais antigo.
 */
export function useRecentLiveRooms(range: GanhosFilters, max = 8) {
  const orders = useAffiliateOrders({ ...range, pageSize: 50 });

  const liveRoomIds = useMemo(() => {
    const seen = new Map<string, number>();
    for (const o of orders.data?.orders ?? []) {
      for (const s of o.skus ?? []) {
        if (s.content_type !== "LIVE" || !s.content_id) continue;
        const t = o.create_time ?? 0;
        if (!seen.has(s.content_id) || t > (seen.get(s.content_id) as number)) {
          seen.set(s.content_id, t);
        }
      }
    }
    return [...seen.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, max)
      .map(([id, createTime]) => ({ id, createTime }));
  }, [orders.data, max]);

  return { liveRoomIds, isLoading: orders.isLoading || (orders.isPending && !orders.isError) };
}
