import { useMemo, useState, type FormEvent } from "react";
import {
  Video,
  Radio,
  Wallet,
  ShoppingBag,
  PackageCheck,
  Users,
  Eye,
  Flame,
  UserPlus,
  Ticket,
  Calendar,
  Search,
  Film,
  MousePointerClick,
  Gauge,
  LineChart as LineChartIcon,
  MessageCircle,
  Radar,
  Globe2,
  Signal,
  AlertCircle,
  Package,
  ShieldAlert,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard } from "@/components/StatCard";
import {
  useVideoPerformances,
  useLiveRoomCoreStats,
  useLiveRoomGmvTrend,
  useLiveRoomViewTrends,
  useLiveRoomTrafficPerformance,
  useLiveRoomInteractiveTrends,
  useLiveRoomProductStats,
  useLiveRoomUserPortraits,
  type VideoPerformancesFilters,
} from "@/hooks/useAnalytics";
import { USE_MOCK } from "@/services/creatorClient";
import { formatCurrency, formatMoney, formatNumber, formatPercent, formatDate, abbreviateNumber } from "@/lib/formatters";
import type { GetVideoPerformancesData, GetLiveRoomTrafficPerformanceData } from "@/types/creator-api.generated";

/**
 * Analytics de creator: aba "Vídeos" (Get Video Performances — gated, `creator.video.write`
 * inativo) e aba "Live" (7 endpoints de live room, `creator.data.live.read.public` ativo).
 * Ver docs/TIKTOK_AFFILIATE_CREATOR_API.md, seção "Analytics de conteúdo (creator scope)".
 */

// =============== Helpers compartilhados ===============

const textareaClass =
  "flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

