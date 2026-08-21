import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  Compass,
  Handshake,
  Search,
  ArrowUpDown,
  ArrowDownWideNarrow,
  ArrowUpNarrowWide,
  Percent,
  TrendingUp,
  Store,
  Package,
  ChevronRight,
  AlertCircle,
  X,
  ExternalLink,
  Inbox,
} from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useOpenCollaborationProducts,
  useOpenCollaborationByIds,
  useTargetCollaborations,
  type OpenCollaborationFilters,
  type OpenCollaborationSortField,
  type SortOrder,
  type TargetCollaborationsFilters,
  useSelectionProducts,
  type SelectionSortType,
} from "@/hooks/useDescoberta";
import { USE_MOCK } from "@/services/creatorClient";
import { formatCurrency, formatMoney, formatNumber, formatPercent, abbreviateNumber, parseAmount } from "@/lib/formatters";
import type {
  CreatorSearchOpenCollaborationProductData,
  GetOpenCollaborationProductListByProductIdsData,
  SearchCreatorTargetCollaborationsData,
  CreatorSelectAffiliateProductData,
} from "@/types/creator-api.generated";

type OpenProduct = NonNullable<CreatorSearchOpenCollaborationProductData["products"]>[number];
type DetailProduct = NonNullable<GetOpenCollaborationProductListByProductIdsData["products"]>[number];
type TargetCollaboration = NonNullable<SearchCreatorTargetCollaborationsData["target_collaborations"]>[number];
type PriceRange = { minimum_amount?: string; maximum_amount?: string; currency?: string };

const SORT_OPTIONS: { value: OpenCollaborationSortField; label: string }[] = [
  { value: "commission_rate", label: "Comissão %" },
  { value: "commission", label: "Comissão R$" },
  { value: "product_sales_price", label: "Preço" },
  { value: "units_sold", label: "Vendas" },
];

const TARGET_STATUS_LABELS: Record<string, string> = {
  LIVE: "Ativa",
  EXPIRED: "Expirada",
  DELETED: "Excluída",
  ENDED: "Encerrada",
};

function targetStatusVariant(status?: string): "success" | "destructive" | "secondary" {
  if (status === "LIVE") return "success";
  if (status === "DELETED" || status === "EXPIRED") return "destructive";
  return "secondary"; // ENDED ou desconhecido
}

/** Mesmo padrão do fmtRange da VitrinePage — faixa {minimum_amount, maximum_amount, currency}. */
function fmtRange(p?: PriceRange): string {
  if (!p?.minimum_amount) return "—";
  const cur = p.currency || "BRL";
  const min = formatCurrency(parseFloat(p.minimum_amount), cur);
  if (!p.maximum_amount || p.maximum_amount === p.minimum_amount) return min;
  return `${min} – ${formatCurrency(parseFloat(p.maximum_amount), cur)}`;
}

/** commission.rate vem em centésimos de % (3587 = 35,87%) — divide por 10000 pro formatPercent (fração). */
function commissionPercent(rate?: number): string {
  if (rate == null) return "—";
  return formatPercent(rate / 10000, 2);
}

type Tab = "catalogo" | "open" | "target";

export default function DescobertaPage() {
  const [tab, setTab] = useState<Tab>("catalogo");

  return (
    <div className="space-y-gap">
      <PageHeader title="Descoberta & Colaborações" subtitle="Encontre produtos para promover no marketplace de colaboração aberta e veja os convites que você recebeu." />

        <div className="segmented w-fit" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={tab === "catalogo"}
            onClick={() => setTab("catalogo")}
            className="segmented-item flex items-center gap-2"
          >
            <Compass className="h-4 w-4" /> Produtos para promover
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === "open"}
            onClick={() => setTab("open")}
            className="segmented-item flex items-center gap-2"
          >
            <Compass className="h-4 w-4" /> Colaborações abertas
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === "target"}
            onClick={() => setTab("target")}
            className="segmented-item flex items-center gap-2"
          >
            <Handshake className="h-4 w-4" /> Convites (target)
          </button>
        </div>

      {tab === "catalogo" ? (
        <SelectionTab />
      ) : tab === "open" ? (
        <OpenCollaborationsTab />
      ) : (
        <TargetCollaborationsTab />
      )}
    </div>
  );
}

