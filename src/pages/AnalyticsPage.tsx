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
  Trophy,
  TrendingUp,
  TrendingDown,
  ArrowDownRight,
  Clock,
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
import { PageHeader } from "@/components/PageHeader";
import { PeriodPicker } from "@/components/PeriodPicker";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard } from "@/components/StatCard";
import {
  useVideoPerformances,
  aggregateVideoPerformance,
  aggregateVideoKpis,
  useVideoContentPerformance,
  useLiveRoomCoreStats,
  useLiveRoomGmvTrend,
  useLiveRoomViewTrends,
  useLiveRoomTrafficPerformance,
  useLiveRoomInteractiveTrends,
  useLiveRoomProductStats,
  useLiveRoomUserPortraits,
  useLiveRoomInfo,
  type VideoPerformancesFilters,
  type ContentVideoRow,
  useRecentLiveRooms,
} from "@/hooks/useAnalytics";
import type { GanhosFilters } from "@/hooks/useGanhos";
import { useHorarios } from "@/hooks/useHorarios";
import {
  CONFIANCA_LABEL,
  CONTENT_FILTERS,
  LEITURA,
  MIN_PEDIDOS_GRADE,
  MIN_PEDIDOS_RECOMENDACAO,
  rotuloJanela,
  type Confianca,
  type ContentFilter,
} from "@/lib/horarios";
import { BarrasPorHora, GradeSemanal, TabelaHorarios } from "@/components/HorariosChart";
import { cn } from "@/lib/utils";
import { ROLLING_DAYS, resolvePeriod, type Period } from "@/lib/period";
import { USE_MOCK } from "@/services/creatorClient";
import {
  formatCurrency,
  formatMoney,
  formatNumber,
  formatPercent,
  formatDate,
  formatDateTime,
  abbreviateNumber,
} from "@/lib/formatters";
import type { GetLiveRoomTrafficPerformanceData } from "@/types/creator-api.generated";

/**
 * Analytics de creator: "Ranking" (cruza retorno dos pedidos com receita de Get Video
 * Performances — gated, `creator.video.write` inativo), "Vídeo específico" (consulta
 * manual por ID) e "Live" (7 endpoints de live room, `creator.data.live.read.public`
 * ativo). Ver docs/TIKTOK_AFFILIATE_CREATOR_API.md, seção "Analytics de conteúdo".
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

/** formatCurrency com fallback — nunca derruba a tela se vier um código de moeda inválido do fixture. */
function money(amount: number, currency?: string): string {
  try {
    return formatCurrency(amount, currency || "BRL");
  } catch {
    return `${amount.toFixed(2)} ${currency ?? ""}`.trim();
  }
}

