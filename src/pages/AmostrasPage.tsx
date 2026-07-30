import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  Gift,
  ClipboardList,
  Truck,
  ShieldCheck,
  Package,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  AlertTriangle,
  Search,
  ArrowUpDown,
  ArrowUpNarrowWide,
  ArrowDownWideNarrow,
  ChevronRight,
  X,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard } from "@/components/StatCard";
import {
  useSampleApplications,
  useSampleApplicationDetail,
  useSampleApplicationFulfillments,
  useApplicableSampleLabel,
  type SampleApplicationStatus,
  type SampleFulfillmentStatus,
  type SampleApplicationsFilters,
  type SampleFulfillmentsFilters,
  type SampleApplicationDetailParams,
} from "@/hooks/useAmostras";
import { USE_MOCK } from "@/services/creatorClient";
import { formatMoney, formatNumber, formatDate } from "@/lib/formatters";
import type {
  SearchCreatorSampleApplicationsData,
  CreatorSearchSampleApplicationFulfillmentsData,
  GetCreatorApplicableSampleLabelData,
} from "@/types/creator-api.generated";

type SampleApplication = NonNullable<SearchCreatorSampleApplicationsData["sample_applications"]>[number];
type SampleFulfillment = NonNullable<CreatorSearchSampleApplicationFulfillmentsData["fulfillments"]>[number];
type SampleLabel = NonNullable<GetCreatorApplicableSampleLabelData["label"]>;
type SampleSku = NonNullable<NonNullable<SampleLabel["sample_product"]>["sample_sku_list"]>[number];

// =============== Labels e helpers compartilhados ===============

const APPLICATION_STATUS_LABELS: Record<string, string> = {
  PENDING: "Pendente",
  AWAITING_SHIPMENT: "Aguardando envio",
  SHIPPED: "Enviada",
  CONTENT_PENDING: "Aguardando conteúdo",
  REJECT_CANCELLED: "Rejeitada pelo vendedor",
  OVERDUE_CANCELLED: "Expirada",
  UNFULFILL_CANCELLED: "Compromisso não cumprido",
  FULFILLMENT_SUSPEND: "Fulfillment suspenso",
  DEL_OPEN_COLLAB: "Colaboração excluída",
  SELLER_NOT_SHIP_CANCELLED: "Vendedor não enviou",
  WITHDRAW_CANCELLED: "Retirada pelo creator",
  UNFULFILLABLE_CANCELLED: "Inviável de cumprir",
  OPS_CANCELLED: "Cancelada (operação)",
  OPS_FAILED: "Falhou (operação)",
  OPS_COMPLETED: "Concluída (operação)",
  COMPLETED: "Concluída",
  TO_BE_POST: "Aguardando postagem",
  POST_IN_REVIEW: "Post em revisão",
  POST_FAILED: "Post falhou",
  CANCELED: "Cancelada",
};

function applicationStatusVariant(status?: string): "success" | "destructive" | "warning" | "secondary" {
  const s = status?.toUpperCase();
  if (s === "COMPLETED" || s === "OPS_COMPLETED") return "success";
  if (s === "SHIPPED" || s === "CONTENT_PENDING" || s === "TO_BE_POST" || s === "POST_IN_REVIEW") return "warning";
  if (s?.endsWith("CANCELLED") || s === "OPS_FAILED" || s === "DEL_OPEN_COLLAB" || s === "POST_FAILED" || s === "CANCELED")
    return "destructive";
  return "secondary"; // PENDING, AWAITING_SHIPMENT, FULFILLMENT_SUSPEND…
}

const FULFILLMENT_STATUS_LABELS: Record<SampleFulfillmentStatus, string> = {
  PENDING: "Pendente",
  ONGOING: "Em andamento",
  SUCCEED: "Concluído",
  FAILED: "Falhou",
  OVERDUE: "Atrasado",
  SUSPEND: "Suspenso",
  CANCELLED: "Cancelado",
  EXEMPTED: "Dispensado",
};

function fulfillmentStatusVariant(status?: string): "success" | "destructive" | "warning" | "secondary" {
  const s = status?.toUpperCase();
  if (s === "SUCCEED" || s === "EXEMPTED") return "success";
  if (s === "ONGOING") return "warning";
  if (s === "FAILED" || s === "OVERDUE" || s === "CANCELLED") return "destructive";
  return "secondary"; // PENDING, SUSPEND
}

