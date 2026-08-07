import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Wallet, ShoppingBag, Receipt, Tag, PlugZap, Zap, Radio, Store, Film,
  ChevronRight, Compass, Link2, Clapperboard, type LucideIcon,
} from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { useAffiliateOrders, type GanhosFilters } from "@/hooks/useGanhos";
import { formatCurrency } from "@/lib/formatters";
import { cn } from "@/lib/utils";

const DAY = 24 * 3600;

/** Janela de N dias terminando `endingAt` (Unix em segundos). */
function periodOf(days: number, endingAt: number): GanhosFilters {
  return { createTimeGe: endingAt - days * DAY, createTimeLt: endingAt, pageSize: 100 };
}

/** Alguns valores mock vêm com símbolo de moeda embutido (ex.: "Rp9.900") — limpa antes de parsear. */
function parseAmount(amount?: string | number | null): number {
  if (amount == null) return 0;
  if (typeof amount === "number") return Number.isFinite(amount) ? amount : 0;
  const n = parseFloat(amount.replace(/[^0-9.-]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

/** formatCurrency com fallback — nunca derruba a tela se vier um código de moeda inválido. */
function money(amount: number, currency?: string): string {
  try {
    return formatCurrency(amount, currency || "BRL");
  } catch {
    return `${amount.toFixed(2)} ${currency ?? ""}`.trim();
  }
}

/** `commission_rate` vem em centésimos de % (3000 = 30%). */
function commissionOf(sku: { price?: { amount?: string }; commission_rate?: number }): number {
  return (parseAmount(sku.price?.amount) * (sku.commission_rate ?? 0)) / 10000;
}

type Order = NonNullable<
  ReturnType<typeof useAffiliateOrders>["data"]
>["orders"] extends (infer T)[] | undefined
  ? T
  : never;

interface Totals {
  gross: number;
  commission: number;
  currency: string;
  skuCount: number;
  orderCount: number;
  avgTicket: number;
}

function totalsOf(orders: Order[]): Totals {
  let gross = 0;
  let commission = 0;
  let skuCount = 0;
  let currency = "BRL";
  for (const o of orders) {
    for (const s of o.skus ?? []) {
      skuCount++;
      gross += parseAmount(s.price?.amount);
      commission += commissionOf(s);
      if (s.price?.currency) currency = s.price.currency;
    }
  }
  return {
    gross,
    commission,
    currency,
    skuCount,
    orderCount: orders.length,
    avgTicket: orders.length ? gross / orders.length : 0,
  };
}

/** Variação percentual formatada; `null` quando não há base de comparação. */
function delta(current: number, previous: number): { text: string; up: boolean } | null {
  if (!previous) return null;
  const pct = ((current - previous) / previous) * 100;
  if (!Number.isFinite(pct)) return null;
  const rounded = Math.round(pct);
  return { text: `${rounded > 0 ? "+" : ""}${rounded}%`, up: rounded >= 0 };
}

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
}

/** "há 12 min", "há 3 h", "ontem" — a partir de um Unix em segundos. */
function timeAgo(unix?: number): string {
  if (!unix) return "—";
  const diff = Date.now() / 1000 - unix;
  if (diff < 60) return "agora mesmo";
  if (diff < 3600) return `há ${Math.floor(diff / 60)} min`;
  if (diff < DAY) return `há ${Math.floor(diff / 3600)} h`;
  const days = Math.floor(diff / DAY);
  return days === 1 ? "ontem" : `há ${days} dias`;
}

const CONTENT_ICON: Record<string, LucideIcon> = {
  VIDEO: Film,
  LIVE: Radio,
  PRE_LIVE: Radio,
  SHOP: Store,
  PROMOTION_PAGE: Store,
  LINKSHARE: Link2,
};

const CONTENT_LABEL: Record<string, string> = {
  VIDEO: "vídeo",
  LIVE: "live",
  PRE_LIVE: "pré-live",
  SHOP: "vitrine",
  PROMOTION_PAGE: "página",
  LINKSHARE: "link",
};

/** Chip de status no tom certo: pago = verde, a caminho = âmbar, resto = neutro. */
function statusVariant(status?: string): "success" | "warning" | "secondary" {
  if (status === "SETTLED") return "success";
  if (status === "To-SETTLE" || status === "AWAITING PAYMENT") return "warning";
  return "secondary";
}

const SHORTCUTS = [
  {
    to: "/descoberta",
    icon: Compass,
    title: "Achar produtos para promover",
    sub: "Colaborações abertas ordenadas por comissão.",
  },
  {
    to: "/links",
    icon: Link2,
    title: "Conferir seus links",
    sub: "Cliques e conversão por link, um por vídeo.",
  },
  {
    to: "/estudio",
    icon: Clapperboard,
    title: "Terminar um rascunho",
    sub: "Marcar produtos e publicar sem sair daqui.",
  },
];

/** Janelas do gráfico de comissão — o segmentado do topo do cartão. */
const CHART_PERIODS = [7, 14, 30] as const;

export default function DashboardPage() {
  const { user } = useAuth();
  const [chartDays, setChartDays] = useState<number>(14);
  const name = ((user?.user_metadata?.name as string | undefined) ?? "").split(" ")[0];

  // Duas janelas de 30 dias em sequência: a atual e a anterior, para a variação.
  const now = useMemo(() => Math.floor(Date.now() / 1000), []);
  const current = useMemo(() => periodOf(30, now), [now]);
  const previous = useMemo(() => periodOf(30, now - 30 * DAY), [now]);

  const { data, isLoading, error } = useAffiliateOrders(current);
  const { data: prevData } = useAffiliateOrders(previous);

  const orders = useMemo(() => data?.orders ?? [], [data]);
  const kpis = useMemo(() => totalsOf(orders), [orders]);
  const prevKpis = useMemo(() => totalsOf(prevData?.orders ?? []), [prevData]);

  /** Comissão por dia na janela escolhida — a série do gráfico. */
  const chart = useMemo(() => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const buckets = Array.from({ length: chartDays }, (_, i) => {
      const d = new Date(start);
      d.setDate(d.getDate() - (chartDays - 1 - i));
      return { date: d, value: 0 };
    });
    const first = buckets[0].date.getTime() / 1000;
    for (const o of orders) {
      if (!o.create_time || o.create_time < first) continue;
      const index = Math.floor((o.create_time - first) / DAY);
      if (index < 0 || index >= buckets.length) continue;
      for (const s of o.skus ?? []) buckets[index].value += commissionOf(s);
    }
    const max = Math.max(...buckets.map((b) => b.value), 1);
    return { buckets, max };
  }, [orders, chartDays]);

  /** Feed "acontecendo agora": os pedidos mais recentes, do mais novo pro mais velho. */
  const feed = useMemo(
    () =>
      [...orders]
        .sort((a, b) => (b.create_time ?? 0) - (a.create_time ?? 0))
        .slice(0, 4)
        .map((o) => {
          const sku = o.skus?.[0];
          const type = sku?.content_type ?? "";
          return {
            id: o.id,
            icon: CONTENT_ICON[type] ?? Zap,
            text: sku?.product_name
              ? `Venda de ${sku.product_name}`
              : `Pedido ${o.id ?? ""}`.trim(),
            source: CONTENT_LABEL[type] ?? "",
            time: timeAgo(o.create_time),
            value: money(
              (o.skus ?? []).reduce((sum, s) => sum + commissionOf(s), 0),
              sku?.price?.currency
            ),
          };
        }),
    [orders]
  );

  // Sem backend ainda / TikTok não conectado → estado de conexão.
  const notConnected = !!error;
  const commissionDelta = delta(kpis.commission, prevKpis.commission);
  const grossDelta = delta(kpis.gross, prevKpis.gross);
  const orderDelta = delta(kpis.orderCount, prevKpis.orderCount);
  const ticketDelta = delta(kpis.avgTicket, prevKpis.avgTicket);

  const todayLabel = new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date());

  return (
    // O ritmo do painel não é uniforme: 26px depois da saudação e 20px (--gap)
    // entre os blocos de cartão. Daí margens explícitas em vez de um `space-y`.
    <div className="max-w-[1340px]">
      {/* ── Saudação ── */}
      <header className="mb-[26px] animate-slide-up">
        <p className="text-[13px] font-semibold uppercase tracking-[0.4px] text-faint">
          {todayLabel}
        </p>
        <h1 className="mt-2 font-display text-[30px] font-extrabold leading-[1.1] tracking-[-1.1px] md:text-[36px]">
          {greeting()}
          {name ? `, ${name}` : ""}
        </h1>
        {!isLoading && !notConnected && (
          <p className="mt-2.5 max-w-[560px] text-pretty text-base leading-[1.55] text-muted-foreground">
            {kpis.orderCount > 0 ? (
              <>
                Nos últimos 30 dias entraram {kpis.orderCount}{" "}
                {kpis.orderCount === 1 ? "pedido" : "pedidos"} e{" "}
                <strong className="font-semibold text-foreground">
                  {money(kpis.commission, kpis.currency)}
                </strong>{" "}
                em comissão.
              </>
            ) : (
              "Nenhum pedido nos últimos 30 dias. Assim que uma venda entrar, ela aparece aqui."
            )}
          </p>
        )}
      </header>

      {notConnected && (
        <Card className="mb-gap border-primary/30 bg-primary/5">
          <CardContent className="flex flex-col items-start gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <PlugZap className="h-5 w-5 shrink-0 text-primary" />
              <div>
                <p className="font-semibold">Conecte sua conta de creator</p>
                <p className="text-sm text-muted-foreground">
                  Ainda não conseguimos ler seus dados do TikTok Shop.
                </p>
              </div>
            </div>
            <Button asChild>
              <Link to="/conectar">Conectar TikTok</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* ── KPIs ── */}
      <section className="mb-gap grid grid-cols-1 gap-gap sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Comissão do período"
          value={money(kpis.commission, kpis.currency)}
          icon={Wallet}
          accent="primary"
          loading={isLoading}
          delta={commissionDelta?.text}
          up={commissionDelta?.up}
          deltaLabel={commissionDelta ? "vs. 30 dias anteriores" : "últimos 30 dias"}
        />
        <StatCard
          label="Vendas geradas"
          value={money(kpis.gross, kpis.currency)}
          icon={ShoppingBag}
          accent="success"
          loading={isLoading}
          delta={grossDelta?.text}
          up={grossDelta?.up}
          deltaLabel={grossDelta ? "vs. 30 dias anteriores" : "GMV atribuído a você"}
        />
        <StatCard
          label="Pedidos"
          value={String(kpis.orderCount)}
          icon={Receipt}
          accent="warning"
          loading={isLoading}
          delta={orderDelta?.text}
          up={orderDelta?.up}
          deltaLabel={orderDelta ? "vs. 30 dias anteriores" : `${kpis.skuCount} itens vendidos`}
        />
        <StatCard
          label="Ticket médio"
          value={money(kpis.avgTicket, kpis.currency)}
          icon={Tag}
          accent="info"
          loading={isLoading}
          delta={ticketDelta?.text}
          up={ticketDelta?.up}
          deltaLabel={ticketDelta ? "vs. 30 dias anteriores" : "por pedido"}
        />
      </section>

      <div className="grid gap-gap xl:grid-cols-[1.6fr_1fr] xl:items-start">
        <div className="flex min-w-0 flex-col gap-gap">
          {/* ── Comissão por dia ── */}
          <div className="tile">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="font-display text-[18px] font-bold tracking-[-0.3px]">
                  Comissão por dia
                </div>
                <p className="mt-[3px] text-[13.5px] text-faint">
                  A partir dos pedidos atribuídos ao seu conteúdo.
                </p>
              </div>
              <div className="segmented" role="tablist" aria-label="Período do gráfico">
                {CHART_PERIODS.map((d) => (
                  <button
                    key={d}
                    type="button"
                    role="tab"
                    aria-selected={chartDays === d}
                    onClick={() => setChartDays(d)}
                    className="segmented-item"
                  >
                    {d} dias
                  </button>
                ))}
              </div>
            </div>

            {isLoading ? (
              <Skeleton className="mt-6 h-[190px] w-full" />
            ) : (
              <div className="mt-[26px] flex h-[190px] items-end gap-[9px]">
                {chart.buckets.map((b, i) => {
                  const last = i === chart.buckets.length - 1;
                  return (
                    <div
                      key={b.date.toISOString()}
                      className="flex h-full flex-1 flex-col items-center justify-end gap-[9px]"
                    >
                      <div
                        title={`${b.date.toLocaleDateString("pt-BR")} — ${money(b.value, kpis.currency)}`}
                        style={{ height: `${Math.max((b.value / chart.max) * 100, 2)}%` }}
                        className={cn(
                          "w-full max-w-[34px] rounded-[8px_8px_4px_4px] transition-[height] duration-500",
                          last ? "bg-primary" : "bg-primary/[.085]"
                        )}
                      />
                      <span
                        className={cn(
                          "text-[11.5px]",
                          last ? "font-bold text-primary" : "font-medium text-faint"
                        )}
                      >
                        {b.date.getDate()}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── Pedidos recentes ── */}
          <div className="tile">
            <div className="mb-1.5 flex items-center justify-between">
              <div className="font-display text-[18px] font-bold tracking-[-0.3px]">
                Pedidos recentes
              </div>
              <Link
                to="/ganhos"
                className="px-2 py-1.5 text-[13.5px] font-semibold text-primary transition-colors hover:text-primary-glow"
              >
                Ver todos
              </Link>
            </div>

            {isLoading ? (
              <div className="space-y-3 pt-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-14 w-full" />
                ))}
              </div>
            ) : orders.length === 0 ? (
              <p className="py-10 text-center text-sm text-muted-foreground">
                {notConnected
                  ? "Conecte o TikTok para ver seus pedidos aqui."
                  : "Nenhum pedido no período."}
              </p>
            ) : (
              <div>
                {orders.slice(0, 5).map((o) => {
                  const sku = o.skus?.[0];
                  const commission = (o.skus ?? []).reduce((s, k) => s + commissionOf(k), 0);
                  const type = sku?.content_type ?? "";
                  return (
                    <div key={o.id} className="flex items-center gap-3.5 border-t py-[15px]">
                      <div className="bg-hatch h-[46px] w-[46px] shrink-0 rounded-xl border" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[14.5px] font-semibold">
                          {sku?.product_name ?? `Pedido ${o.id}`}
                        </p>
                        <p className="mt-[3px] truncate text-[12.5px] text-faint">
                          {[sku?.shop_name, CONTENT_LABEL[type], timeAgo(o.create_time)]
                            .filter(Boolean)
                            .join(" · ")}
                        </p>
                      </div>
                      <Badge variant={statusVariant(o.status)} className="hidden sm:inline-flex">
                        {o.status ?? "—"}
                      </Badge>
                      <div className="min-w-[104px] text-right">
                        <p className="num text-[14.5px] font-bold">
                          {money(parseAmount(sku?.price?.amount), sku?.price?.currency)}
                        </p>
                        <p className="mt-0.5 text-[12.5px] font-semibold text-success">
                          + {money(commission, kpis.currency)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="flex min-w-0 flex-col gap-gap">
          {/* ── Feed ── */}
          <div className="tile">
            <div className="mb-1 flex items-center gap-[9px]">
              <span className="h-2 w-2 animate-breathe rounded-full bg-success" />
              <div className="font-display text-[17px] font-bold tracking-[-0.3px]">
                Acontecendo agora
              </div>
            </div>

            {isLoading ? (
              <div className="space-y-3 pt-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : feed.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">Nada por aqui ainda.</p>
            ) : (
              feed.map(({ id, icon: Icon, text, source, time, value }, i) => (
                <div
                  key={id ?? i}
                  className={cn(
                    "flex items-start gap-3 border-t py-3.5",
                    // a primeira linha encosta no título sem régua, como no design
                    i === 0 && "animate-rise border-t-0"
                  )}
                >
                  <span className="tint text-success">
                    <Icon className="h-[19px] w-[19px] stroke-[1.6]" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm leading-[1.4]">{text}</p>
                    <p className="mt-[3px] text-xs text-faint">
                      {[source, time].filter(Boolean).join(" · ")}
                    </p>
                  </div>
                  <span className="whitespace-nowrap text-[13.5px] font-bold text-success">
                    {value}
                  </span>
                </div>
              ))
            )}
          </div>

          {/* ── Atalhos ── */}
          <div className="tile">
            <div className="font-display text-[17px] font-bold tracking-[-0.3px]">
              Por onde continuar
            </div>
            <p className="mt-[3px] text-[13.5px] leading-[1.5] text-faint">
              Três coisas rápidas para o resto do dia.
            </p>
            <div className="mt-4 flex flex-col gap-2.5">
              {SHORTCUTS.map(({ to, icon: Icon, title, sub }) => (
                <Link
                  key={to}
                  to={to}
                  className="flex items-start gap-3 rounded-pill border bg-secondary p-3.5 transition-colors hover:border-primary"
                >
                  <span className="tint text-primary">
                    <Icon className="h-[19px] w-[19px] stroke-[1.6]" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold leading-[1.35]">{title}</p>
                    <p className="mt-1 text-[12.5px] leading-[1.45] text-faint">{sub}</p>
                  </div>
                  <ChevronRight className="mt-0.5 h-[19px] w-[19px] shrink-0 text-faint" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
