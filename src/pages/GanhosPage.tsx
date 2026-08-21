import { useEffect, useMemo, useState } from "react";
import { AlertCircle, BadgeCheck, Package, ChevronRight, type LucideIcon, Radio, ShoppingBag, Store, Ticket, TrendingUp, Video, Wallet, Search } from "lucide-react";
import { PeriodPicker } from "@/components/PeriodPicker";
import { ROLLING_DAYS, resolvePeriod, type Period } from "@/lib/period";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard } from "@/components/StatCard";
import { useAllAffiliateOrders, useTraceOrders, salesBaseOf, type GanhosFilters } from "@/hooks/useGanhos";
import { USE_MOCK } from "@/services/creatorClient";
import { formatCurrency, formatNumber, formatPercent, parseAmount } from "@/lib/formatters";

type Money = { amount?: string; currency?: string };

const CONTENT_LABELS: Record<string, string> = {
  VIDEO: "Vídeo",
  LIVE: "Live",
  SHOP: "Loja",
  PRE_LIVE: "Pré-live",
  PROMOTION_PAGE: "Página promo",
  LINKSHARE: "Link compartilhado",
};

const CONTENT_ICONS: Record<string, LucideIcon> = {
  VIDEO: Video,
  LIVE: Radio,
  SHOP: Store,
};

const STATUS_LABELS: Record<string, string> = {
  SETTLED: "Pago",
  REFUNDED: "Reembolsado",
  FROZEN: "Congelado",
  ORDERED: "Pedido",
  DEDUCTED: "Deduzido",
  "AWAITING PAYMENT": "Aguardando pagamento",
  "To-SETTLE": "A liquidar",
  UNSPECIFIED: "Indefinido",
};

function statusVariant(status?: string): "success" | "destructive" | "secondary" {
  if (status === "SETTLED") return "success";
  if (status === "REFUNDED" || status === "FROZEN") return "destructive";
  return "secondary"; // ORDERED, AWAITING PAYMENT, To-SETTLE, DEDUCTED, UNSPECIFIED…
}

/** Alguns valores mock vêm com símbolo de moeda embutido (ex.: "Rp9.900") — limpa antes de parsear. */

/** formatCurrency com fallback — nunca derruba a tela se vier um código de moeda inválido do fixture. */
function money(amount: number, currency?: string): string {
  try {
    return formatCurrency(amount, currency || "BRL");
  } catch {
    return `${amount.toFixed(2)} ${currency ?? ""}`.trim();
  }
}

/**
 * Comissão "resolvida" da SKU: valor fechado quando o pedido já foi pago, estimativa
 * caso contrário.
 *
 * `estimated_commission_base` é a BASE DE CÁLCULO, não a comissão — usá-la inflava o
 * valor em cerca de 10x (ex.: base R$ 29,98 para uma comissão de R$ 1,48).
 */
function resolveCommission(
  orderStatus: string | undefined,
  sku: { actual_commission?: Money; estimated_commission?: Money }
): Money | undefined {
  if (orderStatus === "SETTLED") return sku.actual_commission ?? sku.estimated_commission;
  return sku.estimated_commission ?? sku.actual_commission;
}

interface OrderRow {
  key: string;
  product: string;
  shop: string;
  contentType?: string;
  status?: string;
  price?: Money;
  commission?: Money;
  rate?: number;
}