// =============== Aba 1: Catálogo de produtos (funciona no BR) ===============

const SELECTION_SORTS: { value: SelectionSortType; label: string }[] = [
  { value: "RECOMMENDED", label: "Recomendados" },
  { value: "BEST_SELLERS", label: "Mais vendidos" },
  { value: "HIGH_COMMISSION_RATE", label: "Maior comissão" },
  { value: "LOW_PRICE", label: "Menor preço" },
  { value: "HIGH_PRICE", label: "Maior preço" },
  { value: "NEWLY_RELEASED", label: "Novidades" },
];

function SelectionTab() {
  const [termo, setTermo] = useState("");
  const [busca, setBusca] = useState("");
  const [sortType, setSortType] = useState<SelectionSortType>("RECOMMENDED");
  const [pageToken, setPageToken] = useState<string | undefined>();

  const filtros = useMemo(
    () => ({ titleKeyword: busca || undefined, sortType, pageToken, pageSize: 20 }),
    [busca, sortType, pageToken]
  );
  const { data, isLoading, error } = useSelectionProducts(filtros);
  const produtos = data?.products ?? [];

  const aplicar = (e: FormEvent) => {
    e.preventDefault();
    setBusca(termo.trim());
    setPageToken(undefined);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="space-y-3 p-4">
          <form onSubmit={aplicar} className="flex flex-col gap-2 sm:flex-row">
            <Input
              value={termo}
              onChange={(e) => setTermo(e.target.value)}
              placeholder="Buscar produto pelo nome..."
              className="flex-1"
            />
            <Button type="submit" className="gap-2">
              <Search className="h-4 w-4" /> Buscar
            </Button>
          </form>
          <div className="flex flex-wrap gap-2">
            {SELECTION_SORTS.map((o) => (
              <Button
                key={o.value}
                size="sm"
                variant={sortType === o.value ? "toggle-on" : "toggle"}
                onClick={() => {
                  setSortType(o.value);
                  setPageToken(undefined);
                }}
              >
                {o.label}
              </Button>
            ))}
          </div>
          {/* A API só calcula `total_count` quando há filtro; sem busca vem 0 e
              exibir "0 produtos" contradiz a grade cheia logo abaixo. */}
          {busca && !!data?.total_count && (
            <p className="text-xs text-muted-foreground">
              {formatNumber(data.total_count)} produtos encontrados para "{busca}".
            </p>
          )}
        </CardContent>
      </Card>

      {error ? (
        <ErrorBanner text={(error as Error).message} />
      ) : isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-72 w-full rounded-xl" />
          ))}
        </div>
      ) : produtos.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-sm text-muted-foreground">
            Nenhum produto encontrado{busca ? ` para "${busca}"` : ""}.
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {produtos.map((p, i) => (
              <SelectionCard key={p.id ?? i} product={p} />
            ))}
          </div>
          {(pageToken || data?.next_page_token) && (
            <Card>
              <CardContent className="flex items-center justify-between gap-2 p-4">
                <Button size="sm" variant="outline" disabled={!pageToken} onClick={() => setPageToken(undefined)}>
                  Primeira página
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={!data?.next_page_token}
                  onClick={() => setPageToken(data?.next_page_token)}
                  className="gap-1"
                >
                  Próxima página <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}

type SelectionProduct = NonNullable<CreatorSelectAffiliateProductData["products"]>[number];

function SelectionCard({ product }: { product: SelectionProduct }) {
  const cur = product.price?.currency || "BRL";
  const faixa = product.price?.floor_price
    ? product.price.ceiling_price && product.price.ceiling_price !== product.price.floor_price
      ? `${formatCurrency(parseAmount(product.price.floor_price), cur)} – ${formatCurrency(parseAmount(product.price.ceiling_price), cur)}`
      : formatCurrency(parseAmount(product.price.floor_price), cur)
    : "—";

  return (
    <Card className="animate-fade-in overflow-hidden">
      <div className="relative flex h-40 items-center justify-center bg-muted">
        <ProductImage src={product.main_image_url} alt={product.title} />
        {product.commission?.amount && (
          <Badge variant="success" className="absolute right-2 top-2">
            {formatCurrency(parseAmount(product.commission.amount), cur)} por venda
          </Badge>
        )}
      </div>
      <CardContent className="space-y-3 p-4">
        <p className="line-clamp-2 min-h-[2.5rem] text-sm font-medium">{product.title ?? `Produto ${product.id}`}</p>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Store className="h-3.5 w-3.5" />
          <span className="truncate">{product.shop?.name ?? "—"}</span>
          {product.shop?.rating && <span className="shrink-0">· {product.shop.rating}★</span>}
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="font-semibold">{faixa}</span>
          {product.commission?.rate != null && (
            <Badge variant="outline" className="shrink-0 gap-1">
              <Percent className="h-3 w-3" /> {commissionPercent(product.commission.rate)}
            </Badge>
          )}
        </div>
        {product.market_performance?.historical_sold_quantity != null && (
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <TrendingUp className="h-3.5 w-3.5" />
            {abbreviateNumber(product.market_performance.historical_sold_quantity)} vendidos
          </p>
        )}
      </CardContent>
    </Card>
  );
}

// =============== Aba 2: Colaborações abertas (marketplace) ===============

interface OpenForm {
  keyword: string;
  categoryId: string;
  priceGe: string;
  priceLt: string;
  commissionGe: string;
  commissionLt: string;
}

const EMPTY_OPEN_FORM: OpenForm = {
  keyword: "",
  categoryId: "",
  priceGe: "",
  priceLt: "",
  commissionGe: "",
  commissionLt: "",
};

function OpenCollaborationsTab() {
  const [form, setForm] = useState<OpenForm>(EMPTY_OPEN_FORM);
  const [applied, setApplied] = useState<OpenForm>(EMPTY_OPEN_FORM);
  const [sortField, setSortField] = useState<OpenCollaborationSortField>("commission_rate");
  const [sortOrder, setSortOrder] = useState<SortOrder>("DESC");
  const [pageToken, setPageToken] = useState<string | undefined>();
  const [detailsId, setDetailsId] = useState<string | undefined>();

  // troca de filtro/ordenação reinicia a paginação
  useEffect(() => {
    setPageToken(undefined);
  }, [applied, sortField, sortOrder]);

  const filters: OpenCollaborationFilters = useMemo(
    () => ({
      titleKeywords: applied.keyword
        ? applied.keyword
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : undefined,
      categoryId: applied.categoryId || undefined,
      priceGe: applied.priceGe || undefined,
      priceLt: applied.priceLt || undefined,
      commissionRateGe: applied.commissionGe ? Math.round(parseFloat(applied.commissionGe) * 100) : undefined,
      commissionRateLt: applied.commissionLt ? Math.round(parseFloat(applied.commissionLt) * 100) : undefined,
      sortField,
      sortOrder,
      pageToken,
      pageSize: 20,
    }),
    [applied, sortField, sortOrder, pageToken]
  );

  const { data, isLoading, error, isPending, isError, fetchStatus } = useOpenCollaborationProducts(filters);
  // Sem resposta (pendente/pausado) não é "nenhum resultado" — e um erro da API
  // (região bloqueada, escopo) tem que aparecer, não virar lista vazia.
  const semResposta = isPending && !isError;
  const offline = fetchStatus === "paused";
  const products = data?.products ?? [];

  const {
    data: detailsData,
    isLoading: detailsLoading,
    error: detailsError,
  } = useOpenCollaborationByIds(detailsId ? [detailsId] : []);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setApplied(form);
  };
  const handleClear = () => {
    setForm(EMPTY_OPEN_FORM);
    setApplied(EMPTY_OPEN_FORM);
  };

  return (
    <div className="space-y-6">
      {/* Filtros de busca */}
      <Card>
        <CardContent className="space-y-4 p-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar por palavra-chave… (separe várias por vírgula)"
                  value={form.keyword}
                  onChange={(e) => setForm((f) => ({ ...f, keyword: e.target.value }))}
                  className="pl-9"
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="gap-2">
                  <Search className="h-4 w-4" /> Buscar
                </Button>
                <Button type="button" variant="outline" onClick={handleClear}>
                  Limpar
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
              <div className="space-y-1">
                <Label htmlFor="categoryId" className="text-xs text-muted-foreground">
                  Categoria (ID)
                </Label>
                <Input
                  id="categoryId"
                  placeholder="341234"
                  value={form.categoryId}
                  onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="priceGe" className="text-xs text-muted-foreground">
                  Preço mín.
                </Label>
                <Input
                  id="priceGe"
                  inputMode="decimal"
                  placeholder="0,00"
                  value={form.priceGe}
                  onChange={(e) => setForm((f) => ({ ...f, priceGe: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="priceLt" className="text-xs text-muted-foreground">
                  Preço máx.
                </Label>
                <Input
                  id="priceLt"
                  inputMode="decimal"
                  placeholder="100,00"
                  value={form.priceLt}
                  onChange={(e) => setForm((f) => ({ ...f, priceLt: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="commissionGe" className="text-xs text-muted-foreground">
                  Comissão mín. %
                </Label>
                <Input
                  id="commissionGe"
                  inputMode="decimal"
                  placeholder="ex.: 10"
                  value={form.commissionGe}
                  onChange={(e) => setForm((f) => ({ ...f, commissionGe: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="commissionLt" className="text-xs text-muted-foreground">
                  Comissão máx. %
                </Label>
                <Input
                  id="commissionLt"
                  inputMode="decimal"
                  placeholder="ex.: 80"
                  value={form.commissionLt}
                  onChange={(e) => setForm((f) => ({ ...f, commissionLt: e.target.value }))}
                />
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Faixa de comissão aceita pela API: 1%–80%. Preço e categoria são opcionais.
            </p>
          </form>

          <div className="flex flex-wrap items-center gap-3 border-t pt-4">
            <span className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
              <ArrowUpDown className="h-4 w-4" /> Ordenar por
            </span>
            <div className="flex flex-wrap gap-2">
              {SORT_OPTIONS.map((opt) => (
                <Button
                  key={opt.value}
                  size="sm"
                  variant={sortField === opt.value ? "toggle-on" : "toggle"}
                  onClick={() => setSortField(opt.value)}
                >
                  {opt.label}
                </Button>
              ))}
            </div>
            <Button
              size="sm"
              variant="outline"
              className="ml-auto gap-1.5"
              onClick={() => setSortOrder((o) => (o === "DESC" ? "ASC" : "DESC"))}
            >
              {sortOrder === "DESC" ? (
                <ArrowDownWideNarrow className="h-3.5 w-3.5" />
              ) : (
                <ArrowUpNarrowWide className="h-3.5 w-3.5" />
              )}
              {sortOrder === "DESC" ? "Maior primeiro" : "Menor primeiro"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {error && <ErrorBanner text={`Não foi possível buscar produtos: ${(error as Error).message}`} />}

      {detailsId && (
        <ProductDetailsCard
          product={detailsData?.products?.[0]}
          isLoading={detailsLoading}
          error={detailsError as Error | null}
          onClose={() => setDetailsId(undefined)}
        />
      )}

      {offline && (
        <ErrorBanner text="Sem conexão com o servidor — não foi possível consultar o marketplace." />
      )}

      {isLoading || semResposta ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-80 w-full rounded-xl" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-16 text-center text-muted-foreground">
            <Compass className="h-8 w-8" />
            <p className="text-sm">
              {error
                ? "A busca não pôde ser feita — veja o motivo acima."
                : "Nenhum produto encontrado com esses filtros."}
            </p>
            {!error && (
              <p className="max-w-md text-xs">
                Esta aba usa a busca de colaboração aberta, que a TikTok libera só nas
                regiões em que você está registrado no afiliado. Use "Produtos para
                promover" para o catálogo disponível no Brasil.
              </p>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          <p className="text-xs text-muted-foreground">
            {data?.total_count != null
              ? `${formatNumber(data.total_count)} produtos no total`
              : `${products.length} produtos`}
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p, i) => (
              <OpenProductCard key={p.id ?? i} product={p} onDetails={() => p.id && setDetailsId(p.id)} />
            ))}
          </div>
        </>
      )}

      {!isLoading && products.length > 0 && (pageToken || data?.next_page_token) && (
        <Card>
          <CardContent className="flex flex-wrap items-center justify-between gap-2 p-4">
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
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function OpenProductCard({ product, onDetails }: { product: OpenProduct; onDetails: () => void }) {
  const price = product.sales_price?.minimum_amount ? product.sales_price : product.original_price;
  const showOriginal =
    !!product.original_price?.minimum_amount &&
    !!product.sales_price?.minimum_amount &&
    product.original_price.minimum_amount !== product.sales_price.minimum_amount;

  return (
    <Card className="animate-fade-in overflow-hidden">
      <div className="relative flex h-40 items-center justify-center bg-muted">
        <ProductImage src={product.main_image_url} alt={product.title} />
        <Badge variant={product.has_inventory ? "success" : "secondary"} className="absolute right-2 top-2">
          {product.has_inventory ? "Em estoque" : "Sem estoque"}
        </Badge>
      </div>
      <CardContent className="space-y-3 p-4">
        <p className="line-clamp-2 min-h-[2.5rem] text-sm font-medium">{product.title ?? `Produto ${product.id}`}</p>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Store className="h-3.5 w-3.5" />
          <span className="truncate">{product.shop?.name ?? "—"}</span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            {showOriginal && (
              <p className="truncate text-xs text-muted-foreground line-through">{fmtRange(product.original_price)}</p>
            )}
            <span className="font-semibold">{fmtRange(price)}</span>
          </div>
          {product.commission?.rate != null && (
            <Badge variant="outline" className="shrink-0 gap-1">
              <Percent className="h-3 w-3" /> {commissionPercent(product.commission.rate)}
            </Badge>
          )}
        </div>
        {product.units_sold != null && (
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <TrendingUp className="h-3.5 w-3.5" /> {abbreviateNumber(product.units_sold)} vendidos
          </p>
        )}
        <Button variant="outline" size="sm" className="w-full gap-1.5" onClick={onDetails} disabled={!product.id}>
          Ver detalhes
        </Button>
      </CardContent>
    </Card>
  );
}

/** Painel de detalhes — alimentado por useOpenCollaborationByIds (202509). Só mostra o
 *  que esse endpoint acrescenta de fato: shop_ads_commission, categoria completa e link. */
function ProductDetailsCard({
  product,
  isLoading,
  error,
  onClose,
}: {
  product?: DetailProduct;
  isLoading: boolean;
  error: Error | null;
  onClose: () => void;
}) {
  return (
    <Card className="animate-fade-in border-primary/30">
      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
        <div>
          <CardTitle className="text-base">Detalhes do produto</CardTitle>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Get Open Collaboration Product List By Product Ids (202509)
          </p>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={onClose} aria-label="Fechar detalhes">
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        {error ? (
          <ErrorBanner text={`Não foi possível carregar os detalhes: ${error.message}`} />
        ) : isLoading || !product ? (
          <div className="flex flex-col gap-4 sm:flex-row">
            <Skeleton className="h-28 w-28 shrink-0 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted">
              <ProductImage src={product.main_image_url} alt={product.title} />
            </div>
            <div className="min-w-0 flex-1 space-y-2 text-sm">
              <p className="font-medium">{product.title ?? `Produto ${product.id}`}</p>
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Store className="h-3.5 w-3.5" /> {product.shop?.name ?? "—"}
                </span>
                {product.sale_region && (
                  <Badge variant="outline" className="font-normal">
                    {product.sale_region}
                  </Badge>
                )}
                <Badge variant={product.has_inventory ? "success" : "secondary"}>
                  {product.has_inventory ? "Em estoque" : "Sem estoque"}
                </Badge>
              </div>
              {!!product.category_chains?.length && (
                <p className="text-xs text-muted-foreground">
                  Categoria: {product.category_chains.map((c) => c.local_name).filter(Boolean).join(" › ")}
                </p>
              )}
              <div className="grid grid-cols-2 gap-3 pt-1 sm:grid-cols-3">
                <DetailStat label="Preço" value={fmtRange(product.sales_price ?? product.original_price)} />
                <DetailStat label="Comissão" value={commissionPercent(product.commission?.rate)} />
                <DetailStat label="Valor da comissão" value={formatMoney(product.commission)} />
                {product.shop_ads_commission?.rate != null && (
                  <DetailStat label="Comissão de anúncios" value={commissionPercent(product.shop_ads_commission.rate)} />
                )}
                {product.units_sold != null && <DetailStat label="Vendidos" value={formatNumber(product.units_sold)} />}
              </div>
              {product.detail_link && (
                <a
                  href={product.detail_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                >
                  Abrir no TikTok Shop <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function DetailStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-semibold">{value}</p>
    </div>
  );
}

// =============== Aba 2: Convites de colaboração (target) ===============

interface TargetForm {
  shopId: string;
  keyword: string;
  keywordType: "TARGET_COLLABORATIONS_ID" | "TARGET_COLLABORATIONS_NAME";
}

function TargetCollaborationsTab() {
  // não existe endpoint de creator pra listar "minhas lojas" — no mock pré-preenchemos
  // com o shop_id de exemplo da doc pra já mostrar dado; em live o usuário precisa digitar.
  const [form, setForm] = useState<TargetForm>({
    shopId: USE_MOCK ? "789078671231" : "",
    keyword: "",
    keywordType: "TARGET_COLLABORATIONS_NAME",
  });
  const [applied, setApplied] = useState<TargetForm>(form);
  const [pageToken, setPageToken] = useState<string | undefined>();

  useEffect(() => {
    setPageToken(undefined);
  }, [applied]);

  const filters: TargetCollaborationsFilters = useMemo(
    () => ({
      shopId: applied.shopId.trim(),
      keyword: applied.keyword.trim() || undefined,
      keywordType: applied.keywordType,
      pageToken,
      pageSize: 20,
    }),
    [applied, pageToken]
  );

  const { data, isLoading, error, isPending, isError, fetchStatus } = useTargetCollaborations(filters);
  const semResposta = !!filters.shopId && isPending && !isError;
  const offline = fetchStatus === "paused";
  const collaborations = data?.target_collaborations ?? [];

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!form.shopId.trim()) return;
    setApplied(form);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="space-y-2 p-4">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_1fr_auto_auto] lg:items-end">
            <div className="space-y-1">
              <Label htmlFor="shopId" className="text-xs text-muted-foreground">
                ID da loja (shop_id) *
              </Label>
              <Input
                id="shopId"
                placeholder="789078671231"
                value={form.shopId}
                onChange={(e) => setForm((f) => ({ ...f, shopId: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="targetKeyword" className="text-xs text-muted-foreground">
                Buscar por {form.keywordType === "TARGET_COLLABORATIONS_ID" ? "ID" : "nome"} (opcional)
              </Label>
              <Input
                id="targetKeyword"
                placeholder="Opcional"
                value={form.keyword}
                onChange={(e) => setForm((f) => ({ ...f, keyword: e.target.value }))}
              />
            </div>
            <div className="flex gap-1">
              <Button
                type="button"
                size="sm"
                variant={form.keywordType === "TARGET_COLLABORATIONS_NAME" ? "toggle-on" : "toggle"}
                onClick={() => setForm((f) => ({ ...f, keywordType: "TARGET_COLLABORATIONS_NAME" }))}
              >
                Nome
              </Button>
              <Button
                type="button"
                size="sm"
                variant={form.keywordType === "TARGET_COLLABORATIONS_ID" ? "toggle-on" : "toggle"}
                onClick={() => setForm((f) => ({ ...f, keywordType: "TARGET_COLLABORATIONS_ID" }))}
              >
                ID
              </Button>
            </div>
            <Button type="submit" className="gap-2" disabled={!form.shopId.trim()}>
              <Search className="h-4 w-4" /> Buscar
            </Button>
          </form>
          <p className="text-[11px] text-muted-foreground">
            A API exige o ID da loja que te convidou, e não existe endpoint de creator que
            liste suas lojas: nenhuma resposta traz <code>shop_id</code> (só nome e logo).
            Você encontra esse número no convite recebido dentro do app do TikTok Shop ou
            pedindo ao próprio vendedor.
          </p>
        </CardContent>
      </Card>

      {offline && (
        <ErrorBanner text="Sem conexão com o servidor — não foi possível buscar os convites." />
      )}

      {!filters.shopId ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-16 text-center text-muted-foreground">
            <Handshake className="h-8 w-8" />
            <p className="text-sm">Informe o ID da loja para ver os convites de colaboração.</p>
          </CardContent>
        </Card>
      ) : error ? (
        <ErrorBanner text={`Não foi possível buscar as colaborações-alvo: ${(error as Error).message}`} />
      ) : isLoading || semResposta ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-xl" />
          ))}
        </div>
      ) : collaborations.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-16 text-center text-muted-foreground">
            <Inbox className="h-8 w-8" />
            <p className="text-sm">Nenhum convite de colaboração encontrado para essa loja.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <p className="text-xs text-muted-foreground">
            {data?.total_count != null
              ? `${formatNumber(data.total_count)} colaborações no total`
              : `${collaborations.length} colaborações`}
          </p>
          <div className="space-y-4">
            {collaborations.map((c, i) => (
              <TargetCollaborationCard key={c.id ?? i} collab={c} />
            ))}
          </div>
        </>
      )}

      {!isLoading && collaborations.length > 0 && (pageToken || data?.next_page_token) && (
        <Card>
          <CardContent className="flex flex-wrap items-center justify-between gap-2 p-4">
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
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function TargetCollaborationCard({ collab }: { collab: TargetCollaboration }) {
  const products = collab.products ?? [];
  return (
    <Card className="animate-fade-in">
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2 space-y-0">
        <div className="min-w-0">
          <CardTitle className="truncate text-base">{collab.name ?? `Colaboração ${collab.id}`}</CardTitle>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">ID: {collab.id ?? "—"}</p>
        </div>
        <Badge variant={targetStatusVariant(collab.status)}>
          {TARGET_STATUS_LABELS[collab.status ?? ""] ?? collab.status ?? "—"}
        </Badge>
      </CardHeader>
      <CardContent>
        {products.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum produto nessa colaboração.</p>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p, i) => (
              <div key={p.id ?? i} className="flex items-center gap-3 rounded-lg border bg-muted/30 p-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted">
                  <ProductImage src={p.main_image_url} alt={p.title} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{p.title ?? `Produto ${p.id}`}</p>
                  {p.commission?.rate != null && (
                    <p className="text-xs text-success">
                      {commissionPercent(p.commission.rate)} · {formatMoney(p.commission)}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// =============== Compartilhados ===============

function ProductImage({ src, alt }: { src?: string; alt?: string }) {
  const [err, setErr] = useState(false);
  if (!src || err) return <Package className="h-8 w-8 text-muted-foreground" />;
  return <img src={src} alt={alt ?? ""} onError={() => setErr(true)} className="h-full w-full object-cover" />;
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
