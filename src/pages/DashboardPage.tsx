import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Wallet, ShoppingBag, Ticket, TrendingUp, PlugZap } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAffiliateOrders, type GanhosFilters } from "@/hooks/useGanhos";
import { formatCurrency, formatDate } from "@/lib/formatters";

/** Janela padrão: últimos 30 dias (Unix em segundos). */
function last30Days(): GanhosFilters {
  const now = Math.floor(Date.now() / 1000);
  return { createTimeGe: now - 30 * 24 * 3600, createTimeLt: now };
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

export default function DashboardPage() {
  const filters = useMemo(last30Days, []);
  const { data, isLoading, error } = useAffiliateOrders(filters);

  const orders = useMemo(() => data?.orders ?? [], [data]);

  const kpis = useMemo(() => {
    let gross = 0;
    let currency = "BRL";
    let skuCount = 0;
    for (const o of orders) {
      for (const s of o.skus ?? []) {
        skuCount++;
        gross += parseAmount(s.price?.amount);
        if (s.price?.currency) currency = s.price.currency;
      }
    }
    const avgTicket = orders.length ? gross / orders.length : 0;
    return { gross, currency, skuCount, orderCount: orders.length, avgTicket };
  }, [orders]);

  // Sem backend ainda / TikTok não conectado → estado de conexão.
  const notConnected = !!error;

  return (
    <div className="space-y-6">
      <header className="animate-slide-up">
        <h1 className="text-2xl font-bold tracking-tight">Painel de Ganhos</h1>
        <p className="text-muted-foreground">Suas comissões e vendas dos últimos 30 dias.</p>
      </header>

      {notConnected && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="flex flex-col items-start gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <PlugZap className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">Conecte sua conta de creator</p>
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

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Vendas geradas (GMV)"
          value={money(kpis.gross, kpis.currency)}
          icon={Wallet}
          accent="primary"
          loading={isLoading}
          hint="Soma dos pedidos atribuídos a você"
        />
        <StatCard
          label="Pedidos"
          value={String(kpis.orderCount)}
          icon={ShoppingBag}
          accent="info"
          loading={isLoading}
        />
        <StatCard
          label="Itens vendidos"
          value={String(kpis.skuCount)}
          icon={TrendingUp}
          accent="success"
          loading={isLoading}
        />
        <StatCard
          label="Ticket médio"
          value={money(kpis.avgTicket, kpis.currency)}
          icon={Ticket}
          accent="warning"
          loading={isLoading}
        />
      </section>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Pedidos recentes</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : orders.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              {notConnected
                ? "Conecte o TikTok para ver seus pedidos aqui."
                : "Nenhum pedido no período."}
            </p>
          ) : (
            <div className="divide-y">
              {orders.slice(0, 10).map((o) => {
                const first = o.skus?.[0];
                return (
                  <div key={o.id} className="flex items-center justify-between gap-4 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {first?.product_name ?? `Pedido ${o.id}`}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(o.create_time)}
                        {first?.content_type ? ` · ${first.content_type}` : ""}
                        {first?.shop_name ? ` · ${first.shop_name}` : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold">
                        {money(parseAmount(first?.price?.amount), first?.price?.currency)}
                      </span>
                      <Badge variant={o.status === "SETTLED" ? "success" : "secondary"}>
                        {o.status}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