/** Aceita IDs separados por vírgula, ponto-e-vírgula ou quebra de linha. */
function parseLines(raw: string): string[] {
  return raw
    .split(/[\n,;]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Alguns valores mock vêm com símbolo de moeda embutido — limpa antes de parsear. */
function parseAmount(amount?: string | number | null): number {
  if (amount == null) return 0;
  if (typeof amount === "number") return Number.isFinite(amount) ? amount : 0;
  const n = parseFloat(amount.replace(/[^0-9.-]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

/** formatCurrency com fallback — nunca derruba a tela se vier um código de moeda inválido do fixture. */
function money(amount: number, currency?: string): string {
  try {
    return formatCurrency(amount, currency || "BRL");
  } catch {
    return `${amount.toFixed(2)} ${currency ?? ""}`.trim();
  }
}

/** avg_watching_duration vem em segundos — formata "m:ss". */
function formatDuration(seconds?: number): string {
  if (seconds == null || !Number.isFinite(seconds) || seconds < 0) return "—";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

/** Humaniza nomes de fonte de tráfego (ex.: "card_click" → "Card click") — a doc não lista
 *  um enum fechado de valores possíveis, então só normalizamos, sem inventar tradução. */
function humanize(raw?: string): string {
  if (!raw) return "—";
  return raw.replace(/[_-]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function EmptyState({ icon: Icon, text }: { icon: LucideIcon; text: string }) {
  return (
    <div className="flex flex-col items-center gap-2 py-12 text-center text-muted-foreground">
      <Icon className="h-8 w-8" />
      <p className="text-sm">{text}</p>
    </div>
  );
}

function ErrorBanner({ text }: { text: string }) {
  return (
    <Card className="border-destructive/30 bg-destructive/5">
      <CardContent className="flex items-start gap-3 p-4 text-sm">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
        <span>{text}</span>
      </CardContent>
    </Card>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-muted/30 p-3">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm font-semibold">{value}</p>
    </div>
  );
}

// =============== Gráfico de tendência (compartilhado por GMV / views / interações) ===============

interface TrendPoint {
  timestamp: number;
  [key: string]: number;
}

interface TrendLineDef {
  dataKey: string;
  name: string;
  color: string;
  yAxisId?: "left" | "right";
  valueFormatter?: (value: number) => string;
}

const DEFAULT_LINE_COLOR = "hsl(var(--accent-foreground))";

/** Formata timestamp Unix (segundos) como HH:mm, no fuso local do navegador. */
function formatClock(ts: number): string {
  if (!Number.isFinite(ts)) return "";
  return new Date(ts * 1000).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

function TrendChart({
  data,
  lines,
  height = 260,
  yFormatterLeft,
  yFormatterRight,
}: {
  data: TrendPoint[];
  lines: TrendLineDef[];
  height?: number;
  yFormatterLeft?: (value: number) => string;
  yFormatterRight?: (value: number) => string;
}) {
  const hasRight = lines.some((l) => l.yAxisId === "right");
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 8, right: hasRight ? 16 : 24, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis
          dataKey="timestamp"
          tickFormatter={(ts) => formatClock(Number(ts))}
          tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
          stroke="hsl(var(--border))"
          minTickGap={24}
        />
        <YAxis
          yAxisId="left"
          tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
          tickFormatter={(v) => (yFormatterLeft ? yFormatterLeft(Number(v)) : abbreviateNumber(Number(v)))}
          stroke="hsl(var(--border))"
          width={54}
        />
        {hasRight && (
          <YAxis
            yAxisId="right"
            orientation="right"
            tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
            tickFormatter={(v) => (yFormatterRight ? yFormatterRight(Number(v)) : abbreviateNumber(Number(v)))}
            stroke="hsl(var(--border))"
            width={54}
          />
        )}
        <Tooltip
          labelFormatter={(ts) => formatClock(Number(ts))}
          formatter={(value, name) => {
            const line = lines.find((l) => l.name === name);
            const num = typeof value === "number" ? value : parseFloat(String(value));
            const text = line?.valueFormatter ? line.valueFormatter(num) : formatNumber(num);
            return [text, String(name)] as [string, string];
          }}
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "0.5rem",
            fontSize: "12px",
          }}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        {lines.map((l) => (
          <Line
            key={l.dataKey}
            type="monotone"
            dataKey={l.dataKey}
            name={l.name}
            yAxisId={l.yAxisId ?? "left"}
            stroke={l.color}
            strokeWidth={2}
            dot={{ r: 2 }}
            activeDot={{ r: 4 }}
            connectNulls
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

interface GmvTrendSeries {
  stats_type?: string;
  data_points?: { order_count?: number; timestamp?: number; gmv?: { amount?: string; currency?: string } }[];
}

/** Junta as séries TREND_GMV/TREND_CREATED_ORDER num único array por timestamp. */
function buildGmvTrendData(series: GmvTrendSeries[]): TrendPoint[] {
  const map = new Map<number, TrendPoint>();
  for (const s of series) {
    for (const p of s.data_points ?? []) {
      if (p.timestamp == null) continue;
      const point = map.get(p.timestamp) ?? { timestamp: p.timestamp };
      if (s.stats_type === "TREND_GMV" && p.gmv?.amount != null) point.gmv = parseFloat(p.gmv.amount) || 0;
      if (s.stats_type === "TREND_CREATED_ORDER" && p.order_count != null) point.orders = p.order_count;
      map.set(p.timestamp, point);
    }
  }
  return Array.from(map.values()).sort((a, b) => a.timestamp - b.timestamp);
}

interface CountTrendSeries {
  stats_type?: string;
  data_points?: { value?: string; timestamp?: number }[];
}

/** Junta séries de contagem (views/interações) num único array por timestamp, uma chave por stats_type. */
function buildCountTrendData(series: CountTrendSeries[]): TrendPoint[] {
  const map = new Map<number, TrendPoint>();
  for (const s of series) {
    const type = s.stats_type;
    if (!type) continue;
    for (const p of s.data_points ?? []) {
      if (p.timestamp == null) continue;
      const point = map.get(p.timestamp) ?? { timestamp: p.timestamp };
      point[type] = p.value != null ? parseFloat(p.value) || 0 : 0;
      map.set(p.timestamp, point);
    }
  }
  return Array.from(map.values()).sort((a, b) => a.timestamp - b.timestamp);
}

const VIEW_TREND_LABELS: Record<string, string> = {
  TREND_ONLINE_VIEWER: "Online",
  TREND_ENTER_VIEWER: "Entraram",
  TREND_LEFT_VIEWER: "Saíram",
};
const VIEW_TREND_COLORS: Record<string, string> = {
  TREND_ONLINE_VIEWER: "hsl(var(--primary))",
  TREND_ENTER_VIEWER: "hsl(var(--success))",
  TREND_LEFT_VIEWER: "hsl(var(--destructive))",
};

const INTERACTIVE_TREND_LABELS: Record<string, string> = {
  WATCH_PV: "Visualizações",
  COMMENT_PV: "Comentários",
  SHARE_PV: "Compartilhamentos",
};
const INTERACTIVE_TREND_COLORS: Record<string, string> = {
  WATCH_PV: "hsl(var(--primary))",
  COMMENT_PV: "hsl(var(--info))",
  SHARE_PV: "hsl(var(--success))",
};

// =============== Página ===============

export default function AnalyticsPage() {
  const [tab, setTab] = useState<"videos" | "live">("videos");

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="animate-slide-up">
          <h1 className="text-2xl font-bold tracking-tight">Analytics de creator</h1>
          <p className="text-muted-foreground">Performance por vídeo e por sala de live (creator scope).</p>
        </div>
        <Badge variant={USE_MOCK ? "warning" : "success"} className="mt-1 shrink-0">
          {USE_MOCK ? "Mock" : "Live"}
        </Badge>
      </header>

      <Card>
        <CardContent className="flex flex-wrap gap-2 p-4">
          <Button variant={tab === "videos" ? "default" : "outline"} onClick={() => setTab("videos")} className="gap-2">
            <Video className="h-4 w-4" /> Vídeos
          </Button>
          <Button variant={tab === "live" ? "default" : "outline"} onClick={() => setTab("live")} className="gap-2">
            <Radio className="h-4 w-4" /> Live
          </Button>
        </CardContent>
      </Card>

      {tab === "videos" ? <VideosTab /> : <LiveTab />}
    </div>
  );
}

// =============== Aba 1: Vídeos ===============

const VIDEO_PERIODS = [
  { days: 7, label: "Últimos 7 dias" },
  { days: 30, label: "Últimos 30 dias" },
  { days: 90, label: "Últimos 90 dias" },
] as const;

function videoPeriodRange(days: number) {
  const now = Math.floor(Date.now() / 1000);
  return { startTimeGe: now - days * 24 * 3600, endTimeLe: now };
}

const DEFAULT_VIDEO_ID = "7271486684427046149";

interface VideoRow {
  id: string;
  period: string;
  gmv: number;
  currency: string;
  orders: number;
  itemsSold: number;
  ctr: number;
  anchor: number;
}

/** Soma/agrega as métricas diárias (`performances[]`) de um vídeo num único total do período. */
function aggregateVideo(v: NonNullable<GetVideoPerformancesData["videos"]>[number]): VideoRow {
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
  const period =
    minStart != null && maxEnd != null
      ? minStart === maxEnd
        ? formatDate(minStart)
        : `${formatDate(minStart)} – ${formatDate(maxEnd)}`
      : "—";
  return { id: v.id ?? "—", period, gmv, currency, orders, itemsSold, ctr: ctrSum / n, anchor: anchorSum / n };
}

function aggregateVideoKpis(rows: VideoRow[]) {
  const gmv = rows.reduce((s, r) => s + r.gmv, 0);
  const orders = rows.reduce((s, r) => s + r.orders, 0);
  const itemsSold = rows.reduce((s, r) => s + r.itemsSold, 0);
  const avgCtr = rows.length ? rows.reduce((s, r) => s + r.ctr, 0) / rows.length : 0;
  const avgAnchor = rows.length ? rows.reduce((s, r) => s + r.anchor, 0) / rows.length : 0;
  const currency = rows[0]?.currency ?? "BRL";
  return { gmv, orders, itemsSold, avgCtr, avgAnchor, currency };
}

function VideoGatingBanner() {
  return (
    <Card className="border-warning/30 bg-warning/10">
      <CardContent className="flex items-start gap-3 p-4 text-sm">
        <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
        <div className="space-y-1">
          <p className="font-medium">Performance de vídeo exige um escopo hoje inativo</p>
          <p className="text-muted-foreground">
            Get Video Performances pede o escopo <code className="rounded bg-background/60 px-1 py-0.5 text-xs">creator.video.write</code>{" "}
            (pacote <strong>Content Posting</strong>), que hoje está <strong>inativo</strong> no app — mesma ressalva do Estúdio de
            conteúdo (ver <code className="text-xs">docs/RELATORIO_ESCOPOS_MVP.md</code>). Em modo live essa chamada tende a falhar por
            permissão até o pacote ser ativado. Em modo mock funciona normalmente.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function VideosTab() {
  const [idsInput, setIdsInput] = useState(USE_MOCK ? DEFAULT_VIDEO_ID : "");
  const [appliedIds, setAppliedIds] = useState<string[]>(USE_MOCK ? [DEFAULT_VIDEO_ID] : []);
  const [days, setDays] = useState<7 | 30 | 90>(30);

  const range = useMemo(() => videoPeriodRange(days), [days]);
  const filters: VideoPerformancesFilters = useMemo(() => ({ videoIds: appliedIds, ...range }), [appliedIds, range]);
  const { data, isLoading, error } = useVideoPerformances(filters);
  const rows = useMemo(() => (data?.videos ?? []).map(aggregateVideo), [data]);
  const kpis = useMemo(() => aggregateVideoKpis(rows), [rows]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const ids = parseLines(idsInput);
    if (ids.length === 0) {
      toast.error("Informe ao menos um ID de vídeo");
      return;
    }
    if (ids.length > 100) {
      toast.error("Máximo de 100 IDs por consulta (todos do mesmo autor)");
      return;
    }
    setAppliedIds(ids);
  };

  return (
    <div className="space-y-6">
      {!USE_MOCK && <VideoGatingBanner />}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Video className="h-4 w-4" /> Performance dos vídeos
          </CardTitle>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Get Video Performances (202403) — GMV, pedidos, itens vendidos e engajamento por vídeo. A API não retorna
            título nem thumbnail (só as métricas por video_id).
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">
                IDs dos vídeos (um por linha ou separados por vírgula — todos do mesmo autor, máx. 100)
              </Label>
              <textarea
                rows={2}
                className={textareaClass}
                placeholder="7271486684427046149"
                value={idsInput}
                onChange={(e) => setIdsInput(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
                <Calendar className="h-4 w-4" /> Período
              </span>
              <div className="flex flex-wrap gap-2">
                {VIDEO_PERIODS.map((p) => (
                  <Button
                    key={p.days}
                    type="button"
                    size="sm"
                    variant={days === p.days ? "default" : "outline"}
                    onClick={() => setDays(p.days)}
                  >
                    {p.label}
                  </Button>
                ))}
              </div>
              <Button type="submit" className="ml-auto gap-2">
                <Search className="h-4 w-4" /> Consultar
              </Button>
            </div>
          </form>

          {appliedIds.length === 0 ? (
            <EmptyState icon={Video} text="Informe ao menos um ID de vídeo para consultar a performance." />
          ) : error ? (
            <ErrorBanner
              text={`Não foi possível carregar a performance dos vídeos: ${(error as Error).message}${
                !USE_MOCK ? ' Confira se o escopo "creator.video.write" está ativo no app.' : ""
              }`}
            />
          ) : isLoading ? (
            <>
              <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <StatCard key={i} label="—" value="" loading />
                ))}
              </section>
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            </>
          ) : rows.length === 0 ? (
            <EmptyState icon={Video} text="Nenhuma performance encontrada para os vídeos/período informados." />
          ) : (
            <>
              <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <StatCard label="GMV total" value={money(kpis.gmv, kpis.currency)} icon={Wallet} accent="primary" />
                <StatCard label="Pedidos" value={formatNumber(kpis.orders)} icon={ShoppingBag} accent="info" />
                <StatCard label="Itens vendidos" value={formatNumber(kpis.itemsSold)} icon={PackageCheck} accent="success" />
                <StatCard label="CTR médio" value={formatPercent(kpis.avgCtr, 1)} icon={MousePointerClick} accent="warning" />
                <StatCard label="Exibição da âncora (média)" value={formatPercent(kpis.avgAnchor, 1)} icon={Eye} accent="primary" />
              </section>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
                      <th className="pb-2 pr-4 font-medium">Vídeo</th>
                      <th className="pb-2 pr-4 text-right font-medium">GMV</th>
                      <th className="pb-2 pr-4 text-right font-medium">Pedidos</th>
                      <th className="pb-2 pr-4 text-right font-medium">Itens vendidos</th>
                      <th className="pb-2 pr-4 text-right font-medium">CTR</th>
                      <th className="pb-2 text-right font-medium">Exibição da âncora</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {rows.map((row) => (
                      <tr key={row.id}>
                        <td className="py-3 pr-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                              <Film className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <div className="min-w-0">
                              <p className="whitespace-nowrap text-sm font-medium">Vídeo {row.id}</p>
                              <p className="text-xs text-muted-foreground">{row.period}</p>
                            </div>
                          </div>
                        </td>
                        <td className="whitespace-nowrap py-3 pr-4 text-right font-semibold">{money(row.gmv, row.currency)}</td>
                        <td className="whitespace-nowrap py-3 pr-4 text-right">{formatNumber(row.orders)}</td>
                        <td className="whitespace-nowrap py-3 pr-4 text-right">{formatNumber(row.itemsSold)}</td>
                        <td className="whitespace-nowrap py-3 pr-4 text-right">{formatPercent(row.ctr, 1)}</td>
                        <td className="whitespace-nowrap py-3 text-right">{formatPercent(row.anchor, 1)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// =============== Aba 2: Live ===============

function LiveTab() {
  const [idInput, setIdInput] = useState(USE_MOCK ? "7093488394589768494" : "");
  const [liveRoomId, setLiveRoomId] = useState(USE_MOCK ? idInput : "");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!idInput.trim()) return;
    setLiveRoomId(idInput.trim());
  };

  return (
    <div className="space-y-6">
      <Card className="border-info/30 bg-info/5">
        <CardContent className="flex items-start gap-3 p-4 text-sm">
          <Signal className="mt-0.5 h-4 w-4 shrink-0 text-info" />
          <p className="text-muted-foreground">
            Esses 7 indicadores usam o escopo <code className="rounded bg-background/60 px-1 py-0.5 text-xs">creator.data.live.read.public</code>{" "}
            (pacote <strong>Live Data</strong>), que está <strong>ativo</strong> no app — funcionam em modo live real, desde que você
            informe o ID de uma sala de live da própria conta.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1 space-y-1">
              <Label className="text-xs text-muted-foreground">live_room_id</Label>
              <Input value={idInput} onChange={(e) => setIdInput(e.target.value)} placeholder="7093488394589768494" />
            </div>
            <Button type="submit" className="gap-2" disabled={!idInput.trim()}>
              <Search className="h-4 w-4" /> Ver dashboard da live
            </Button>
          </form>
        </CardContent>
      </Card>

      {!liveRoomId ? (
        <Card>
          <CardContent>
            <EmptyState icon={Radio} text="Informe o ID de uma sala de live para ver o dashboard completo." />
          </CardContent>
        </Card>
      ) : (
        <>
          <CoreStatsSection liveRoomId={liveRoomId} />
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <GmvTrendSection liveRoomId={liveRoomId} />
            <ViewTrendSection liveRoomId={liveRoomId} />
          </div>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <InteractiveTrendSection liveRoomId={liveRoomId} />
            <TrafficSection liveRoomId={liveRoomId} />
          </div>
          <ProductStatsSection liveRoomId={liveRoomId} />
          <UserPortraitsSection liveRoomId={liveRoomId} />
        </>
      )}
    </div>
  );
}

/** Get Live Room Core Stats (202502) — KPIs gerais + um segundo bloco com métricas secundárias. */
function CoreStatsSection({ liveRoomId }: { liveRoomId: string }) {
  const { data, isLoading, error } = useLiveRoomCoreStats(liveRoomId);
  const stats = data?.stats;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Gauge className="h-4 w-4" /> KPIs da live
        </CardTitle>
        <p className="mt-0.5 text-xs text-muted-foreground">Get Live Room Core Stats (202502)</p>
      </CardHeader>
      <CardContent className="space-y-5">
        {error ? (
          <ErrorBanner text={`Não foi possível carregar os KPIs: ${(error as Error).message}`} />
        ) : !isLoading && !stats ? (
          <EmptyState icon={Gauge} text="Nenhum dado retornado para essa live." />
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              <StatCard label="GMV" value={formatMoney(stats?.local_gmv)} icon={Wallet} accent="primary" loading={isLoading} />
              <StatCard label="Itens vendidos" value={formatNumber(stats?.sales ?? 0)} icon={ShoppingBag} accent="info" loading={isLoading} />
              <StatCard
                label="Pedidos pagos"
                value={formatNumber(stats?.paid_order_count ?? 0)}
                icon={PackageCheck}
                accent="success"
                loading={isLoading}
              />
              <StatCard label="Compradores" value={formatNumber(stats?.buyer_count ?? 0)} icon={Users} accent="warning" loading={isLoading} />
              <StatCard label="Visualizações" value={formatNumber(stats?.watch_pv ?? 0)} icon={Eye} accent="primary" loading={isLoading} />
              <StatCard
                label="Pico de espectadores"
                value={formatNumber(stats?.peak_concurrent_user_count ?? 0)}
                icon={Flame}
                accent="info"
                loading={isLoading}
              />
              <StatCard
                label="Novos seguidores"
                value={formatNumber(stats?.accumulated_new_follower_count ?? 0)}
                icon={UserPlus}
                accent="success"
                loading={isLoading}
              />
              <StatCard label="Ticket médio" value={formatMoney(stats?.local_unit_price)} icon={Ticket} accent="warning" loading={isLoading} />
            </div>

            {isLoading ? (
              <div className="grid grid-cols-2 gap-3 border-t pt-4 sm:grid-cols-3 lg:grid-cols-5">
                {Array.from({ length: 9 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              stats && (
                <div className="grid grid-cols-2 gap-3 border-t pt-4 sm:grid-cols-3 lg:grid-cols-5">
                  <MiniStat label="Pedidos criados" value={formatNumber(stats.created_order_count ?? 0)} />
                  <MiniStat label="Visitantes atuais" value={formatNumber(stats.current_visitor_count ?? 0)} />
                  <MiniStat label="Cliques em produto" value={formatNumber(stats.product_reach_count ?? 0)} />
                  <MiniStat label="Impressões de produto" value={formatNumber(stats.product_view_count ?? 0)} />
                  <MiniStat label="CTR (cliques/views)" value={formatPercent(parseFloat(stats.click_through_rate ?? "0") || 0, 1)} />
                  <MiniStat label="Conversão (pedido/clique)" value={formatPercent(parseFloat(stats.click_order_rate ?? "0") || 0, 1)} />
                  <MiniStat label="Comentários" value={formatNumber(stats.accumulated_comment_count ?? 0)} />
                  <MiniStat label="Compartilhamentos" value={formatNumber(stats.accumulated_sharing_count ?? 0)} />
                  <MiniStat label="Tempo médio assistido" value={formatDuration(stats.avg_watching_duration)} />
                </div>
              )
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

/** Get Live Room GMV Trend (202502) — TREND_GMV (eixo esquerdo, $) + TREND_CREATED_ORDER (eixo direito, contagem). */
function GmvTrendSection({ liveRoomId }: { liveRoomId: string }) {
  const { data, isLoading, error } = useLiveRoomGmvTrend(liveRoomId);
  const series = useMemo(() => data?.gmv_trend_performances ?? [], [data]);
  const points = useMemo(() => buildGmvTrendData(series), [series]);
  const currency = useMemo(
    () => series.flatMap((s) => s.data_points ?? []).find((p) => p.gmv?.currency)?.gmv?.currency || "BRL",
    [series]
  );
  const lines: TrendLineDef[] = useMemo(() => {
    const result: TrendLineDef[] = [];
    if (series.some((s) => s.stats_type === "TREND_GMV")) {
      result.push({
        dataKey: "gmv",
        name: "GMV",
        color: "hsl(var(--primary))",
        yAxisId: "left",
        valueFormatter: (v) => money(v, currency),
      });
    }
    if (series.some((s) => s.stats_type === "TREND_CREATED_ORDER")) {
      result.push({
        dataKey: "orders",
        name: "Pedidos",
        color: "hsl(var(--info))",
        yAxisId: "right",
        valueFormatter: (v) => formatNumber(v),
      });
    }
    return result;
  }, [series, currency]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <LineChartIcon className="h-4 w-4" /> Tendência de GMV
        </CardTitle>
        <p className="mt-0.5 text-xs text-muted-foreground">Get Live Room GMV Trend (202502)</p>
      </CardHeader>
      <CardContent>
        {error ? (
          <ErrorBanner text={`Não foi possível carregar a tendência de GMV: ${(error as Error).message}`} />
        ) : isLoading ? (
          <Skeleton className="h-64 w-full" />
        ) : points.length === 0 ? (
          <EmptyState icon={LineChartIcon} text="Sem pontos de tendência de GMV para essa live." />
        ) : (
          <TrendChart data={points} lines={lines} yFormatterLeft={(v) => abbreviateNumber(v)} yFormatterRight={(v) => formatNumber(v)} />
        )}
      </CardContent>
    </Card>
  );
}

/** Get Live Room View Trends (202502) — TREND_ONLINE_VIEWER / TREND_ENTER_VIEWER / TREND_LEFT_VIEWER. */
function ViewTrendSection({ liveRoomId }: { liveRoomId: string }) {
  const { data, isLoading, error } = useLiveRoomViewTrends(liveRoomId);
  const series = useMemo(() => data?.view_trend_performances ?? [], [data]);
  const points = useMemo(() => buildCountTrendData(series), [series]);
  const lines: TrendLineDef[] = useMemo(
    () =>
      series.map(
        (s): TrendLineDef => ({
          dataKey: s.stats_type ?? "unknown",
          name: (s.stats_type && VIEW_TREND_LABELS[s.stats_type]) || s.stats_type || "—",
          color: (s.stats_type && VIEW_TREND_COLORS[s.stats_type]) || DEFAULT_LINE_COLOR,
          valueFormatter: (v: number) => formatNumber(v),
        })
      ),
    [series]
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Eye className="h-4 w-4" /> Tendência de espectadores
        </CardTitle>
        <p className="mt-0.5 text-xs text-muted-foreground">Get Live Room View Trends (202502)</p>
      </CardHeader>
      <CardContent>
        {error ? (
          <ErrorBanner text={`Não foi possível carregar a tendência de espectadores: ${(error as Error).message}`} />
        ) : isLoading ? (
          <Skeleton className="h-64 w-full" />
        ) : points.length === 0 ? (
          <EmptyState icon={Eye} text="Sem pontos de tendência de espectadores para essa live." />
        ) : (
          <TrendChart data={points} lines={lines} yFormatterLeft={(v) => abbreviateNumber(v)} />
        )}
      </CardContent>
    </Card>
  );
}

/** Get Live Room Interactive Trends (202502) — WATCH_PV / COMMENT_PV / SHARE_PV. */
function InteractiveTrendSection({ liveRoomId }: { liveRoomId: string }) {
  const { data, isLoading, error } = useLiveRoomInteractiveTrends(liveRoomId);
  const series = useMemo(() => data?.interactive_trend_performances ?? [], [data]);
  const points = useMemo(() => buildCountTrendData(series), [series]);
  const lines: TrendLineDef[] = useMemo(
    () =>
      series.map(
        (s): TrendLineDef => ({
          dataKey: s.stats_type ?? "unknown",
          name: (s.stats_type && INTERACTIVE_TREND_LABELS[s.stats_type]) || s.stats_type || "—",
          color: (s.stats_type && INTERACTIVE_TREND_COLORS[s.stats_type]) || DEFAULT_LINE_COLOR,
          valueFormatter: (v: number) => formatNumber(v),
        })
      ),
    [series]
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <MessageCircle className="h-4 w-4" /> Tendência de interações
        </CardTitle>
        <p className="mt-0.5 text-xs text-muted-foreground">Get Live Room Interactive Trends (202502)</p>
      </CardHeader>
      <CardContent>
        {error ? (
          <ErrorBanner text={`Não foi possível carregar a tendência de interações: ${(error as Error).message}`} />
        ) : isLoading ? (
          <Skeleton className="h-64 w-full" />
        ) : points.length === 0 ? (
          <EmptyState icon={MessageCircle} text="Sem pontos de tendência de interação para essa live." />
        ) : (
          <TrendChart data={points} lines={lines} yFormatterLeft={(v) => abbreviateNumber(v)} />
        )}
      </CardContent>
    </Card>
  );
}

type TrafficSource = NonNullable<GetLiveRoomTrafficPerformanceData["traffic_performances"]>[number];

/** Get Live Room Traffic Performance (202502) — ranking de fontes (gráfico) + sub-fontes (barras de %). */
function TrafficSection({ liveRoomId }: { liveRoomId: string }) {
  const { data, isLoading, error } = useLiveRoomTrafficPerformance(liveRoomId);
  const sources = useMemo(
    () => [...(data?.traffic_performances ?? [])].sort((a, b) => (b.source?.watch_pv ?? 0) - (a.source?.watch_pv ?? 0)),
    [data]
  );
  const chartData = useMemo(
    () => sources.map((s) => ({ name: humanize(s.source?.name), watch_pv: s.source?.watch_pv ?? 0 })),
    [sources]
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Radar className="h-4 w-4" /> Fontes de tráfego
        </CardTitle>
        <p className="mt-0.5 text-xs text-muted-foreground">Get Live Room Traffic Performance (202502)</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {error ? (
          <ErrorBanner text={`Não foi possível carregar o tráfego: ${(error as Error).message}`} />
        ) : isLoading ? (
          <Skeleton className="h-52 w-full" />
        ) : sources.length === 0 ? (
          <EmptyState icon={Radar} text="Sem dados de tráfego para essa live." />
        ) : (
          <>
            <ResponsiveContainer width="100%" height={Math.max(140, chartData.length * 42)}>
              <BarChart data={chartData} layout="vertical" margin={{ top: 4, right: 16, left: 4, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                <XAxis
                  type="number"
                  tickFormatter={(v) => abbreviateNumber(Number(v))}
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  stroke="hsl(var(--border))"
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={110}
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  stroke="hsl(var(--border))"
                />
                <Tooltip
                  formatter={(value) => [formatNumber(Number(value)), "Visualizações"] as [string, string]}
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "0.5rem",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="watch_pv" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>

            <div className="space-y-3 border-t pt-3">
              {sources.map((s, i) => (
                <TrafficSourceBreakdown key={s.source?.name ?? i} source={s} />
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function TrafficSourceBreakdown({ source }: { source: TrafficSource }) {
  const subs = [...(source.sub_sources ?? [])].sort((a, b) => (b.watch_pv ?? 0) - (a.watch_pv ?? 0));
  const total = source.source?.watch_pv || subs.reduce((s, x) => s + (x.watch_pv ?? 0), 0) || 1;
  if (subs.length === 0) return null;
  return (
    <div className="space-y-1.5">
      <p className="text-xs font-medium">
        {humanize(source.source?.name)} <span className="font-normal text-muted-foreground">— sub-fontes</span>
      </p>
      {subs.map((sub, i) => (
        <div key={sub.name ?? i} className="space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{humanize(sub.name)}</span>
            <span>{formatNumber(sub.watch_pv ?? 0)}</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary/70"
              style={{ width: `${Math.min(100, ((sub.watch_pv ?? 0) / total) * 100)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function ProductThumb({ src }: { src?: string }) {
  const [err, setErr] = useState(false);
  if (!src || err) return <Package className="h-4 w-4 text-muted-foreground" />;
  return <img src={src} alt="" onError={() => setErr(true)} className="h-full w-full object-cover" />;
}

/** Get Live Room Product Stats (202502) — GMV, preço médio, pedidos, cliques e estoque por produto. */
function ProductStatsSection({ liveRoomId }: { liveRoomId: string }) {
  const { data, isLoading, error } = useLiveRoomProductStats(liveRoomId);
  const products = data?.product_stats ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Package className="h-4 w-4" /> Produtos da live
        </CardTitle>
        <p className="mt-0.5 text-xs text-muted-foreground">Get Live Room Product Stats (202502)</p>
      </CardHeader>
      <CardContent>
        {error ? (
          <ErrorBanner text={`Não foi possível carregar os produtos da live: ${(error as Error).message}`} />
        ) : isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <EmptyState icon={Package} text="Nenhum produto retornado para essa live." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="pb-2 pr-4 font-medium">Produto</th>
                  <th className="pb-2 pr-4 text-right font-medium">GMV</th>
                  <th className="pb-2 pr-4 text-right font-medium">Preço médio</th>
                  <th className="pb-2 pr-4 text-right font-medium">Pedidos</th>
                  <th className="pb-2 pr-4 text-right font-medium">Cliques / CTR</th>
                  <th className="pb-2 text-right font-medium">Estoque</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {products.map((p, i) => (
                  <tr key={p.product_id ?? i} className="align-top">
                    <td className="max-w-[240px] py-3 pr-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted">
                          <ProductThumb src={p.main_image_url} />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{p.product_name ?? `Produto ${p.product_id}`}</p>
                          <div className="flex items-center gap-1.5">
                            {p.is_live && (
                              <Badge variant="success" className="whitespace-nowrap text-[10px]">
                                Ao vivo
                              </Badge>
                            )}
                            {p.sellable_region && <span className="text-xs text-muted-foreground">{p.sellable_region}</span>}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap py-3 pr-4 text-right font-semibold">{formatMoney(p.local_gmv)}</td>
                    <td className="whitespace-nowrap py-3 pr-4 text-right text-muted-foreground">{formatMoney(p.local_unit_price)}</td>
                    <td className="whitespace-nowrap py-3 pr-4 text-right">
                      <p>{formatNumber(p.paid_order_count ?? 0)} pagos</p>
                      <p className="text-xs text-muted-foreground">{formatNumber(p.created_order_count ?? 0)} criados</p>
                    </td>
                    <td className="whitespace-nowrap py-3 pr-4 text-right">
                      <p>{formatNumber(p.total_click_count ?? 0)}</p>
                      <p className="text-xs text-muted-foreground">CTR {formatPercent(parseFloat(p.click_through_rate ?? "0") || 0, 1)}</p>
                    </td>
                    <td className="whitespace-nowrap py-3 text-right">
                      <p>{formatNumber(p.inventory_left_count ?? 0)} restante</p>
                      <p className="text-xs text-muted-foreground">{formatNumber(p.inventory_consumption_count ?? 0)} vendido</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

const GENDER_LABELS: Record<string, string> = {
  USER_PORTRAIT_GENDER_UNKNOWN: "Não informado",
  USER_PORTRAIT_GENDER_M: "Masculino",
  USER_PORTRAIT_GENDER_F: "Feminino",
};
const FAN_LABELS: Record<string, string> = {
  USER_PORTRAIT_FOLLOWER: "Seguidores",
  USER_PORTRAIT_NON_FOLLOWER: "Não seguidores",
};
const AGE_LABELS: Record<string, string> = {
  USER_PORTRAIT_AGE_LESS_THAN_15: "< 15",
  USER_PORTRAIT_AGE_13_TO_17: "13–17",
  USER_PORTRAIT_AGE_15_TO_17: "15–17",
  USER_PORTRAIT_AGE_18_TO_24: "18–24",
  USER_PORTRAIT_AGE_25_TO_34: "25–34",
  USER_PORTRAIT_AGE_35_TO_44: "35–44",
  USER_PORTRAIT_AGE_45_TO_54: "45–54",
  USER_PORTRAIT_AGE_MORE_THAN_34: "> 34",
  USER_PORTRAIT_AGE_MORE_THAN_55: "> 55",
};

interface Indicator {
  type?: string;
  value?: string;
}

/** Indicadores de gênero/idade/fãs vêm como contagem — normaliza pra % dentro do próprio grupo. */
function shareFromCounts(items: Indicator[] | undefined, labels: Record<string, string>): { label: string; pct: number }[] {
  const list = (items ?? []).map((i) => ({ type: i.type ?? "—", n: parseFloat(i.value ?? "0") || 0 }));
  const total = list.reduce((s, i) => s + i.n, 0);
  return list
    .map((i) => ({ label: labels[i.type] ?? i.type, pct: total > 0 ? i.n / total : 0 }))
    .sort((a, b) => b.pct - a.pct);
}

/** region_indicators.value já vem como share rate × 10.000 (doc) — divide por 10.000 pra virar fração. */
function shareFromRegion(items: Indicator[] | undefined): { label: string; pct: number }[] {
  return (items ?? [])
    .map((i) => ({ label: i.type ?? "—", pct: (parseFloat(i.value ?? "0") || 0) / 10000 }))
    .sort((a, b) => b.pct - a.pct)
    .slice(0, 8);
}

function ShareBarList({ items }: { items: { label: string; pct: number }[] }) {
  if (items.length === 0) return <p className="text-xs text-muted-foreground">Sem dados.</p>;
  return (
    <div className="space-y-2.5">
      {items.map((it) => (
        <div key={it.label} className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">{it.label}</span>
            <span className="font-medium">{formatPercent(it.pct, 1)}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(100, it.pct * 100)}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Get Live Room User Portraits (202502) — demografia (gênero/idade/fãs/região), com toggle todos × pago. */
function UserPortraitsSection({ liveRoomId }: { liveRoomId: string }) {
  const { data, isLoading, error } = useLiveRoomUserPortraits(liveRoomId);
  const [scope, setScope] = useState<"all" | "paid">("all");

  const gender = shareFromCounts(scope === "all" ? data?.all_ads_gender_indicators : data?.paid_ads_gender_indicators, GENDER_LABELS);
  const age = shareFromCounts(scope === "all" ? data?.all_ads_age_indicators : data?.paid_ads_age_indicators, AGE_LABELS);
  const fans = shareFromCounts(scope === "all" ? data?.all_fan_indicators : data?.paid_fan_indicators, FAN_LABELS);
  const region = shareFromRegion(data?.region_indicators);
  const hasAny = gender.length + age.length + fans.length + region.length > 0;

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="h-4 w-4" /> Perfil da audiência
          </CardTitle>
          <p className="mt-0.5 text-xs text-muted-foreground">Get Live Room User Portraits (202502)</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant={scope === "all" ? "default" : "outline"} onClick={() => setScope("all")}>
            Todos os espectadores
          </Button>
          <Button size="sm" variant={scope === "paid" ? "default" : "outline"} onClick={() => setScope("paid")}>
            Só anúncios pagos
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {error ? (
          <ErrorBanner text={`Não foi possível carregar o perfil da audiência: ${(error as Error).message}`} />
        ) : isLoading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        ) : !hasAny ? (
          <EmptyState icon={Users} text="Sem dados de audiência para essa live." />
        ) : (
          <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Gênero</p>
              <ShareBarList items={gender} />
            </div>
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Seguidores</p>
              <ShareBarList items={fans} />
            </div>
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Faixa etária</p>
              <ShareBarList items={age} />
            </div>
            <div>
              <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <Globe2 className="h-3.5 w-3.5" /> Região (top {region.length})
              </p>
              <ShareBarList items={region} />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