const BOUND_PRODUCT_STATUS_LABELS: Record<string, string> = {
  UNKNOWN: "Desconhecido",
  LIVE: "Disponível",
  OUT_OF_STOCK: "Sem estoque",
  SELLER_DEACTIVATE: "Desativado pelo vendedor",
  PLATFORM_DEACTIVATE: "Desativado pela plataforma",
  NO_PLAN: "Sem plano válido",
  PERMANENT_DELETED: "Excluído permanentemente",
};

const SAMPLE_TYPE_LABELS: Record<string, string> = {
  FREE_SAMPLE: "Amostra grátis",
  SAMPLE_COUPON: "Cupom de amostra",
  SAMPLE_CAMPAIGN: "Campanha de amostra",
  PLATFORM_FREE_SAMPLE: "Amostra grátis (plataforma)",
};

const LABEL_STATUS_LABELS: Record<string, string> = {
  TO_APPLY: "Ainda não solicitada",
  ONGOING: "Solicitação em andamento",
  COMPLETE: "Amostra concluída",
};

function labelStatusVariant(status?: string): "success" | "warning" | "secondary" {
  if (status === "COMPLETE") return "success";
  if (status === "ONGOING") return "warning";
  return "secondary"; // TO_APPLY
}

const UNAVAILABLE_REASON_LABELS: Record<string, string> = {
  IS_PREORDER: "Produto de pré-venda (sem amostra)",
  IS_GIFT: "Produto de brinde (sem amostra)",
  OUT_OF_STOCK: "Sem estoque",
  EXCEED_CB_PRICE_THRESHOLD: "Acima do limite de preço permitido",
  ALREADY_APPLYED: "Você já solicitou este SKU",
};

/** `sku_sale_property_value_names` é tipado como string[], mas o exemplo da doc pro
 *  detalhe devolve uma string única com aspas literais ("\"red, large size\"") — aceita
 *  os dois formatos defensivamente. */
function skuPropsToText(names?: string[] | string): string {
  if (!names) return "";
  if (Array.isArray(names)) return names.join(", ");
  return String(names).replace(/^"+|"+$/g, "");
}