export default function GanhosPage() {
  // Mesmo seletor do Painel: janelas móveis e mês de calendário, com o mesmo cálculo.
  const [periodKey, setPeriodKey] = useState<string>("month");
  const [monthOffset, setMonthOffset] = useState(0);
  // A aba padrão é a que funciona hoje. O rastreio depende de
  // `creator.affiliate.share_link.read`, que o token ainda não tem.
  const [tab, setTab] = useState<"trace" | "orders">("orders");
  const [traceToken, setTraceToken] = useState<string | undefined>();
  const [ordersToken, setOrdersToken] = useState<string | undefined>();

  // troca de período reinicia a paginação das duas listas
  useEffect(() => {
    setTraceToken(undefined);
    setOrdersToken(undefined);
  }, [periodKey, monthOffset]);

  const now = useMemo(() => Math.floor(Date.now() / 1000), []);
  const resolved = useMemo(() => {
    const period: Period =
      periodKey === "month"
        ? { kind: "month", offset: monthOffset }
        : { kind: "rolling", days: ROLLING_DAYS[periodKey] ?? 30 };
    return resolvePeriod(period, now);
  }, [periodKey, monthOffset, now]);
  const range = resolved.current;
  const traceFilters: GanhosFilters = useMemo(
    () => ({ ...range, pageToken: traceToken, pageSize: 20 }),
    [range, traceToken]
  );
  const ordersFilters: GanhosFilters = useMemo(
    () => ({ ...range, pageToken: ordersToken, pageSize: 20 }),
    [range, ordersToken]
  );

  const trace = useTraceOrders(traceFilters);
  const affiliate = useAllAffiliateOrders(range);

  // Sem resposta ainda (pendente ou pausado por falta de rede) não é "zero ganho".
  const traceNoData = trace.isPending && !trace.isError;
  const affiliateNoData = affiliate.isPending && !affiliate.isError;
  const offline = affiliate.fetchStatus === "paused";

  const traceOrders = useMemo(() => trace.data?.orders ?? [], [trace.data]);
  const affiliateOrders = useMemo(() => affiliate.data?.orders ?? [], [affiliate.data]);

  /**
   * KPIs a partir de Search Creator Affiliate Orders.
   *
   * Antes vinham do Trace Orders, que responde 105005 por falta do escopo
   * `creator.affiliate.share_link.read` — os cinco cartões ficavam vazios mesmo com
   * a conta conectada. Esta fonte é a mesma do Painel, então os números batem entre
   * as duas telas.
   */
  const kpis = useMemo(() => {
    let gmv = 0;
    let estimated = 0;
    let settled = 0;
    let itemCount = 0;
    let currency = "BRL";
    for (const order of affiliateOrders) {
      const isSettled = order.status === "SETTLED";
      for (const sku of order.skus ?? []) {
        itemCount += 1;
        gmv += salesBaseOf(sku, order.status);
        if (sku.price?.currency) currency = sku.price.currency;
        const actual = parseAmount(sku.actual_commission?.amount);
        const estimate = parseAmount(sku.estimated_commission?.amount);
        estimated += isSettled ? actual : estimate;
        if (isSettled) settled += actual;
      }
    }
    const orderCount = affiliateOrders.length;
    const avgTicket = orderCount ? gmv / orderCount : 0;
    return { gmv, estimated, settled, orderCount, itemCount, avgTicket, currency };
  }, [affiliateOrders]);

  const traceRows: OrderRow[] = useMemo(
    () =>
      traceOrders.flatMap((o) =>
        (o.skus ?? []).map((s) => ({
          key: `${o.id}-${s.id}`,
          product: s.product_name || `Produto ${s.product_id ?? "—"}`,
          shop: s.shop_name || "—",
          contentType: s.content_type,
          status: o.status,
          price: s.price,
          commission: resolveCommission(o.status, s),
          rate: s.commission_rate,
        }))
      ),
    [traceOrders]
  );

  const affiliateRows: OrderRow[] = useMemo(
    () =>
      affiliateOrders.flatMap((o) =>
        (o.skus ?? []).map((s) => ({
          key: `${o.id}-${s.id}`,
          product: s.product_name || `Produto ${s.product_id ?? "—"}`,
          shop: s.shop_name || "—",
          contentType: s.content_type,
          status: o.status,
          price: s.price,
          commission: resolveCommission(o.status, s),
          rate: s.commission_rate,
        }))
      ),
    [affiliateOrders]
  );

  const active =
    tab === "trace"
      ? {
          rows: traceRows,
          isLoading: trace.isLoading || traceNoData,
          error: trace.error,
          nextToken: trace.data?.next_page_token,
          token: traceToken,
          setToken: setTraceToken,
          source: "Creator Search Affiliate Trace Orders (202505)",
        }
      : {
          rows: affiliateRows,
          isLoading: affiliate.isLoading || affiliateNoData,
          error: affiliate.error,
          // Já percorremos todas as páginas do período — não há cursor a exibir.
          nextToken: undefined,
          token: undefined,
          setToken: () => {},
          source: "Search Creator Affiliate Orders (202410)",
        };

  return (
    <div className="space-y-gap">
      <PageHeader title="Ganhos & Rastreio" subtitle="Comissões e pedidos de afiliado gerados pelo seu conteúdo." />

      <PeriodPicker
        periodKey={periodKey}
        onPeriodKey={setPeriodKey}
        monthOffset={monthOffset}
        onMonthOffset={setMonthOffset}
        monthLabel={resolved.kpiLabel}
      />

      {offline && (
        <ErrorBanner text="Sem conexão com o servidor — os valores abaixo não refletem seus ganhos. Verifique a internet e recarregue." />
      )}

      {trace.error && (
        <ErrorBanner
          text={`Não foi possível carregar o rastreio de comissões (Trace Orders): ${
            (trace.error as Error).message
          }. Se estiver em modo live, confira se o escopo "creator.affiliate.share_link.read" está liberado no app.`}
        />
      )}

      {/* KPIs — Trace Orders */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="GMV do período"
          value={money(kpis.gmv, kpis.currency)}
          icon={Wallet}
          accent="primary"
          loading={affiliate.isLoading || affiliateNoData}
          hint="Base de comissão do período (preço × quantidade)"
        />
        <StatCard
          label="Comissão estimada"
          value={money(kpis.estimated, kpis.currency)}
          icon={TrendingUp}
          accent="info"
          loading={affiliate.isLoading || affiliateNoData}
          hint="Fechada quando SETTLED, estimada nos demais"
        />
        <StatCard
          label="Comissão paga (settled)"
          value={money(kpis.settled, kpis.currency)}
          icon={BadgeCheck}
          accent="success"
          loading={affiliate.isLoading || affiliateNoData}
          hint="Só pedidos já liquidados"
        />
        <StatCard
          label="Nº de pedidos"
          value={formatNumber(kpis.orderCount)}
          icon={ShoppingBag}
          accent="warning"
          loading={affiliate.isLoading || affiliateNoData}
          hint={kpis.itemCount ? `${formatNumber(kpis.itemCount)} itens vendidos` : undefined}
        />
        <StatCard
          label="Ticket médio"
          value={money(kpis.avgTicket, kpis.currency)}
          icon={Ticket}
          accent="primary"
          loading={affiliate.isLoading || affiliateNoData}
        />
      </section>

      {/* Lista de pedidos */}
      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-base">Pedidos</CardTitle>
            <p className="mt-0.5 text-xs text-muted-foreground">Fonte: {active.source}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant={tab === "trace" ? "toggle-on" : "toggle"} onClick={() => setTab("trace")}>
              Rastreio de comissão
            </Button>
            <Button size="sm" variant={tab === "orders" ? "toggle-on" : "toggle"} onClick={() => setTab("orders")}>
              Pedidos por conteúdo
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {active.error ? (
            <ErrorBanner text={`Não foi possível carregar os pedidos: ${(active.error as Error).message}`} />
          ) : active.isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : active.rows.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-16 text-center text-muted-foreground">
              <Package className="h-8 w-8" />
              <p className="text-sm">Nenhum pedido no período selecionado.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="pb-2 pr-4 font-medium">Produto</th>
                    <th className="pb-2 pr-4 font-medium">Loja</th>
                    <th className="pb-2 pr-4 font-medium">Conteúdo</th>
                    <th className="pb-2 pr-4 font-medium">Status</th>
                    <th className="pb-2 pr-4 text-right font-medium">Valor</th>
                    <th className="pb-2 text-right font-medium">Comissão</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {active.rows.map((row) => {
                    const ContentIcon = (row.contentType && CONTENT_ICONS[row.contentType]) || Package;
                    return (
                      <tr key={row.key} className="align-top">
                        <td className="max-w-[220px] truncate py-3 pr-4 font-medium">{row.product}</td>
                        <td className="max-w-[160px] truncate py-3 pr-4 text-muted-foreground">{row.shop}</td>
                        <td className="py-3 pr-4">
                          <Badge variant="outline" className="gap-1 whitespace-nowrap font-normal">
                            <ContentIcon className="h-3 w-3" />
                            {(row.contentType && CONTENT_LABELS[row.contentType]) || row.contentType || "—"}
                          </Badge>
                        </td>
                        <td className="py-3 pr-4">
                          <Badge variant={statusVariant(row.status)} className="whitespace-nowrap">
                            {(row.status && STATUS_LABELS[row.status]) || row.status || "—"}
                          </Badge>
                        </td>
                        <td className="whitespace-nowrap py-3 pr-4 text-right font-medium">
                          {money(parseAmount(row.price?.amount), row.price?.currency)}
                        </td>
                        <td className="whitespace-nowrap py-3 text-right">
                          <p className="font-semibold text-success">
                            {money(parseAmount(row.commission?.amount), row.commission?.currency)}
                          </p>
                          {row.rate != null && (
                            <p className="text-xs text-muted-foreground">{formatPercent(row.rate / 10000, 2)}</p>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {!active.isLoading && active.rows.length > 0 && (active.token || active.nextToken) && (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t pt-4">
              <Button size="sm" variant="outline" disabled={!active.token} onClick={() => active.setToken(undefined)}>
                Primeira página
              </Button>
              <div className="flex items-center gap-3">
                {USE_MOCK && (
                  <span className="text-xs text-muted-foreground">O mock sempre retorna a mesma página de exemplo</span>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  disabled={!active.nextToken}
                  onClick={() => active.setToken(active.nextToken)}
                  className="gap-1"
                >
                  Próxima página <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
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
