import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  Wallet, ShoppingBag, Receipt, Tag, PlugZap, Zap, Radio, Store, Film,
  ChevronRight, Compass, Link2, Clapperboard, type LucideIcon, TriangleAlert, ChevronLeft } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { useAllAffiliateOrders, salesBaseOf, type GanhosFilters } from "@/hooks/useGanhos";
import { isNotConnected } from "@/services/creatorClient";
import { PeriodPicker } from "@/components/PeriodPicker";
import { DAY, ROLLING_DAYS, resolvePeriod, type Period } from "@/lib/period";
import { useOpenCollaborationByIds } from "@/hooks/useDescoberta";
import { formatCurrency, parseAmount } from "@/lib/formatters";
import { cn } from "@/lib/utils";


/**
 * Miniatura do pedido.
 *
 * Search Creator Affiliate Orders NÃO devolve imagem do produto (só id e nome), por
 * isso o cartão nascia com um placeholder hachurado. A foto vem de um segundo
 * endpoint, por product_id; se o produto não resolver (ou a imagem falhar), cai de
 * volta no placeholder em vez de deixar um quadrado quebrado.
 */
function OrderThumb({ src, alt }: { src?: string; alt?: string }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) return <div className="bg-hatch h-[46px] w-[46px] shrink-0 rounded-xl border" />;
  return (
    <img
      src={src}
      alt={alt ?? ""}
      onError={() => setFailed(true)}
      className="h-[46px] w-[46px] shrink-0 rounded-xl border object-cover"
    />
  );
}

/** formatCurrency com fallback — nunca derruba a tela se vier um código de moeda inválido. */
function money(amount: number, currency?: string): string {
  try {
    return formatCurrency(amount, currency || "BRL");
  } catch {
    return `${amount.toFixed(2)} ${currency ?? ""}`.trim();
  }
}

/**
 * Comissão da SKU — vem DA API, não é recalculada aqui.
 *
 * `price * commission_rate` dá um número diferente do que a TikTok paga: a base de
 * cálculo (`estimated_commission_base`) não é o preço, e o valor final embute bônus e
 * regras de tier. Para pedido liquidado vale `actual_commission`; nos demais, a
 * estimativa. Atenção: `*_commission_base` é a BASE, não a comissão.
 */
function commissionOf(sku: {
  estimated_commission?: { amount?: string };
  actual_commission?: { amount?: string };
}, orderStatus?: string): number {
  if (orderStatus === "SETTLED") {
    const actual = parseAmount(sku.actual_commission?.amount);
    if (actual) return actual;
  }
  return parseAmount(sku.estimated_commission?.amount);
}

type Order = NonNullable<
  ReturnType<typeof useAllAffiliateOrders>["data"]
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
      gross += salesBaseOf(s, o.status);
      commission += commissionOf(s, o.status);
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