/** avg_watching_duration vem em segundos — formata humano "Xm Ys" (ex.: "3m 20s"). */
function formatDuration(seconds?: number): string {
  if (seconds == null || !Number.isFinite(seconds) || seconds < 0) return "—";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}m ${s}s`;
}

/** Humaniza nomes de fonte de tráfego / status (ex.: "card_click" → "Card click") — a doc
 *  não lista um enum fechado, então só normalizamos, sem inventar tradução. */
function humanize(raw?: string): string {
  if (!raw) return "—";
  return raw.replace(/[_-]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Início/fim de um vídeo formatados como intervalo de data (ou data única quando iguais). */
function formatPeriodRange(minStart?: number, maxEnd?: number): string {
  if (minStart == null || maxEnd == null) return "—";
  return minStart === maxEnd ? formatDate(minStart) : `${formatDate(minStart)} – ${formatDate(maxEnd)}`;
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
  const [tab, setTab] = useState<"ranking" | "videos" | "live" | "horarios">("ranking");

  // Período único da página — o mesmo seletor do Painel/Ganhos, para as três abas
  // falarem do mesmo recorte de tempo: KPIs do ranking, consulta manual de vídeo e,
  // na aba Live, qual live entra na lista de "lives recentes" (os 7 endpoints de KPI
  // de UMA live não aceitam filtro de data — o período só decide qual live escolher).
  const [periodKey, setPeriodKey] = useState<string>("month");
  const [monthOffset, setMonthOffset] = useState(0);
  const now = useMemo(() => Math.floor(Date.now() / 1000), []);
  const resolved = useMemo(() => {
    const period: Period =
      periodKey === "month"
        ? { kind: "month", offset: monthOffset }
        : { kind: "rolling", days: ROLLING_DAYS[periodKey] ?? 30 };
    return resolvePeriod(period, now);
  }, [periodKey, monthOffset, now]);
  const range = resolved.current;

  return (
    <div className="space-y-gap">
      <PageHeader
        title="Analytics de creator"
        subtitle="Quais vídeos trazem mais receita, qual deu mais retorno, e como está a sua live."
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="segmented w-fit" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={tab === "ranking"}
            onClick={() => setTab("ranking")}
            className="segmented-item flex items-center gap-2"
          >
            <Trophy className="h-4 w-4" /> Ranking
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === "videos"}
            onClick={() => setTab("videos")}
            className="segmented-item flex items-center gap-2"
          >
            <Video className="h-4 w-4" /> Vídeo específico
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === "live"}
            onClick={() => setTab("live")}
            className="segmented-item flex items-center gap-2"
          >
            <Radio className="h-4 w-4" /> Live
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === "horarios"}
            onClick={() => setTab("horarios")}
            className="segmented-item flex items-center gap-2"
          >
            <Clock className="h-4 w-4" /> Horários
          </button>
        </div>

        <PeriodPicker
          periodKey={periodKey}
          onPeriodKey={setPeriodKey}
          monthOffset={monthOffset}
          onMonthOffset={setMonthOffset}
          monthLabel={resolved.kpiLabel}
        />
      </div>

      {tab === "ranking" ? (
        <RankingTab range={range} subject={resolved.subject} />
      ) : tab === "videos" ? (
        <ManualVideoTab range={range} subject={resolved.subject} />
      ) : tab === "horarios" ? (
        <HorariosTab range={range} subject={resolved.subject} />
      ) : (
        <LiveTab range={range} subject={resolved.subject} />
      )}
    </div>
  );
}

// =============== Aba 1: Ranking (receita x retorno por vídeo) ===============

const RANK_ICON: Record<string, LucideIcon> = {
  gmv: TrendingUp,
  commission: Trophy,
};

function HighlightCard({
  icon: Icon,
  label,
  row,
  metric,
  accent,
}: {
  icon: LucideIcon;
  label: string;
  row?: ContentVideoRow;
  metric: "gmv" | "commission";
  accent: "primary" | "success" | "warning" | "info";
}) {
  const ACCENT_TEXT: Record<string, string> = {
    primary: "text-primary",
    success: "text-success",
    warning: "text-warning",
    info: "text-info",
  };
  return (
    <Card>
      <CardContent className="p-4">
        <div className={`flex items-center gap-1.5 text-xs font-semibold ${ACCENT_TEXT[accent]}`}>
          <Icon className="h-3.5 w-3.5" /> {label}
        </div>
        {!row ? (
          <p className="mt-2 text-sm text-muted-foreground">Sem dados suficientes.</p>
        ) : (
          <>
            <p className="mt-2 truncate text-sm font-semibold" title={row.label}>
              {row.label}
            </p>
            <p className="num mt-0.5 text-lg font-extrabold tracking-[-0.3px]">
              {metric === "gmv" ? money(row.gmv, row.gmvCurrency) : money(row.commission, row.commissionCurrency)}
            </p>
            <p className="mt-0.5 truncate text-xs text-muted-foreground">
              {row.shopName ?? `Vídeo ${row.id}`}
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function RankingTab({ range, subject }: { range: GanhosFilters; subject: string }) {
  const { rows, isLoading, error, gmvError } = useVideoContentPerformance(range);
  const [sortBy, setSortBy] = useState<"gmv" | "commission">("gmv");
  // GMV (Get Video Performances) exige `creator.video.write`, hoje inativo em live. Sem ele
  // a RECEITA fica indisponível, mas o RETORNO (comissão, dos pedidos) segue funcionando —
  // então degradamos: some as colunas de GMV e ordena por retorno, em vez de travar a aba.
  const gmvUnavailable = !!gmvError;
  const effectiveSort: "gmv" | "commission" = gmvUnavailable ? "commission" : sortBy;

  const kpis = useMemo(() => {
    const gmv = rows.reduce((s, r) => s + r.gmv, 0);
    const commission = rows.reduce((s, r) => s + r.commission, 0);
    const pending = rows.reduce((s, r) => s + r.pendingCommission, 0);
    const itemsSold = rows.reduce((s, r) => s + r.itemsSold, 0);
    const withCtr = rows.filter((r) => r.hasPerformance);
    const avgCtr = withCtr.length ? withCtr.reduce((s, r) => s + r.ctr, 0) / withCtr.length : 0;
    const gmvCurrency = rows.find((r) => r.gmv > 0)?.gmvCurrency ?? "BRL";
    const commissionCurrency = rows.find((r) => r.commission > 0)?.commissionCurrency ?? gmvCurrency;
    return { gmv, commission, pending, itemsSold, avgCtr, gmvCurrency, commissionCurrency };
  }, [rows]);

  // "Maior/menor receita" só considera vídeos com retorno de Get Video Performances —
  // um vídeo sem esse dado não tem GMV pra comparar (ver `hasPerformance`).
  const byGmv = useMemo(
    () => rows.filter((r) => r.hasPerformance).sort((a, b) => b.gmv - a.gmv),
    [rows]
  );
  const byCommission = useMemo(() => [...rows].sort((a, b) => b.commission - a.commission), [rows]);
  const sorted = useMemo(
    () => (effectiveSort === "gmv" ? [...rows].sort((a, b) => b.gmv - a.gmv) : byCommission),
    [rows, effectiveSort, byCommission]
  );

  const topRevenue = byGmv[0];
  const bottomRevenue = byGmv.length > 1 ? byGmv[byGmv.length - 1] : undefined;
  const topReturn = byCommission[0];
  const bottomReturn = byCommission.length > 1 ? byCommission[byCommission.length - 1] : undefined;

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Vídeos identificados a partir dos seus pedidos de afiliado em {subject}. Receita (GMV) vem de{" "}
        <strong className="font-medium text-foreground">Get Video Performances</strong>; retorno (comissão) vem de{" "}
        <strong className="font-medium text-foreground">Search Creator Affiliate Orders</strong>.
      </p>

      {error ? (
        <ErrorBanner text={`Não foi possível montar o ranking: ${(error as Error).message}`} />
      ) : isLoading ? (
        <>
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <StatCard key={i} label="—" value="" loading />
            ))}
          </section>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        </>
      ) : rows.length === 0 ? (
        <EmptyState icon={Trophy} text="Nenhum vídeo com pedido de afiliado nesse período." />
      ) : (
        <>
          {gmvUnavailable && (
            <Card className="border-warning/30 bg-warning/5">
              <CardContent className="flex items-start gap-3 p-4 text-sm">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
                <span>
                  A <strong className="font-medium text-foreground">receita (GMV)</strong> por vídeo está
                  indisponível — exige o escopo <code>creator.video.write</code>, ainda inativo no app. O{" "}
                  <strong className="font-medium text-foreground">retorno (comissão)</strong> abaixo vem dos seus
                  pedidos e já está valendo; o GMV aparece assim que o escopo for aprovado.
                </span>
              </CardContent>
            </Card>
          )}
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Receita (GMV)"
              value={gmvUnavailable ? "—" : money(kpis.gmv, kpis.gmvCurrency)}
              icon={Wallet}
              accent="primary"
            />
            <StatCard
              label="Retorno (comissão)"
              value={money(kpis.commission, kpis.commissionCurrency)}
              icon={Trophy}
              accent="success"
              hint={kpis.pending > 0 ? `${money(kpis.pending, kpis.commissionCurrency)} ainda pendente` : "Tudo já liquidado"}
            />
            <StatCard
              label="Itens vendidos"
              value={gmvUnavailable ? "—" : formatNumber(kpis.itemsSold)}
              icon={PackageCheck}
              accent="info"
            />
            <StatCard
              label="CTR médio"
              value={gmvUnavailable ? "—" : formatPercent(kpis.avgCtr, 1)}
              icon={MousePointerClick}
              accent="warning"
            />
          </section>

          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <HighlightCard icon={TrendingUp} label="Maior receita" row={topRevenue} metric="gmv" accent="primary" />
            <HighlightCard icon={TrendingDown} label="Menor receita" row={bottomRevenue} metric="gmv" accent="warning" />
            <HighlightCard icon={Trophy} label="Maior retorno" row={topReturn} metric="commission" accent="success" />
            <HighlightCard icon={ArrowDownRight} label="Menor retorno" row={bottomReturn} metric="commission" accent="warning" />
          </section>

          <Card>
            <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-base">Ranking de vídeos</CardTitle>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {effectiveSort === "gmv" ? "Do maior para o menor GMV" : "Da maior para a menor comissão"}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant={effectiveSort === "gmv" ? "toggle-on" : "toggle"}
                  onClick={() => setSortBy("gmv")}
                  disabled={gmvUnavailable}
                  title={gmvUnavailable ? "Receita/GMV indisponível — exige creator.video.write" : undefined}
                >
                  Por receita
                </Button>
                <Button
                  size="sm"
                  variant={effectiveSort === "commission" ? "toggle-on" : "toggle"}
                  onClick={() => setSortBy("commission")}
                >
                  Por retorno
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
                      <th className="pb-2 pr-4 font-medium">#</th>
                      <th className="pb-2 pr-4 font-medium">Vídeo</th>
                      <th className="pb-2 pr-4 text-right font-medium">GMV (receita)</th>
                      <th className="pb-2 pr-4 text-right font-medium">Comissão (retorno)</th>
                      <th className="pb-2 pr-4 text-right font-medium">Pedidos</th>
                      <th className="pb-2 pr-4 text-right font-medium">Itens vendidos</th>
                      <th className="pb-2 text-right font-medium">CTR</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {sorted.map((row, i) => {
                      const RankIcon = RANK_ICON[effectiveSort];
                      return (
                        <tr key={row.id}>
                          <td className="py-3 pr-4 text-xs text-muted-foreground">
                            {i === 0 ? <RankIcon className="h-4 w-4 text-primary" /> : i + 1}
                          </td>
                          <td className="max-w-[220px] py-3 pr-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                                <Film className="h-4 w-4 text-muted-foreground" />
                              </div>
                              <div className="min-w-0">
                                <p className="truncate text-sm font-medium" title={row.label}>
                                  {row.label}
                                </p>
                                <p className="truncate text-xs text-muted-foreground">
                                  {row.shopName ?? `Vídeo ${row.id}`}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="whitespace-nowrap py-3 pr-4 text-right font-semibold">
                            {row.hasPerformance ? money(row.gmv, row.gmvCurrency) : "—"}
                          </td>
                          <td className="whitespace-nowrap py-3 pr-4 text-right">
                            <p className="font-semibold text-success">{money(row.commission, row.commissionCurrency)}</p>
                            {row.pendingCommission > 0 && (
                              <p className="flex items-center justify-end gap-1 text-xs text-warning">
                                <Clock className="h-3 w-3" /> {money(row.pendingCommission, row.commissionCurrency)} pendente
                              </p>
                            )}
                          </td>
                          <td className="whitespace-nowrap py-3 pr-4 text-right">{formatNumber(row.ordersFromAffiliate)}</td>
                          <td className="whitespace-nowrap py-3 pr-4 text-right">
                            {row.hasPerformance ? formatNumber(row.itemsSold) : "—"}
                          </td>
                          <td className="whitespace-nowrap py-3 text-right">
                            {row.hasPerformance ? formatPercent(row.ctr, 1) : "—"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

// =============== Aba 2: Vídeo específico (consulta manual por ID) ===============

const DEFAULT_VIDEO_ID = "7271486684427046149";

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

function ManualVideoTab({ range, subject }: { range: GanhosFilters; subject: string }) {
  const [idsInput, setIdsInput] = useState(USE_MOCK ? DEFAULT_VIDEO_ID : "");
  const [appliedIds, setAppliedIds] = useState<string[]>(USE_MOCK ? [DEFAULT_VIDEO_ID] : []);

  const filters: VideoPerformancesFilters = useMemo(
    () => ({ videoIds: appliedIds, startTimeGe: range.createTimeGe, endTimeLe: range.createTimeLt }),
    [appliedIds, range]
  );
  const { data, isLoading, error } = useVideoPerformances(filters);
  const rows = useMemo(() => (data?.videos ?? []).map(aggregateVideoPerformance), [data]);
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
            <Video className="h-4 w-4" /> Performance de um vídeo específico
          </CardTitle>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Get Video Performances (202403) — GMV, pedidos, itens vendidos e engajamento, em {subject}. A API não
            retorna título nem thumbnail (só as métricas por video_id).
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
              <Button type="submit" className="gap-2">
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
                              <p className="text-xs text-muted-foreground">{formatPeriodRange(row.minStart, row.maxEnd)}</p>
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

// =============== Aba 3: Live ===============

/** Get Live Room Info (202309) — a live "atual" da conta, para abrir o dashboard num clique
 *  em vez do creator ter que descobrir/colar o próprio live_room_id. */
function LiveRoomInfoCard({
  onView,
  isActive,
}: {
  onView: (id: string) => void;
  isActive: (id: string) => boolean;
}) {
  const { data, isLoading, error } = useLiveRoomInfo();

  if (isLoading) return <Skeleton className="h-[74px] w-full" />;
  // É uma conveniência para auto-preencher o ID — se falhar ou não houver live agora,
  // o fluxo manual abaixo (ID digitado ou lives recentes) já cobre o caso sem ruído extra.
  if (error || !data?.id) return null;

  const isOngoing = /ONGOING|LIVE/i.test(data.status ?? "");
  return (
    <Card className="border-primary/30 bg-primary/5">
      <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="tint text-primary">
            <Radio className="h-[19px] w-[19px] stroke-[1.6]" />
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-semibold">{data.title || "Sua live"}</p>
              <Badge variant={isOngoing ? "success" : "secondary"}>{humanize(data.status)}</Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              ID {data.id}
              {data.start_time ? ` · iniciada em ${formatDateTime(data.start_time)}` : ""}
            </p>
          </div>
        </div>
        <Button
          size="sm"
          variant={isActive(data.id) ? "toggle-on" : "default"}
          className="shrink-0 gap-1.5"
          onClick={() => onView(data.id as string)}
        >
          <Search className="h-3.5 w-3.5" /> Ver analytics desta live
        </Button>
      </CardContent>
    </Card>
  );
}

function LiveTab({ range, subject }: { range: GanhosFilters; subject: string }) {
  const [idInput, setIdInput] = useState(USE_MOCK ? "7093488394589768494" : "");
  const [liveRoomId, setLiveRoomId] = useState(USE_MOCK ? idInput : "");

  // A API não expõe "listar minhas lives"; os IDs saem do content_id dos pedidos
  // com content_type LIVE. Sem isso o creator não teria como saber o próprio ID.
  // O período é o mesmo `PeriodPicker` do topo da página — os 7 endpoints de KPIs da
  // live escolhida (abaixo) não aceitam filtro de data (são de UMA sessão só), então o
  // período só se aplica aqui: em decidir QUAL live vira candidata a ser analisada.
  const { liveRoomIds, isLoading: loadingRooms } = useRecentLiveRooms(range);

  const pick = (id: string) => {
    setIdInput(id);
    setLiveRoomId(id);
  };

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
          <p className="leading-relaxed text-muted-foreground">
            Esses 7 indicadores usam o escopo <code className="rounded bg-background/60 px-1 py-0.5 text-xs">creator.data.live.read.public</code>{" "}
            (pacote <strong>Live Data</strong>), que está <strong>ativo</strong> no app — funcionam em modo live real, desde que você
            informe o ID de uma sala de live da própria conta.
          </p>
        </CardContent>
      </Card>

      <LiveRoomInfoCard onView={pick} isActive={(id) => liveRoomId === id} />

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

          {!USE_MOCK && (
            <div className="mt-4 border-t pt-3">
              {loadingRooms ? (
                <p className="text-sm text-muted-foreground">Procurando suas lives recentes...</p>
              ) : liveRoomIds.length > 0 ? (
                <>
                  <p className="mb-2 text-sm text-muted-foreground">
                    Suas lives em <strong className="font-medium text-foreground">{subject}</strong> (identificadas
                    pelos pedidos gerados nelas) — use o seletor de período acima para ver outra janela:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {liveRoomIds.map((r) => (
                      <Button
                        key={r.id}
                        size="sm"
                        variant={liveRoomId === r.id ? "default" : "outline"}
                        className="gap-1.5 font-mono text-xs"
                        onClick={() => pick(r.id)}
                      >
                        <Radio className="h-3 w-3" />
                        {r.id}
                        {r.createTime ? (
                          <span className="font-sans opacity-70">{formatDate(r.createTime)}</span>
                        ) : null}
                      </Button>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Nenhuma live encontrada nos pedidos de {subject}. Troque o período acima ou cole o ID manualmente.
                </p>
              )}
            </div>
          )}
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
          <Button size="sm" variant={scope === "all" ? "toggle-on" : "toggle"} onClick={() => setScope("all")}>
            Todos os espectadores
          </Button>
          <Button size="sm" variant={scope === "paid" ? "toggle-on" : "toggle"} onClick={() => setScope("paid")}>
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

// =============== Aba 4: Horários (melhor horário) ===============
//
// Ver docs/SPEC_MELHOR_HORARIO.md. O núcleo desta aba não é o gráfico: é a leitura.
// O mesmo cálculo significa coisas diferentes por `content_type` — em LIVE o pedido nasce
// durante a transmissão (hora do pedido ≈ hora da live, recomendar horário é legítimo);
// em VÍDEO o pedido chega dias depois do post (hora do pedido não diz nada sobre quando
// postar). Por isso o texto muda junto com o filtro, e só LIVE recomenda.

const FILTRO_LABEL: Record<ContentFilter, string> = {
  tudo: "Tudo",
  live: "Live",
  video: "Vídeo",
};

const CONFIANCA_CHIP: Record<Confianca, string> = {
  insuficiente: "chip-warning",
  baixa: "chip-neutral",
  media: "chip-neutral",
  alta: "chip-success",
};

function HorariosTab({ range, subject }: { range: GanhosFilters; subject: string }) {
  const [filtro, setFiltro] = useState<ContentFilter>("tudo");
  const [verGrade, setVerGrade] = useState(false);
  const [verTabela, setVerTabela] = useState(false);

  const { resumo, currency, isLoading, error, truncated } = useHorarios(range, filtro);
  const leitura = LEITURA[filtro];
  const janela = resumo.melhorJanela;

  if (error) {
    return <ErrorBanner text={error instanceof Error ? error.message : String(error)} />;
  }

  return (
    <div className="space-y-gap">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="segmented w-fit" role="tablist" aria-label="Origem da venda">
          {CONTENT_FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              role="tab"
              aria-selected={filtro === f}
              onClick={() => setFiltro(f)}
              className="segmented-item"
            >
              {FILTRO_LABEL[f]}
            </button>
          ))}
        </div>
        <p className="text-xs text-faint">
          Horários no fuso <span className="font-semibold">{resumo.timeZone}</span>
        </p>
      </div>

      {/* Headline — a resposta, ou o motivo de não haver resposta. */}
      <Card>
        <CardContent className="p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[13px] font-semibold text-muted-foreground">{leitura.titulo}</p>
              {isLoading ? (
                <Skeleton className="mt-2 h-[34px] w-56" />
              ) : janela ? (
                <p className="num mt-1.5 text-[34px] font-extrabold leading-none tracking-[-1px]">
                  {rotuloJanela(janela)}
                </p>
              ) : (
                <p className="mt-1.5 flex items-center gap-2 text-[17px] font-bold">
                  <ShieldAlert className="h-5 w-5 shrink-0 text-warning" />
                  Ainda não dá para dizer
                </p>
              )}
            </div>
            <span className={CONFIANCA_CHIP[resumo.confianca]}>{CONFIANCA_LABEL[resumo.confianca]}</span>
          </div>

          {!isLoading && janela && (
            <p className="mt-2.5 text-sm text-muted-foreground">
              {formatPercent(janela.share)} da sua comissão caiu nessas 3 horas —{" "}
              {money(janela.comissao, currency)} em {formatNumber(janela.pedidos)}{" "}
              {/* Separador, e não "em {subject}" nem "({subject})": o subject varia entre
                  "últimos 90 dias" (que não aceita "em") e "setembro (até hoje)" (que já
                  vem com parênteses) — só o ponto médio funciona nos dois. */}
              {janela.pedidos === 1 ? "pedido" : "pedidos"} · {subject}.
            </p>
          )}

          {!isLoading && !janela && (
            <p className="mt-2.5 text-sm text-muted-foreground">
              São {formatNumber(resumo.totalPedidos)} pedidos neste recorte e o mínimo para uma leitura
              honesta é {MIN_PEDIDOS_RECOMENDACAO}. Com amostra menor, o "melhor horário" é sorte, não
              padrão — então preferimos não cravar um número. Amplie o período ou volte depois de mais
              vendas.
            </p>
          )}

          {/* A ressalva de leitura fica SEMPRE visível, inclusive quando há recomendação. */}
          <div
            className={cn(
              "mt-4 rounded-lg border p-3 text-[13px] leading-relaxed",
              leitura.recomenda ? "bg-muted/40 text-muted-foreground" : "border-warning/30 bg-warning/[.06]"
            )}
          >
            {leitura.explicacao}
          </div>
        </CardContent>
      </Card>

      {truncated && (
        <Card className="border-warning/30 bg-warning/[.06]">
          <CardContent className="flex items-start gap-3 p-4 text-sm">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
            <span>
              O período estourou o teto de 2.000 pedidos — os horários abaixo cobrem só parte dele.
              Use um período mais curto para um recorte completo.
            </span>
          </CardContent>
        </Card>
      )}

      {/* Visão primária: 24 baldes de hora. */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Clock className="h-4 w-4 text-primary" /> Comissão por hora do dia
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-[220px] w-full" />
          ) : resumo.totalPedidos === 0 ? (
            <EmptyState
              icon={Clock}
              text={
                USE_MOCK
                  ? "Nenhum pedido neste recorte. Em mock, rode com VITE_MOCK_DENSE=true para ver a aba com volume realista."
                  : "Nenhum pedido neste recorte. Escolha outro período ou outra origem."
              }
            />
          ) : (
            <>
              <BarrasPorHora horas={resumo.horas} janela={janela} currency={currency} />
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setVerTabela((v) => !v)}>
                  {verTabela ? "Ocultar tabela" : "Ver como tabela"}
                </Button>
                {resumo.gradeDisponivel ? (
                  <Button variant="outline" size="sm" onClick={() => setVerGrade((v) => !v)}>
                    {verGrade ? "Ocultar grade por dia" : "Ver grade dia × hora"}
                  </Button>
                ) : (
                  <span className="text-xs text-faint">
                    Grade dia × hora a partir de {formatNumber(MIN_PEDIDOS_GRADE)} pedidos (você tem{" "}
                    {formatNumber(resumo.totalPedidos)}) — são 168 células, e abaixo disso o desenho é ruído.
                  </span>
                )}
              </div>
              {verTabela && (
                <div className="mt-4">
                  <TabelaHorarios horas={resumo.horas} currency={currency} total={resumo.totalComissao} />
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Visão secundária: grade 7×24, só com amostra grande. */}
      {!isLoading && resumo.gradeDisponivel && verGrade && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Radar className="h-4 w-4 text-primary" /> Dia da semana × hora
            </CardTitle>
          </CardHeader>
          <CardContent>
            <GradeSemanal grade={resumo.grade} currency={currency} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