/** expiration_time/total_suspend_duration vêm em segundos — formata como "1d 3h". */
function formatDuration(seconds?: number): string {
  if (!seconds || seconds <= 0) return "—";
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  if (days > 0) return `${days}d ${hours}h`;
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes}min`;
  return `${minutes}min`;
}

/** application_type aceito pelo detalhe é FREE_SAMPLE | SAMPLE_COUPON | SAMPLE_CAMPAIGN —
 *  PLATFORM_FREE_SAMPLE (só existe nos Fulfillments) não é documentado lá, então caímos
 *  pra FREE_SAMPLE nesse caso. */
function toDetailApplicationType(type?: string): string {
  if (type === "SAMPLE_COUPON" || type === "SAMPLE_CAMPAIGN") return type;
  return "FREE_SAMPLE";
}

type Tab = "applications" | "fulfillments" | "eligibility";

export default function AmostrasPage() {
  const [tab, setTab] = useState<Tab>("applications");

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="animate-slide-up">
          <h1 className="text-2xl font-bold tracking-tight">Amostras</h1>
          <p className="text-muted-foreground">
            Solicitações de amostra grátis, rastreio de envio e elegibilidade produto a produto.
          </p>
        </div>
        <Badge variant={USE_MOCK ? "warning" : "success"} className="mt-1 shrink-0">
          {USE_MOCK ? "Mock" : "Live"}
        </Badge>
      </header>

      <Card>
        <CardContent className="flex flex-wrap gap-2 p-4">
          <Button variant={tab === "applications" ? "default" : "outline"} onClick={() => setTab("applications")} className="gap-2">
            <ClipboardList className="h-4 w-4" /> Solicitações
          </Button>
          <Button variant={tab === "fulfillments" ? "default" : "outline"} onClick={() => setTab("fulfillments")} className="gap-2">
            <Truck className="h-4 w-4" /> Envios
          </Button>
          <Button variant={tab === "eligibility" ? "default" : "outline"} onClick={() => setTab("eligibility")} className="gap-2">
            <ShieldCheck className="h-4 w-4" /> Elegibilidade
          </Button>
        </CardContent>
      </Card>

      {tab === "applications" ? (
        <ApplicationsTab />
      ) : tab === "fulfillments" ? (
        <FulfillmentsTab />
      ) : (
        <EligibilityTab />
      )}
    </div>
  );
}

// =============== Aba 1: Solicitações ===============

const CANCEL_APPLICATION_STATUSES: SampleApplicationStatus[] = [
  "REJECT_CANCELLED",
  "OVERDUE_CANCELLED",
  "UNFULFILL_CANCELLED",
  "DEL_OPEN_COLLAB",
  "SELLER_NOT_SHIP_CANCELLED",
  "WITHDRAW_CANCELLED",
  "UNFULFILLABLE_CANCELLED",
  "OPS_CANCELLED",
  "OPS_FAILED",
];

const APP_STATUS_CHIPS: { label: string; statuses: SampleApplicationStatus[] }[] = [
  { label: "Pendentes", statuses: ["PENDING"] },
  { label: "Aguardando envio", statuses: ["AWAITING_SHIPMENT"] },
  { label: "Enviadas", statuses: ["SHIPPED"] },
  { label: "Aguardando conteúdo", statuses: ["CONTENT_PENDING"] },
  { label: "Concluídas", statuses: ["COMPLETED", "OPS_COMPLETED"] },
  { label: "Canceladas/falhas", statuses: CANCEL_APPLICATION_STATUSES },
];

function ApplicationsTab() {
  const [activeChips, setActiveChips] = useState<Set<number>>(new Set());
  const [pageToken, setPageToken] = useState<string | undefined>();
  const [detailParams, setDetailParams] = useState<SampleApplicationDetailParams | undefined>();

  const statuses = useMemo<SampleApplicationStatus[] | undefined>(() => {
    if (activeChips.size === 0) return undefined;
    const set = new Set<SampleApplicationStatus>();
    activeChips.forEach((i) => APP_STATUS_CHIPS[i].statuses.forEach((s) => set.add(s)));
    return Array.from(set);
  }, [activeChips]);

  // troca de filtro reinicia a paginação
  useEffect(() => {
    setPageToken(undefined);
  }, [statuses]);

  const filters: SampleApplicationsFilters = useMemo(
    () => ({ statuses, pageToken, pageSize: 20 }),
    [statuses, pageToken]
  );
  const { data, isLoading, error } = useSampleApplications(filters);
  const rows = data?.sample_applications ?? [];

  const kpis = useMemo(() => {
    let active = 0;
    let done = 0;
    let cancelled = 0;
    for (const r of rows) {
      const s = r.status?.toUpperCase();
      if (s === "COMPLETED" || s === "OPS_COMPLETED") done++;
      else if (s?.endsWith("CANCELLED") || s === "OPS_FAILED" || s === "DEL_OPEN_COLLAB" || s === "CANCELED") cancelled++;
      else active++;
    }
    return { total: rows.length, active, done, cancelled };
  }, [rows]);

  const toggleChip = (i: number) =>
    setActiveChips((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });

  const handleDetails = (row: SampleApplication) =>
    setDetailParams({
      productId: row.sample_product?.id,
      applicationId: row.id,
      mainOrderId: row.main_order_id,
      applicationType: "FREE_SAMPLE", // a lista não devolve `type` — ver ressalva no hook
    });

  return (
    <div className="space-y-6">
      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Nesta página" value={formatNumber(kpis.total)} icon={Package} accent="primary" loading={isLoading} />
        <StatCard label="Em andamento" value={formatNumber(kpis.active)} icon={Clock} accent="info" loading={isLoading} />
        <StatCard label="Concluídas" value={formatNumber(kpis.done)} icon={CheckCircle2} accent="success" loading={isLoading} />
        <StatCard label="Canceladas/falhas" value={formatNumber(kpis.cancelled)} icon={XCircle} accent="warning" loading={isLoading} />
      </section>

      {detailParams && (
        <SampleDetailPanel params={detailParams} onClose={() => setDetailParams(undefined)} />
      )}

      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle className="text-base">Solicitações de amostra</CardTitle>
            <p className="mt-0.5 text-xs text-muted-foreground">Search Creator Sample Applications (202412)</p>
          </div>
          <div className="flex flex-wrap justify-end gap-2">
            {APP_STATUS_CHIPS.map((chip, i) => (
              <Button
                key={chip.label}
                size="sm"
                variant={activeChips.has(i) ? "default" : "outline"}
                onClick={() => toggleChip(i)}
              >
                {chip.label}
              </Button>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          {USE_MOCK && (
            <p className="mb-3 text-xs text-muted-foreground">
              No mock, os filtros de status não alteram os dados (o fixture é fixo).
            </p>
          )}

          {error ? (
            <ErrorBanner text={`Não foi possível carregar as solicitações: ${(error as Error).message}`} />
          ) : isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : rows.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-16 text-center text-muted-foreground">
              <Gift className="h-8 w-8" />
              <p className="text-sm">Nenhuma solicitação de amostra encontrada.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="pb-2 pr-4 font-medium">Produto / SKU</th>
                    <th className="pb-2 pr-4 font-medium">Pedido principal</th>
                    <th className="pb-2 pr-4 font-medium">Status</th>
                    <th className="pb-2 pr-4 font-medium">Fulfillment</th>
                    <th className="pb-2 text-right font-medium">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {rows.map((r, i) => {
                    const props = skuPropsToText(r.sample_product?.sku_sale_property_value_names);
                    const fulfillment = r.creator_fulfillment;
                    return (
                      <tr key={r.id ?? i} className="align-top">
                        <td className="py-3 pr-4">
                          <p className="whitespace-nowrap font-medium">Produto {r.sample_product?.id ?? "—"}</p>
                          <p className="whitespace-nowrap text-xs text-muted-foreground">
                            SKU {r.sample_product?.sku_id ?? "—"}
                            {props && ` · ${props}`}
                          </p>
                        </td>
                        <td className="whitespace-nowrap py-3 pr-4 text-muted-foreground">
                          {r.main_order_id || "—"}
                        </td>
                        <td className="py-3 pr-4">
                          <Badge variant={applicationStatusVariant(r.status)} className="whitespace-nowrap">
                            {APPLICATION_STATUS_LABELS[r.status?.toUpperCase() ?? ""] ?? r.status ?? "—"}
                          </Badge>
                        </td>
                        <td className="py-3 pr-4">
                          {fulfillment ? (
                            <>
                              <Badge variant={fulfillmentStatusVariant(fulfillment.status)} className="whitespace-nowrap">
                                {FULFILLMENT_STATUS_LABELS[
                                  (fulfillment.status?.toUpperCase() ?? "") as SampleFulfillmentStatus
                                ] ??
                                  fulfillment.status ??
                                  "—"}
                              </Badge>
                              {fulfillment.expiration_time != null && (
                                <p className="mt-1 whitespace-nowrap text-xs text-muted-foreground">
                                  Prazo: {formatDate(fulfillment.expiration_time)}
                                </p>
                              )}
                            </>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="py-3 text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={!r.sample_product?.id}
                            onClick={() => handleDetails(r)}
                          >
                            Ver detalhes
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {!isLoading && !error && rows.length > 0 && (pageToken || data?.next_page_token) && (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t pt-4">
              <Button size="sm" variant="outline" disabled={!pageToken} onClick={() => setPageToken(undefined)}>
                Primeira página
              </Button>
              <div className="flex items-center gap-3">
                {USE_MOCK && (
                  <span className="text-xs text-muted-foreground">O mock sempre retorna a mesma página de exemplo</span>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  disabled={!data?.next_page_token}
                  onClick={() => setPageToken(data?.next_page_token)}
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

/** Painel de detalhe compartilhado pelas abas Solicitações e Envios — alimentado por
 *  Get Creator Sample Application Detail (202412). */
function SampleDetailPanel({
  params,
  onClose,
}: {
  params: SampleApplicationDetailParams;
  onClose: () => void;
}) {
  const { data, isLoading, error } = useSampleApplicationDetail(params);
  const app = data?.sample_application;

  return (
    <Card className="animate-fade-in border-primary/30">
      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
        <div>
          <CardTitle className="text-base">Detalhe da solicitação</CardTitle>
          <p className="mt-0.5 text-xs text-muted-foreground">Get Creator Sample Application Detail (202412)</p>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={onClose} aria-label="Fechar detalhes">
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        {error ? (
          <ErrorBanner text={`Não foi possível carregar o detalhe: ${(error as Error).message}`} />
        ) : isLoading || !app ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ) : (
          <div className="space-y-4 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={applicationStatusVariant(app.status)}>
                {APPLICATION_STATUS_LABELS[app.status?.toUpperCase() ?? ""] ?? app.status ?? "—"}
              </Badge>
              {app.type && <Badge variant="outline">{SAMPLE_TYPE_LABELS[app.type] ?? app.type}</Badge>}
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <DetailStat label="ID da solicitação" value={app.id ?? "—"} />
              <DetailStat label="Criada em" value={app.create_time != null ? formatDate(app.create_time) : "—"} />
              <DetailStat label="Produto" value={app.sample_product?.id ?? "—"} />
              <DetailStat label="SKU" value={app.sample_product?.sku_id ?? "—"} />
              <DetailStat
                label="Propriedades"
                value={skuPropsToText(app.sample_product?.sku_sale_property_value_names) || "—"}
              />
              <DetailStat label="Pedido principal" value={app.main_order_id || "—"} />
              {app.activity_id && <DetailStat label="Campanha/atividade" value={app.activity_id} />}
            </div>
            {app.creator_fulfillment && (
              <div className="rounded-lg border bg-muted/30 p-3">
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Fulfillment</p>
                <div className="flex flex-wrap items-center gap-3">
                  <Badge variant={fulfillmentStatusVariant(app.creator_fulfillment.status)}>
                    {FULFILLMENT_STATUS_LABELS[
                      (app.creator_fulfillment.status?.toUpperCase() ?? "") as SampleFulfillmentStatus
                    ] ??
                      app.creator_fulfillment.status ??
                      "—"}
                  </Badge>
                  {app.creator_fulfillment.expiration_time != null && (
                    <span className="text-xs text-muted-foreground">
                      Prazo: {formatDate(app.creator_fulfillment.expiration_time)}
                    </span>
                  )}
                  {!!app.creator_fulfillment.total_suspend_duration && (
                    <span className="text-xs text-muted-foreground">
                      Suspenso por {formatDuration(app.creator_fulfillment.total_suspend_duration)}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// =============== Aba 2: Envios (fulfillments) ===============

const ALL_FULFILLMENT_STATUSES: SampleFulfillmentStatus[] = [
  "PENDING",
  "ONGOING",
  "SUCCEED",
  "FAILED",
  "OVERDUE",
  "SUSPEND",
  "CANCELLED",
  "EXEMPTED",
];

function FulfillmentsTab() {
  const [selected, setSelected] = useState<Set<SampleFulfillmentStatus>>(new Set(ALL_FULFILLMENT_STATUSES));
  const [sortField, setSortField] = useState<"expired_time" | "create_time">("expired_time");
  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">("ASC");
  const [detailParams, setDetailParams] = useState<SampleApplicationDetailParams | undefined>();

  const filters: SampleFulfillmentsFilters = useMemo(
    () => ({
      statuses: selected.size > 0 ? Array.from(selected) : ALL_FULFILLMENT_STATUSES,
      sortField,
      sortOrder,
    }),
    [selected, sortField, sortOrder]
  );
  const { data, isLoading, error } = useSampleApplicationFulfillments(filters);
  const rows = data?.fulfillments ?? [];

  const kpis = useMemo(() => {
    let pending = 0;
    let done = 0;
    let issues = 0;
    for (const r of rows) {
      const s = r.status?.toUpperCase();
      if (s === "SUCCEED" || s === "EXEMPTED") done++;
      else if (s === "FAILED" || s === "OVERDUE" || s === "CANCELLED") issues++;
      else pending++;
    }
    return { total: rows.length, pending, done, issues };
  }, [rows]);

  const toggleStatus = (s: SampleFulfillmentStatus) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(s)) next.delete(s);
      else next.add(s);
      return next;
    });

  const handleDetails = (row: SampleFulfillment) =>
    setDetailParams({
      productId: row.product_id,
      applicationId: row.application_id,
      applicationType: toDetailApplicationType(row.sample_application_type),
    });

  return (
    <div className="space-y-6">
      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Envios encontrados" value={formatNumber(kpis.total)} icon={Package} accent="primary" loading={isLoading} />
        <StatCard label="Em andamento" value={formatNumber(kpis.pending)} icon={Clock} accent="info" loading={isLoading} />
        <StatCard label="Concluídos" value={formatNumber(kpis.done)} icon={CheckCircle2} accent="success" loading={isLoading} />
        <StatCard label="Com problema" value={formatNumber(kpis.issues)} icon={XCircle} accent="warning" loading={isLoading} />
      </section>

      <Card>
        <CardContent className="space-y-3 p-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
              <Truck className="h-4 w-4" /> Status do fulfillment
            </span>
            {ALL_FULFILLMENT_STATUSES.map((s) => (
              <Button key={s} size="sm" variant={selected.has(s) ? "default" : "outline"} onClick={() => toggleStatus(s)}>
                {FULFILLMENT_STATUS_LABELS[s]}
              </Button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2 border-t pt-3">
            <span className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
              <ArrowUpDown className="h-4 w-4" /> Ordenar por
            </span>
            <Button size="sm" variant={sortField === "expired_time" ? "default" : "outline"} onClick={() => setSortField("expired_time")}>
              Prazo
            </Button>
            <Button size="sm" variant={sortField === "create_time" ? "default" : "outline"} onClick={() => setSortField("create_time")}>
              Criação
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="ml-auto gap-1.5"
              onClick={() => setSortOrder((o) => (o === "ASC" ? "DESC" : "ASC"))}
            >
              {sortOrder === "ASC" ? (
                <ArrowUpNarrowWide className="h-3.5 w-3.5" />
              ) : (
                <ArrowDownWideNarrow className="h-3.5 w-3.5" />
              )}
              {sortOrder === "ASC" ? "Crescente" : "Decrescente"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {detailParams && (
        <SampleDetailPanel params={detailParams} onClose={() => setDetailParams(undefined)} />
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Envios de amostra</CardTitle>
          <p className="mt-0.5 text-xs text-muted-foreground">Creator Search Sample Application Fulfillments (202409)</p>
        </CardHeader>
        <CardContent>
          {error ? (
            <ErrorBanner text={`Não foi possível carregar os envios: ${(error as Error).message}`} />
          ) : isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : rows.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-16 text-center text-muted-foreground">
              <Truck className="h-8 w-8" />
              <p className="text-sm">Nenhum envio encontrado para os status selecionados.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="pb-2 pr-4 font-medium">Produto</th>
                    <th className="pb-2 pr-4 font-medium">Loja</th>
                    <th className="pb-2 pr-4 font-medium">Tipo</th>
                    <th className="pb-2 pr-4 font-medium">Status</th>
                    <th className="pb-2 pr-4 font-medium">Produto (marketing)</th>
                    <th className="pb-2 pr-4 font-medium">Prazo / suspensão</th>
                    <th className="pb-2 text-right font-medium">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {rows.map((r, i) => (
                    <tr key={r.id ?? i} className="align-top">
                      <td className="whitespace-nowrap py-3 pr-4 font-medium">{r.product_id ?? "—"}</td>
                      <td className="whitespace-nowrap py-3 pr-4 text-muted-foreground">{r.shop_id ?? "—"}</td>
                      <td className="py-3 pr-4">
                        <Badge variant="outline" className="whitespace-nowrap font-normal">
                          {(r.sample_application_type && SAMPLE_TYPE_LABELS[r.sample_application_type]) ||
                            r.sample_application_type ||
                            "—"}
                        </Badge>
                      </td>
                      <td className="py-3 pr-4">
                        <Badge variant={fulfillmentStatusVariant(r.status)} className="whitespace-nowrap">
                          {FULFILLMENT_STATUS_LABELS[(r.status?.toUpperCase() ?? "") as SampleFulfillmentStatus] ??
                            r.status ??
                            "—"}
                        </Badge>
                      </td>
                      <td className="py-3 pr-4 text-muted-foreground">
                        {(r.bound_product_status && BOUND_PRODUCT_STATUS_LABELS[r.bound_product_status]) ||
                          r.bound_product_status ||
                          "—"}
                      </td>
                      <td className="whitespace-nowrap py-3 pr-4">
                        <p>{r.expiration_time != null ? formatDate(r.expiration_time) : "—"}</p>
                        {!!r.total_suspend_duration && (
                          <p className="text-xs text-muted-foreground">
                            Suspenso {formatDuration(r.total_suspend_duration)}
                          </p>
                        )}
                      </td>
                      <td className="py-3 text-right">
                        <Button size="sm" variant="outline" disabled={!r.product_id} onClick={() => handleDetails(r)}>
                          Ver detalhes
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// =============== Aba 3: Elegibilidade (checagem por produto) ===============

function EligibilityTab() {
  const [productId, setProductId] = useState(USE_MOCK ? "1729432087292775344" : "");
  const [applied, setApplied] = useState(productId);

  const { data, isLoading, error } = useApplicableSampleLabel(applied);
  const label = data?.label;
  const skus: SampleSku[] = label?.sample_product?.sample_sku_list ?? [];

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!productId.trim()) return;
    setApplied(productId.trim());
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="space-y-2 p-4">
          <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1 space-y-1">
              <Label htmlFor="sampleProductId" className="text-xs text-muted-foreground">
                ID do produto
              </Label>
              <Input
                id="sampleProductId"
                placeholder="1729432087292775344"
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
              />
            </div>
            <Button type="submit" className="gap-2" disabled={!productId.trim()}>
              <Search className="h-4 w-4" /> Verificar elegibilidade
            </Button>
          </form>
          <p className="text-[11px] text-muted-foreground">
            Consulta feita produto a produto (Get Creator Applicable Sample Label) — não existe endpoint de creator
            para listar de uma vez todos os produtos elegíveis a amostra grátis.
          </p>
        </CardContent>
      </Card>

      {!applied ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-16 text-center text-muted-foreground">
            <ShieldCheck className="h-8 w-8" />
            <p className="text-sm">Informe o ID de um produto para verificar se você pode solicitar amostra grátis.</p>
          </CardContent>
        </Card>
      ) : error ? (
        <ErrorBanner text={`Não foi possível verificar a elegibilidade: ${(error as Error).message}`} />
      ) : isLoading || !label ? (
        <Card>
          <CardContent className="space-y-3 p-5">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
      ) : (
        <Card className="animate-fade-in">
          <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2 space-y-0">
            <CardTitle className="text-base">Elegibilidade — produto {applied}</CardTitle>
            <div className="flex flex-wrap gap-2">
              <Badge variant={label.can_apply ? "success" : "destructive"}>
                {label.can_apply ? "Pode solicitar" : "Não pode solicitar"}
              </Badge>
              <Badge variant={labelStatusVariant(label.status)}>
                {LABEL_STATUS_LABELS[label.status ?? ""] ?? label.status ?? "—"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {label.application_id && (
              <p className="text-xs text-muted-foreground">Nº da solicitação existente: {label.application_id}</p>
            )}
            {label.reach_limit && (
              <div className="flex items-start gap-2 rounded-lg border border-warning/30 bg-warning/10 p-3 text-sm">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
                <span>Você atingiu o limite de solicitações de amostra para este produto.</span>
              </div>
            )}
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">SKUs disponíveis</p>
              {skus.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhum SKU retornado para este produto.</p>
              ) : (
                <div className="space-y-2">
                  {skus.map((sku, i) => {
                    const available = sku.is_available !== false;
                    return (
                      <div
                        key={sku.id ?? i}
                        className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-muted/30 p-3"
                      >
                        <div className="min-w-0">
                          <p className="break-all text-sm font-medium">SKU {sku.id ?? "—"}</p>
                          {!!sku.sale_properties?.length && (
                            <p className="truncate text-xs text-muted-foreground">
                              {sku.sale_properties.map((p) => `${p.name}: ${p.value_name}`).join(" · ")}
                            </p>
                          )}
                          {!available && sku.unavailable_reason && (
                            <p className="text-xs text-destructive">
                              {UNAVAILABLE_REASON_LABELS[sku.unavailable_reason] ?? sku.unavailable_reason}
                            </p>
                          )}
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          <span className="text-sm font-semibold">{formatMoney(sku.price)}</span>
                          <Badge variant={available ? "success" : "secondary"}>
                            {available ? "Disponível" : "Indisponível"}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// =============== Compartilhados ===============

function DetailStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="break-all text-sm font-semibold">{value}</p>
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