export default function DashboardPage() {
  // Largura real da área de barras: decide se o rótulo de valor cabe. Chutar por
  // número de colunas errava — depende também do tamanho da tela.
  //
  // Callback ref (e não useRef + useEffect): a área só existe depois que os dados
  // chegam; um efeito de montagem rodaria enquanto ainda era skeleton e nunca mais.
  const [plotWidth, setPlotWidth] = useState(0);
  const observerRef = useRef<ResizeObserver | null>(null);
  const plotRef = useCallback((node: HTMLDivElement | null) => {
    observerRef.current?.disconnect();
    if (!node) return;
    setPlotWidth(node.getBoundingClientRect().width);
    observerRef.current = new ResizeObserver(([entry]) => setPlotWidth(entry.contentRect.width));
    observerRef.current.observe(node);
  }, []);

  const { user } = useAuth();
  // Período de TODO o painel. Antes era fixo em 30 dias e nada na tela dizia isso.
  const [periodKey, setPeriodKey] = useState<string>("month");
  // Qual mês está sendo olhado: 0 = mês corrente, 1 = anterior, e assim por diante.
  const [monthOffset, setMonthOffset] = useState(0);
  const name = ((user?.user_metadata?.name as string | undefined) ?? "").split(" ")[0];

  // Duas janelas comparáveis: a atual e a anterior, para a variação.
  const now = useMemo(() => Math.floor(Date.now() / 1000), []);
  const resolved = useMemo(() => {
    const period: Period =
      periodKey === "month"
        ? { kind: "month", offset: monthOffset }
        : { kind: "rolling", days: ROLLING_DAYS[periodKey] ?? 30 };
    return resolvePeriod(period, now);
  }, [periodKey, monthOffset, now]);
  const { current, previous } = resolved;


  const { data, isLoading, error, isPending, isError, fetchStatus } = useAllAffiliateOrders(current);

  // "Ainda sem resposta" != "carregou e deu zero". Num painel de comissão, exibir
  // R$ 0,00 antes da API responder afirma que o creator não ganhou nada.
  const noData = isPending && !isError;
  const offline = fetchStatus === "paused";
  const busy = isLoading || noData;
  const { data: prevData } = useAllAffiliateOrders(previous);

  const orders = useMemo(() => data?.orders ?? [], [data]);
  // ATENÇÃO: `total_count` da API conta ITENS (SKUs), não pedidos — conferido em
  // 7/30/90 dias. O número de pedidos é o tamanho da lista, já que percorremos
  // todas as páginas (ver useAllAffiliateOrders).
  const orderTotal = orders.length;
  const kpis = useMemo(() => totalsOf(orders), [orders]);
  const prevKpis = useMemo(() => totalsOf(prevData?.orders ?? []), [prevData]);

  /**
 * Rótulo curto para a barra do gráfico: com cifrão para deixar claro que é dinheiro,
 * mas sem centavos e com milhar abreviado — são até 14 colunas lado a lado.
 */
function compactAmount(value: number, dense = false): string {
  const n = value >= 1000 ? (value / 1000).toFixed(1).replace(".", ",") + "k" : Math.round(value).toString();
  // No mês cheio são até 31 colunas: sem o espaço depois do cifrão sobra ~4px por rótulo.
  return dense ? `R$${n}` : `R$ ${n}`;
}

/** Comissão por dia na janela escolhida — a série do gráfico. */
  /**
   * Série do gráfico: cobre a JANELA INTEIRA do período escolhido.
   *
   * Antes o gráfico tinha o próprio seletor (7/14/30 dias), que brigava com o filtro
   * do painel: com "agosto" selecionado ele desenhava só os últimos 14 dias e o mês
   * aparecia cortado, começando no dia 8. Janelas longas (90 dias) são agrupadas por
   * semana, senão as barras ficam com poucos pixels.
   */
  const chart = useMemo(() => {
    const startDate = new Date(current.createTimeGe * 1000);
    startDate.setHours(0, 0, 0, 0);
    const lastDate = new Date((current.createTimeLt - 1) * 1000);
    lastDate.setHours(0, 0, 0, 0);

    const dayCount = Math.max(1, Math.round((lastDate.getTime() - startDate.getTime()) / (DAY * 1000)) + 1);
    const groupDays = dayCount > 31 ? 7 : 1;
    const bucketCount = Math.ceil(dayCount / groupDays);

    const buckets = Array.from({ length: bucketCount }, (_, i) => {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i * groupDays);
      return { date: d, value: 0 };
    });

    const firstTs = startDate.getTime() / 1000;
    for (const o of orders) {
      if (!o.create_time || o.create_time < firstTs) continue;
      const index = Math.floor((o.create_time - firstTs) / (DAY * groupDays));
      if (index < 0 || index >= buckets.length) continue;
      for (const s of o.skus ?? []) buckets[index].value += commissionOf(s, o.status);
    }

    const max = Math.max(...buckets.map((b) => b.value), 1);
    const total = buckets.reduce((acc, b) => acc + b.value, 0);
    return { buckets, max, total, groupDays, dayCount };
  }, [orders, current.createTimeGe, current.createTimeLt]);

  /** Largura por coluna; abaixo de ~30px o rótulo "R$ 897" não cabe sem invadir a vizinha. */
  const gapPx = chart.buckets.length > 24 ? 2 : chart.buckets.length > 16 ? 4 : 9;
  const colWidth = plotWidth
    ? (plotWidth - gapPx * Math.max(0, chart.buckets.length - 1)) / chart.buckets.length
    : 0;
  const showBarLabels = colWidth >= 30;

  /** Os pedidos exibidos no cartão e as imagens correspondentes. */
  const recentOrders = useMemo(() => orders.slice(0, 5), [orders]);
  const recentProductIds = useMemo(
    () =>
      [
        ...new Set(
          recentOrders.map((o) => o.skus?.[0]?.product_id).filter((id): id is string => !!id)
        ),
      ],
    [recentOrders]
  );
  const { data: productDetails } = useOpenCollaborationByIds(recentProductIds);
  const imageByProduct = useMemo(() => {
    const map = new Map<string, string>();
    for (const prod of productDetails?.products ?? []) {
      if (prod.id && prod.main_image_url) map.set(String(prod.id), prod.main_image_url);
    }
    return map;
  }, [productDetails]);

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

  // Só é "não conectado" quando a API diz isso. Escopo ausente, região bloqueada ou
  // erro da TikTok são outras causas e merecem outra mensagem.
  const notConnected = isNotConnected(error);
  const failureMessage = !notConnected && error instanceof Error ? error.message : null;
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
    <div className="w-full">
      {/* ── Saudação ── */}
      <header className="mb-[26px] animate-slide-up">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <p className="text-[13px] font-semibold uppercase tracking-[0.4px] text-faint">
            {todayLabel}
          </p>
          <PeriodPicker
            periodKey={periodKey}
            onPeriodKey={setPeriodKey}
            monthOffset={monthOffset}
            onMonthOffset={setMonthOffset}
            monthLabel={resolved.kpiLabel}
          />
        </div>
        <h1 className="mt-2 font-display text-[30px] font-extrabold leading-[1.1] tracking-[-1.1px] md:text-[36px]">
          {greeting()}
          {name ? `, ${name}` : ""}
        </h1>
        {!busy && !notConnected && (
          <p className="mt-2.5 max-w-[560px] text-pretty text-base leading-[1.55] text-muted-foreground">
            {kpis.orderCount > 0 ? (
              <>
                Em {resolved.subject} entraram {orderTotal}{" "}
                {orderTotal === 1 ? "pedido" : "pedidos"} e{" "}
                <strong className="font-semibold text-foreground">
                  {money(kpis.commission, kpis.currency)}
                </strong>{" "}
                em comissão.
              </>
            ) : (
              `Nenhum pedido em ${resolved.subject}. Assim que uma venda entrar, ela aparece aqui.`
            )}
          </p>
        )}
      </header>

      {(offline || failureMessage) && (
        <Card className="mb-gap border-warning/30 bg-warning/5">
          <CardContent className="flex items-start gap-3 p-5">
            <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0 text-warning" />
            <div>
              <p className="font-semibold">
                {offline ? "Sem conexão com o servidor" : "Não foi possível carregar seus ganhos"}
              </p>
              <p className="text-sm text-muted-foreground">
                {offline
                  ? "Os números abaixo não refletem seus ganhos. Verifique a internet e recarregue."
                  : failureMessage}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

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
          label={`Comissão · ${resolved.kpiLabel}`}
          value={money(kpis.commission, kpis.currency)}
          icon={Wallet}
          accent="primary"
          loading={busy}
          delta={commissionDelta?.text}
          up={commissionDelta?.up}
          deltaLabel={commissionDelta ? resolved.deltaLabel : resolved.subject}
        />
        <StatCard
          label="Vendas geradas"
          value={money(kpis.gross, kpis.currency)}
          icon={ShoppingBag}
          accent="success"
          loading={busy}
          delta={grossDelta?.text}
          up={grossDelta?.up}
          deltaLabel={grossDelta ? resolved.deltaLabel : "GMV atribuído a você"}
        />
        <StatCard
          label="Pedidos"
          value={String(kpis.orderCount)}
          icon={Receipt}
          accent="warning"
          loading={busy}
          delta={orderDelta?.text}
          up={orderDelta?.up}
          deltaLabel={orderDelta ? resolved.deltaLabel : `${kpis.skuCount} itens vendidos`}
        />
        <StatCard
          label="Ticket médio"
          value={money(kpis.avgTicket, kpis.currency)}
          icon={Tag}
          accent="info"
          loading={busy}
          delta={ticketDelta?.text}
          up={ticketDelta?.up}
          deltaLabel={ticketDelta ? resolved.deltaLabel : "por pedido"}
        />
      </section>

      <div className="mb-gap">
          {/* ── Comissão por dia ── */}
          <div className="tile">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="font-display text-[18px] font-bold tracking-[-0.3px]">
                  Comissão por dia
                </div>
                <p className="mt-[3px] text-[13.5px] text-faint">
                  A partir dos pedidos atribuídos ao seu conteúdo
                  {/* Sem resposta ainda, o total fica de fora — "R$ 0,00" aqui seria mentira. */}
                  {!busy && (
                    <>
                      {" · total "}
                      <strong className="font-semibold text-foreground">
                        {money(chart.total, kpis.currency)}
                      </strong>{" "}
                      em {chart.dayCount} dias
                    </>
                  )}
                </p>
              </div>
            </div>

            {busy ? (
              <Skeleton className="mt-6 h-[190px] w-full" />
            ) : (
              <div className="mt-[26px] flex gap-2">
                {/* Eixo Y: dá a escala mesmo quando não cabe rótulo em cada barra. */}
                <div
                  className={cn(
                    "flex h-[190px] shrink-0 flex-col justify-between text-[9.5px] tabular-nums text-faint",
                    // a faixa das barras exclui o eixo de dias (embaixo) e, quando há
                    // rótulo de valor, também a linha dele (em cima)
                    "pb-[19px]",
                    showBarLabels ? "pt-[15px]" : "pt-0"
                  )}
                >
                  <span>{money(chart.max, kpis.currency)}</span>
                  <span>{money(chart.max / 2, kpis.currency)}</span>
                  <span>R$ 0</span>
                </div>
                <div
                  ref={plotRef}
                  style={{ gap: `${gapPx}px` }}
                  className="relative flex h-[190px] min-w-0 flex-1 items-end overflow-hidden"
                >
                  {/* linhas de referência alinhadas ao eixo */}
                  <div
                    className={cn(
                      "pointer-events-none absolute inset-x-0 bottom-[19px]",
                      showBarLabels ? "top-[15px]" : "top-0"
                    )}
                  >
                    <div className="absolute inset-x-0 top-0 border-t border-border/40" />
                    <div className="absolute inset-x-0 top-1/2 border-t border-border/25" />
                    <div className="absolute inset-x-0 bottom-0 border-t border-border/40" />
                  </div>
                {chart.buckets.map((b, i) => {
                  const last = i === chart.buckets.length - 1;
                  return (
                    <div
                      key={b.date.toISOString()}
                      className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-[5px]"
                    >
                      {showBarLabels && (
                      <span
                        className={cn(
                          "whitespace-nowrap text-[9.5px] leading-none tracking-[-0.2px] tabular-nums",
                          b.value === 0 ? "opacity-0" : last ? "font-bold text-primary" : "text-faint"
                        )}
                      >
                        {b.value > 0 ? compactAmount(b.value) : "R$ 0"}
                      </span>
                      )}
                      <div
                        title={
                          chart.groupDays === 1
                            ? `${b.date.toLocaleDateString("pt-BR")} — ${money(b.value, kpis.currency)}`
                            : `semana de ${b.date.toLocaleDateString("pt-BR")} — ${money(b.value, kpis.currency)}`
                        }
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
                        {chart.groupDays === 1
                          ? b.date.getDate()
                          : `${b.date.getDate()}/${b.date.getMonth() + 1}`}
                      </span>
                    </div>
                  );
                })}
                </div>
              </div>
            )}
          </div>

      </div>

      <div className="grid gap-gap xl:grid-cols-[1.6fr_1fr] xl:items-start">
        <div className="flex min-w-0 flex-col gap-gap">
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

            {busy ? (
              <div className="space-y-3 pt-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-14 w-full" />
                ))}
              </div>
            ) : orders.length === 0 ? (
              <p className="py-10 text-center text-sm text-muted-foreground">
                {notConnected
                  ? "Conecte o TikTok para ver seus pedidos aqui."
                  : failureMessage
                    ? "Não foi possível carregar os pedidos."
                    : "Nenhum pedido no período."}
              </p>
            ) : (
              <div>
                {recentOrders.map((o) => {
                  const sku = o.skus?.[0];
                  const commission = (o.skus ?? []).reduce((s, k) => s + commissionOf(k, o.status), 0);
                  const type = sku?.content_type ?? "";
                  return (
                    <div key={o.id} className="flex items-center gap-3.5 border-t py-[15px]">
                      <OrderThumb
                        src={sku?.product_id ? imageByProduct.get(String(sku.product_id)) : undefined}
                        alt={sku?.product_name}
                      />
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

            {busy ? (
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
