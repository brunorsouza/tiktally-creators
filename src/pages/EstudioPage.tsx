import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import {
  ShieldAlert,
  AlertCircle,
  AlertTriangle,
  Package,
  Music,
  Search,
  ArrowUpDown,
  ArrowUpNarrowWide,
  ArrowDownWideNarrow,
  ChevronRight,
  Copy,
  ExternalLink,
  X,
  UploadCloud,
  Film,
  ImagePlus,
  ShieldCheck,
  Rocket,
  PlayCircle,
  Tag,
  ShoppingBag,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  type LucideIcon, BadgeCheck } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useShopProducts,
  useMusicSearch,
  useUploadFileInit,
  useUploadShoppableVideoFile,
  useUploadShoppablePhotoFile,
  usePrecheckVideoContent,
  useShoppableVideoPrecheckResult,
  usePostShoppableVideo,
  usePostShoppablePhotos,
  useShoppableVideoStatus,
  type ShopProductsFilters,
  type ShopProductSortField,
  type MusicSearchFilters,
  type PhotoPostType,
  useCheckAnchorPrerequisites,
  useCheckAnchorContent,
} from "@/hooks/useEstudio";
import { USE_MOCK } from "@/services/creatorClient";
import { formatMoney, formatNumber, formatDate } from "@/lib/formatters";
import type { GetShopProductsData, SearchMusicData } from "@/types/creator-api.generated";

type ShopProduct = NonNullable<GetShopProductsData["products"]>[number];
type MusicTrack = NonNullable<SearchMusicData["music"]>[number];
type FieldInputMode = "text" | "numeric" | "decimal" | "search" | "email" | "tel" | "url" | "none";

const SCOPE_NAME = "creator.video.write";

// =============== Labels e helpers compartilhados ===============

/** Vocabulário SUCCESS/FAIL/PROCESSING é usado tanto pelo status do vídeo publicado quanto
 *  pelas duas checagens do resultado do precheck (violação e qualidade). */
const STATUS_LABELS: Record<string, string> = {
  SUCCESS: "Sucesso",
  FAIL: "Falhou",
  PROCESSING: "Processando",
};

function statusVariant(status?: string): "success" | "destructive" | "warning" | "secondary" {
  const s = status?.trim().toUpperCase();
  if (s === "SUCCESS") return "success";
  if (s === "FAIL") return "destructive";
  if (s === "PROCESSING") return "warning";
  return "secondary";
}

function StatusIcon({ status }: { status?: string }) {
  const s = status?.trim().toUpperCase();
  if (s === "SUCCESS") return <CheckCircle2 className="h-3.5 w-3.5" />;
  if (s === "FAIL") return <XCircle className="h-3.5 w-3.5" />;
  return <Clock className="h-3.5 w-3.5" />;
}

const ADDED_STATUS_LABELS: Record<string, string> = {
  ADDABLE: "Pode adicionar à vitrine",
  ADDED: "Já está na vitrine",
  REJECTED: "Rejeitado",
};

function addedStatusVariant(status?: string): "success" | "destructive" | "secondary" {
  const s = status?.trim().toUpperCase();
  if (s === "ADDED") return "success";
  if (s === "REJECTED") return "destructive";
  return "secondary"; // ADDABLE
}

/** `duration` de Search Music vem em segundos, como string ("235") — formata "3:55". */
function formatTrackDuration(seconds?: string): string {
  const n = seconds ? parseInt(seconds, 10) : NaN;
  if (!Number.isFinite(n) || n <= 0) return "—";
  const m = Math.floor(n / 60);
  const s = n % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

async function copyToClipboard(value: string, label: string) {
  try {
    await navigator.clipboard.writeText(value);
    toast.success(`${label} copiado`);
  } catch {
    toast.error("Não foi possível copiar — copie manualmente");
  }
}

/** Aceita valores separados por vírgula, ponto-e-vírgula ou quebra de linha. */
function parseLines(raw: string): string[] {
  return raw
    .split(/[\n,;]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

const textareaClass =
  "flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

type Tab = "discover" | "publish" | "status";

export default function EstudioPage() {
  const [tab, setTab] = useState<Tab>("discover");
  // IDs vindos da aba Publicar, só para pré-preencher as ferramentas de consulta da aba Status.
  const [lastTaskId, setLastTaskId] = useState<string | undefined>();
  const [lastVideoId, setLastVideoId] = useState<string | undefined>();

  return (
    <div className="space-y-gap">
      <PageHeader title="Estúdio de conteúdo" subtitle="Descubra produtos e músicas, monte o pipeline de upload/precheck e publique vídeos e fotos shoppable." />

      {!USE_MOCK && <GatingBanner />}

        <div className="segmented w-fit" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={tab === "discover"}
            onClick={() => setTab("discover")}
            className="segmented-item flex items-center gap-2"
          >
            <Package className="h-4 w-4" /> Produtos & Música
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === "publish"}
            onClick={() => setTab("publish")}
            className="segmented-item flex items-center gap-2"
          >
            <Rocket className="h-4 w-4" /> Publicar
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === "status"}
            onClick={() => setTab("status")}
            className="segmented-item flex items-center gap-2"
          >
            <PlayCircle className="h-4 w-4" /> Status
          </button>
        </div>

      {tab === "discover" ? (
        <DiscoverTab />
      ) : tab === "publish" ? (
        <PublishTab onTaskId={setLastTaskId} onVideoId={setLastVideoId} />
      ) : (
        <StatusTab initialTaskId={lastTaskId} initialVideoId={lastVideoId} />
      )}
    </div>
  );
}

function GatingBanner() {
  return (
    <Card className="border-warning/30 bg-warning/10">
      <CardContent className="flex items-start gap-3 p-4 text-sm">
        <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
        <div className="space-y-1">
          <p className="font-medium">Estúdio de conteúdo exige um escopo hoje inativo</p>
          <p className="text-muted-foreground">
            Os 10 endpoints desta área (produtos/música, upload, precheck e publicação) pedem o escopo{" "}
            <code className="rounded bg-background/60 px-1 py-0.5 text-xs">{SCOPE_NAME}</code> (pacote{" "}
            <strong>Content Posting</strong>), que hoje está <strong>inativo</strong> no app — é um escopo{" "}
            <strong>sensível</strong>, sujeito a revisão extra da TikTok antes de ativar (ver{" "}
            <code className="text-xs">docs/RELATORIO_ESCOPOS_MVP.md</code>). Em modo live essas chamadas tendem a
            falhar por permissão até o pacote ser ativado e o creator re-autorizar o app. Em modo mock tudo funciona
            normalmente.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// =============== Aba 1: Produtos & Música ===============

function DiscoverTab() {
  return (
    <div className="space-y-6">
      <ShopProductsSection />
      <MusicSearchSection />
    </div>
  );
}

const SHOP_SORT_OPTIONS: { value: ShopProductSortField; label: string }[] = [
  { value: "PRODUCT_ID", label: "ID do produto" },
  { value: "PRICE", label: "Preço" },
  { value: "SALE", label: "Vendas" },
];

/** Get Shop Products (202509) — produtos da loja vinculada ao creator. */
function ShopProductsSection() {
  const [keyword, setKeyword] = useState("");
  const [applied, setApplied] = useState("");
  const [sortField, setSortField] = useState<ShopProductSortField>("PRODUCT_ID");
  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">("DESC");
  const [pageToken, setPageToken] = useState<string | undefined>();

  useEffect(() => setPageToken(undefined), [applied, sortField, sortOrder]);

  const filters: ShopProductsFilters = useMemo(
    () => ({ titleKeyword: applied || undefined, sortField, sortOrder, pageToken, pageSize: 20 }),
    [applied, sortField, sortOrder, pageToken]
  );
  const { data, isLoading, error } = useShopProducts(filters);
  const products = data?.products ?? [];

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setApplied(keyword.trim());
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Package className="h-4 w-4" /> Produtos da loja
        </CardTitle>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Get Shop Products (202509) — não retorna comissão (isso fica na área Descoberta)
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por título…"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button type="submit" className="gap-2">
            <Search className="h-4 w-4" /> Buscar
          </Button>
        </form>

        <div className="flex flex-wrap items-center gap-2 border-t pt-3">
          <span className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
            <ArrowUpDown className="h-4 w-4" /> Ordenar por
          </span>
          <div className="flex flex-wrap gap-2">
            {SHOP_SORT_OPTIONS.map((opt) => (
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

        {error ? (
          <ErrorBanner text={`Não foi possível carregar os produtos: ${(error as Error).message}`} />
        ) : isLoading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-64 w-full rounded-xl" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <EmptyState icon={Package} text="Nenhum produto encontrado com esses filtros." />
        ) : (
          <>
            <p className="text-xs text-muted-foreground">
              {data?.total_count != null
                ? `${formatNumber(data.total_count)} produtos no total`
                : `${products.length} produtos`}
            </p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((p, i) => (
                <ShopProductCard key={p.id ?? i} product={p} />
              ))}
            </div>
          </>
        )}

        {!isLoading && products.length > 0 && (pageToken || data?.next_page_token) && (
          <div className="flex flex-wrap items-center justify-between gap-2 border-t pt-4">
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
  );
}

function ShopProductCard({ product }: { product: ShopProduct }) {
  const img = product.images?.[0]?.url;
  const status = product.added_status?.trim();
  return (
    <Card className="animate-fade-in overflow-hidden">
      <div className="relative flex h-36 items-center justify-center bg-muted">
        <ProductImage src={img} alt={product.title} />
        {status && (
          <Badge variant={addedStatusVariant(status)} className="absolute right-2 top-2 whitespace-nowrap">
            {ADDED_STATUS_LABELS[status.toUpperCase()] ?? status}
          </Badge>
        )}
      </div>
      <CardContent className="space-y-2 p-4">
        <p className="line-clamp-2 min-h-[2.5rem] text-sm font-medium">{product.title ?? `Produto ${product.id}`}</p>
        {product.brand_name && (
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Tag className="h-3.5 w-3.5" /> {product.brand_name}
          </p>
        )}
        <div className="flex items-center justify-between">
          <span className="font-semibold">{formatMoney(product.price)}</span>
          {product.sales_count != null && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <ShoppingBag className="h-3 w-3" /> {formatNumber(product.sales_count)} vendidos
            </span>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          className="w-full gap-1.5"
          disabled={!product.id}
          onClick={() => product.id && copyToClipboard(product.id, "ID do produto")}
        >
          <Copy className="h-3.5 w-3.5" /> Copiar ID do produto
        </Button>
      </CardContent>
    </Card>
  );
}

/** Search Music (202602) — biblioteca de música pra usar como BGM do vídeo/foto shoppable. */
function MusicSearchSection() {
  const [keywordInput, setKeywordInput] = useState(USE_MOCK ? "Love Story" : "");
  const [appliedKeyword, setAppliedKeyword] = useState(USE_MOCK ? "Love Story" : "");
  const [searchId, setSearchId] = useState<string | undefined>();
  const [pageToken, setPageToken] = useState<string | undefined>();

  useEffect(() => {
    setPageToken(undefined);
    setSearchId(undefined);
  }, [appliedKeyword]);

  const filters: MusicSearchFilters = useMemo(
    () => ({ keyword: appliedKeyword, searchId, pageToken, pageSize: 20 }),
    [appliedKeyword, searchId, pageToken]
  );
  const { data, isLoading, error } = useMusicSearch(filters);
  const tracks = data?.music ?? [];

  // Search Music devolve um search_id na 1ª página que precisa ser repetido nas seguintes.
  useEffect(() => {
    if (data?.search_id && data.search_id !== searchId) setSearchId(data.search_id);
  }, [data?.search_id, searchId]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!keywordInput.trim()) return;
    setAppliedKeyword(keywordInput.trim());
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Music className="h-4 w-4" /> Buscar música
        </CardTitle>
        <p className="mt-0.5 text-xs text-muted-foreground">Search Music (202602) — para usar como BGM do vídeo/foto</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Nome da música ou artista…"
              value={keywordInput}
              onChange={(e) => setKeywordInput(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button type="submit" className="gap-2" disabled={!keywordInput.trim()}>
            <Search className="h-4 w-4" /> Buscar
          </Button>
        </form>

        {!appliedKeyword ? (
          <EmptyState icon={Music} text="Informe uma palavra-chave para buscar músicas." />
        ) : error ? (
          <ErrorBanner text={`Não foi possível buscar músicas: ${(error as Error).message}`} />
        ) : isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        ) : tracks.length === 0 ? (
          <EmptyState icon={Music} text="Nenhuma música encontrada para essa busca." />
        ) : (
          <div className="space-y-2">
            {tracks.map((t, i) => (
              <MusicTrackRow key={t.id ?? i} track={t} />
            ))}
          </div>
        )}

        {!isLoading && tracks.length > 0 && (pageToken || data?.has_more) && (
          <div className="flex flex-wrap items-center justify-between gap-2 border-t pt-4">
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
                disabled={!data?.has_more}
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
  );
}

function MusicTrackRow({ track }: { track: MusicTrack }) {
  const cover = track.cover_thumb?.url_list?.[0];
  const playUrl = track.play_url?.url_list?.[0];
  return (
    <div className="flex items-center gap-3 rounded-lg border bg-muted/30 p-3">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted">
        <MusicCover src={cover} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{track.title ?? `Música ${track.id}`}</p>
        <p className="truncate text-xs text-muted-foreground">
          {track.author ?? "—"} · {formatTrackDuration(track.duration)}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        {playUrl && (
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8"
            aria-label="Abrir prévia da música"
            onClick={() => window.open(playUrl, "_blank", "noopener,noreferrer")}
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </Button>
        )}
        <Button
          size="sm"
          variant="outline"
          className="gap-1"
          disabled={!track.id}
          onClick={() => track.id && copyToClipboard(track.id, "ID da música")}
        >
          <Copy className="h-3.5 w-3.5" /> Copiar ID
        </Button>
      </div>
    </div>
  );
}

function MusicCover({ src }: { src?: string }) {
  const [err, setErr] = useState(false);
  if (!src || err) return <Music className="h-5 w-5 text-muted-foreground" />;
  return <img src={src} alt="" onError={() => setErr(true)} className="h-full w-full object-cover" />;
}

// =============== Aba 2: Publicar (pipeline) ===============

function PublishTab({ onTaskId, onVideoId }: { onTaskId: (id: string) => void; onVideoId: (id: string) => void }) {
  const [videoFileId, setVideoFileId] = useState<string | undefined>();
  const [photoUris, setPhotoUris] = useState<string[]>([]);

  return (
    <div className="space-y-5">
      <StepUploadInit />

      <SectionDivider icon={Film} label="Fluxo de vídeo" />
      <StepUploadVideo onUploaded={setVideoFileId} />
      <StepPrecheck defaultFileId={videoFileId} onTaskId={onTaskId} />
      <StepPostVideo defaultFileId={videoFileId} onPosted={onVideoId} />

      <SectionDivider icon={ImagePlus} label="Fluxo de fotos" />
      <StepUploadPhoto
        photoUris={photoUris}
        onUploaded={(uri) => setPhotoUris((prev) => [...prev, uri])}
        onRemove={(index) => setPhotoUris((prev) => prev.filter((_, i) => i !== index))}
      />
      <StepPostPhotos defaultPhotoUris={photoUris} />
    </div>
  );
}

function SectionDivider({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
  return (
    <div className="flex items-center gap-2 pt-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
      <Icon className="h-3.5 w-3.5" /> {label}
      <div className="h-px flex-1 bg-border" />
    </div>
  );
}

function StepCard({
  step,
  icon: Icon,
  title,
  subtitle,
  children,
}: {
  step: number;
  icon: LucideIcon;
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-3 space-y-0">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
          {step}
        </div>
        <div className="min-w-0 flex-1">
          <CardTitle className="flex items-center gap-2 text-base">
            <Icon className="h-4 w-4" /> {title}
          </CardTitle>
          <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">{children}</CardContent>
    </Card>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  inputMode,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  inputMode?: FieldInputMode;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-1">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        inputMode={inputMode}
        disabled={disabled}
      />
    </div>
  );
}

function ResultField({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="space-y-1">
      <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <div className="flex items-center gap-1 rounded-lg border bg-muted/30 p-1.5 pl-2.5">
        <p className="min-w-0 flex-1 truncate text-xs">{value}</p>
        <Button size="sm" variant="ghost" className="h-7 shrink-0 gap-1 px-2" onClick={() => copyToClipboard(value, label)}>
          <Copy className="h-3.5 w-3.5" /> Copiar
        </Button>
      </div>
    </div>
  );
}

/** Passo 1 — Upload File Init (202512): sessão genérica de upload de arquivo grande. */
function StepUploadInit() {
  const mutation = useUploadFileInit();
  const [fileName, setFileName] = useState(USE_MOCK ? "video_20251201.mp4" : "");
  const [fileType, setFileType] = useState("video");
  const [fileSize, setFileSize] = useState(USE_MOCK ? "1024" : "");
  const [totalChunkCount, setTotalChunkCount] = useState("1");
  const [targetPath, setTargetPath] = useState(USE_MOCK ? "[POST]/affiliate_seller/202501/images/upload" : "");
  const [shopCipher, setShopCipher] = useState("");
  const [categoryAssetCipher, setCategoryAssetCipher] = useState("");
  const mockNote = USE_MOCK ? " (simulado)" : "";

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const size = parseInt(fileSize, 10);
    const chunks = parseInt(totalChunkCount, 10);
    if (!fileName.trim() || !fileType.trim() || !targetPath.trim() || !Number.isFinite(size)) {
      toast.error("Preencha nome, tipo, tamanho (bytes) e target_path");
      return;
    }
    mutation.mutate(
      {
        fileName: fileName.trim(),
        fileType: fileType.trim(),
        fileSize: size,
        totalChunkCount: Number.isFinite(chunks) && chunks > 0 ? chunks : 1,
        targetPath: targetPath.trim(),
        shopCipher: shopCipher.trim() || undefined,
        categoryAssetCipher: categoryAssetCipher.trim() || undefined,
      },
      {
        onSuccess: () => toast.success(`Upload inicializado${mockNote}`),
        onError: (err) => toast.error((err as Error).message),
      }
    );
  };

  return (
    <StepCard
      step={1}
      icon={UploadCloud}
      title="Inicializar upload de arquivo"
      subtitle="Upload File Init (202512) — sessão genérica de upload usada antes de subir um arquivo grande"
    >
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Nome do arquivo" value={fileName} onChange={setFileName} placeholder="video_20251201.mp4" />
          <Field label="Tipo do arquivo" value={fileType} onChange={setFileType} placeholder="video" />
          <Field label="Tamanho (bytes)" value={fileSize} onChange={setFileSize} placeholder="1024" inputMode="numeric" />
          <Field label="Total de chunks" value={totalChunkCount} onChange={setTotalChunkCount} placeholder="1" inputMode="numeric" />
        </div>
        <Field
          label="target_path"
          value={targetPath}
          onChange={setTargetPath}
          placeholder="[POST]/affiliate_seller/202501/images/upload"
        />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="shop_cipher (opcional, lojas cross-border)" value={shopCipher} onChange={setShopCipher} />
          <Field label="category_asset_cipher (opcional)" value={categoryAssetCipher} onChange={setCategoryAssetCipher} />
        </div>
        <Button type="submit" disabled={mutation.isPending} className="gap-2">
          <UploadCloud className="h-4 w-4" /> {mutation.isPending ? "Inicializando…" : "Inicializar upload"}
        </Button>
      </form>
      {mutation.isError && (
        <ErrorBanner text={`Não foi possível inicializar o upload: ${(mutation.error as Error).message}`} />
      )}
      {mutation.data && (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <ResultField label="upload_url" value={mutation.data.upload_url} />
          <ResultField label="upload_token" value={mutation.data.upload_token} />
        </div>
      )}
    </StepCard>
  );
}

/** Passo 2 — Upload Shoppable Video File (202505). */
function StepUploadVideo({ onUploaded }: { onUploaded: (id: string) => void }) {
  const mutation = useUploadShoppableVideoFile();
  const [fileName, setFileName] = useState(USE_MOCK ? "video_20260201.mp4" : "");
  const mockNote = USE_MOCK ? " (simulado)" : "";

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!fileName.trim()) {
      toast.error("Informe o nome do arquivo de vídeo");
      return;
    }
    mutation.mutate(fileName.trim(), {
      onSuccess: (data) => {
        toast.success(`Vídeo enviado${mockNote}`);
        if (data.video_file?.id) onUploaded(data.video_file.id);
      },
      onError: (err) => toast.error((err as Error).message),
    });
  };

  return (
    <StepCard step={2} icon={Film} title="Upload do arquivo de vídeo" subtitle="Upload Shoppable Video File (202505)">
      <p className="text-[11px] text-muted-foreground">
        Upload real de binário não é suportado nesta ferramenta web (o client só manda JSON) — informe um nome de
        arquivo local só para simular a chamada e ver o retorno.
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <Field label="Arquivo de vídeo (local)" value={fileName} onChange={setFileName} placeholder="video_20260201.mp4" />
        </div>
        <Button type="submit" disabled={mutation.isPending} className="gap-2">
          <UploadCloud className="h-4 w-4" /> {mutation.isPending ? "Enviando…" : "Enviar vídeo"}
        </Button>
      </form>
      {mutation.isError && (
        <ErrorBanner text={`Não foi possível subir o vídeo: ${(mutation.error as Error).message}`} />
      )}
      {mutation.data?.video_file && (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <ResultField label="file_id (video_file.id)" value={mutation.data.video_file.id} />
          <ResultField label="md5" value={mutation.data.video_file.md5} />
        </div>
      )}
    </StepCard>
  );
}

/** Passo 3 — Precheck Video Content (202511). */
function StepPrecheck({ defaultFileId, onTaskId }: { defaultFileId?: string; onTaskId: (id: string) => void }) {
  const mutation = usePrecheckVideoContent();
  const [fileId, setFileId] = useState(USE_MOCK ? "v12d00gd0024d3nfqr7og65" : "");
  const [productId, setProductId] = useState(USE_MOCK ? "17294069642063424" : "");
  const [anchorTitle, setAnchorTitle] = useState(USE_MOCK ? "Sample product anchor title" : "");
  const mockNote = USE_MOCK ? " (simulado)" : "";

  const prereq = useCheckAnchorPrerequisites();
  const content = useCheckAnchorContent();
  const validando = prereq.isPending || content.isPending;

  /**
   * Roda as duas checagens de âncora. Elas NÃO dependem de `creator.video.write`,
   * então funcionam com os escopos atuais mesmo com a publicação travada.
   */
  const validarAncora = async () => {
    try {
      await prereq.mutateAsync(productId.trim());
    } catch (e) {
      toast.error(`Produto: ${(e as Error).message}`);
      return;
    }
    try {
      await content.mutateAsync(anchorTitle.trim());
    } catch (e) {
      toast.error(`Título: ${(e as Error).message}`);
      return;
    }
    toast.success("Produto e título aprovados para virar âncora.");
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!fileId.trim() || !productId.trim() || !anchorTitle.trim()) {
      toast.error("Preencha file_id, ID do produto e o título da âncora");
      return;
    }
    mutation.mutate(
      { fileId: fileId.trim(), productId: productId.trim(), anchorTitle: anchorTitle.trim() },
      {
        onSuccess: (data) => {
          toast.success(`Precheck iniciado${mockNote}`);
          if (data.precheck?.task_id) onTaskId(data.precheck.task_id);
        },
        onError: (err) => toast.error((err as Error).message),
      }
    );
  };

  return (
    <StepCard
      step={3}
      icon={ShieldCheck}
      title="Prechecar o vídeo"
      subtitle="Precheck Video Content (202511) — checa violação de política e a âncora de produto"
    >
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Field label="file_id do vídeo" value={fileId} onChange={setFileId} placeholder="v12d00gd0024d3nfqr7og65" />
          <Field label="ID do produto" value={productId} onChange={setProductId} placeholder="17294069642063424" />
          <Field
            label="Título da âncora (< 30 car.)"
            value={anchorTitle}
            onChange={setAnchorTitle}
            placeholder="Sample product anchor title"
          />
        </div>
        {defaultFileId && defaultFileId !== fileId && (
          <Button type="button" size="sm" variant="ghost" className="h-7 gap-1 px-2 text-xs" onClick={() => setFileId(defaultFileId)}>
            Usar file_id enviado no passo 2 ({defaultFileId})
          </Button>
        )}
        <div className="flex flex-wrap items-center gap-2">
          <Button type="submit" disabled={mutation.isPending} className="gap-2">
            <ShieldCheck className="h-4 w-4" /> {mutation.isPending ? "Enviando…" : "Prechecar vídeo"}
          </Button>
          {/* Estas duas checagens NÃO dependem de creator.video.write — funcionam
              com os escopos atuais, então servem de validação prévia mesmo com a
              publicação travada. */}
          <Button
            type="button"
            variant="outline"
            className="gap-2"
            disabled={!productId.trim() || !anchorTitle.trim() || validando}
            onClick={validarAncora}
          >
            <BadgeCheck className="h-4 w-4" /> {validando ? "Validando…" : "Validar produto e título"}
          </Button>
        </div>
      </form>
      {mutation.isError && (
        <ErrorBanner text={`Não foi possível prechecar o vídeo: ${(mutation.error as Error).message}`} />
      )}
      {mutation.data?.precheck?.task_id && (
        <>
          <ResultField label="task_id" value={mutation.data.precheck.task_id} />
          <p className="text-xs text-muted-foreground">
            Consulte o resultado na aba <strong>Status</strong> com esse task_id.
          </p>
        </>
      )}
    </StepCard>
  );
}

/** Passo 4 — Post Shoppable Video (202607). */
function StepPostVideo({ defaultFileId, onPosted }: { defaultFileId?: string; onPosted: (id: string) => void }) {
  const mutation = usePostShoppableVideo();
  const [fileId, setFileId] = useState(USE_MOCK ? "v12d00gd0024d3nfqr7og65" : "");
  const [title, setTitle] = useState(USE_MOCK ? "Sample video title" : "");
  const [musicId, setMusicId] = useState("");
  const [coverUri, setCoverUri] = useState("");
  const [coverTimestampMs, setCoverTimestampMs] = useState("");
  const [isAiGenerated, setIsAiGenerated] = useState(false);
  const [productId, setProductId] = useState(USE_MOCK ? "17294069642063424" : "");
  const [anchorTitle, setAnchorTitle] = useState(USE_MOCK ? "Sample product anchor title" : "");
  const mockNote = USE_MOCK ? " (simulado)" : "";

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!fileId.trim() || !title.trim() || !productId.trim() || !anchorTitle.trim()) {
      toast.error("Preencha file_id, legenda, ID do produto e o título da âncora");
      return;
    }
    mutation.mutate(
      {
        fileId: fileId.trim(),
        title: title.trim(),
        musicId: musicId.trim() || undefined,
        coverUri: coverUri.trim() || undefined,
        coverTimestampMs: coverTimestampMs.trim() ? Number(coverTimestampMs) : undefined,
        isAiGenerated,
        productId: productId.trim(),
        anchorTitle: anchorTitle.trim(),
      },
      {
        onSuccess: (data) => {
          toast.success(`Vídeo publicado${mockNote}${data.quota ? ` · cota: ${data.quota}` : ""}`);
          if (data.video?.id) onPosted(data.video.id);
        },
        onError: (err) => toast.error((err as Error).message),
      }
    );
  };

  return (
    <StepCard step={4} icon={Rocket} title="Publicar vídeo shoppable" subtitle="Post Shoppable Video (202607)">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="file_id do vídeo" value={fileId} onChange={setFileId} placeholder="v12d00gd0024d3nfqr7og65" />
          <Field label="Legenda (title)" value={title} onChange={setTitle} placeholder="Sample video title" />
          <Field label="ID do produto" value={productId} onChange={setProductId} placeholder="17294069642063424" />
          <Field
            label="Título da âncora (< 30 car.)"
            value={anchorTitle}
            onChange={setAnchorTitle}
            placeholder="Sample product anchor title"
          />
          <Field label="music_id (opcional)" value={musicId} onChange={setMusicId} placeholder="ID da aba Produtos & Música" />
          <Field label="cover_uri (opcional)" value={coverUri} onChange={setCoverUri} placeholder="photo_uri da capa" />
          <Field
            label="cover_timestamp_ms (opcional)"
            value={coverTimestampMs}
            onChange={setCoverTimestampMs}
            placeholder="1000"
            inputMode="numeric"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" size="sm" variant={isAiGenerated ? "toggle-on" : "toggle"} onClick={() => setIsAiGenerated((v) => !v)}>
            {isAiGenerated ? "Marcado como gerado por IA" : "Marcar como gerado por IA"}
          </Button>
          {defaultFileId && defaultFileId !== fileId && (
            <Button type="button" size="sm" variant="ghost" className="gap-1 text-xs" onClick={() => setFileId(defaultFileId)}>
              Usar file_id enviado no passo 2
            </Button>
          )}
        </div>
        <Button type="submit" disabled={mutation.isPending} className="gap-2">
          <Rocket className="h-4 w-4" /> {mutation.isPending ? "Publicando…" : "Publicar vídeo"}
        </Button>
      </form>
      {mutation.isError && (
        <ErrorBanner text={`Não foi possível publicar o vídeo: ${(mutation.error as Error).message}`} />
      )}
      {mutation.data?.video?.id && (
        <>
          <ResultField label="video.id" value={mutation.data.video.id} />
          {mutation.data.quota && <p className="text-xs text-muted-foreground">Cota de publicação: {mutation.data.quota}</p>}
          <p className="text-xs text-muted-foreground">
            Consulte o status na aba <strong>Status</strong> com esse video_id.
          </p>
        </>
      )}
    </StepCard>
  );
}

/** Passo 5 — Upload Shoppable Photo File (202511). */
function StepUploadPhoto({
  photoUris,
  onUploaded,
  onRemove,
}: {
  photoUris: string[];
  onUploaded: (uri: string) => void;
  onRemove: (index: number) => void;
}) {
  const mutation = useUploadShoppablePhotoFile();
  const [fileName, setFileName] = useState(USE_MOCK ? "foto_20260201.jpg" : "");
  const mockNote = USE_MOCK ? " (simulado)" : "";

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!fileName.trim()) {
      toast.error("Informe o nome do arquivo de foto");
      return;
    }
    mutation.mutate(fileName.trim(), {
      onSuccess: (data) => {
        toast.success(`Foto enviada${mockNote}`);
        if (data.photo_file?.photo_uri) onUploaded(data.photo_file.photo_uri);
      },
      onError: (err) => toast.error((err as Error).message),
    });
  };

  return (
    <StepCard step={5} icon={ImagePlus} title="Upload de arquivo(s) de foto" subtitle="Upload Shoppable Photo File (202511)">
      <p className="text-[11px] text-muted-foreground">
        Assim como no vídeo, o upload real de binário não é suportado aqui — informe um nome de arquivo por vez; cada
        envio soma um photo_uri à lista usada no passo de publicar fotos.
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <Field label="Arquivo de foto (local)" value={fileName} onChange={setFileName} placeholder="foto_20260201.jpg" />
        </div>
        <Button type="submit" disabled={mutation.isPending} className="gap-2">
          <UploadCloud className="h-4 w-4" /> {mutation.isPending ? "Enviando…" : "Enviar foto"}
        </Button>
      </form>
      {mutation.isError && (
        <ErrorBanner text={`Não foi possível subir a foto: ${(mutation.error as Error).message}`} />
      )}
      {mutation.data?.photo_file?.photo_uri && (
        <ResultField label="photo_uri (último envio)" value={mutation.data.photo_file.photo_uri} />
      )}
      {photoUris.length > 0 && (
        <div className="space-y-1.5 border-t pt-3">
          <p className="text-xs font-medium text-muted-foreground">Fotos prontas para publicar ({photoUris.length})</p>
          <div className="flex flex-wrap gap-2">
            {photoUris.map((uri, i) => (
              <Badge key={`${uri}-${i}`} variant="outline" className="gap-1.5 py-1 pl-2.5 pr-1.5 font-normal">
                <span className="max-w-[140px] truncate">{uri}</span>
                <button
                  type="button"
                  onClick={() => onRemove(i)}
                  aria-label="Remover foto"
                  className="rounded-full p-0.5 hover:bg-muted"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      )}
    </StepCard>
  );
}

const PHOTO_POST_TYPES: { value: PhotoPostType; label: string }[] = [
  { value: "1", label: "Produto" },
  { value: "2", label: "Loja" },
  { value: "3", label: "1 foto = 1 produto" },
];

/** Passo 6 — Post Shoppable Photos (202607). */
function StepPostPhotos({ defaultPhotoUris }: { defaultPhotoUris: string[] }) {
  const mutation = usePostShoppablePhotos();
  const [urisText, setUrisText] = useState("");
  const [musicId, setMusicId] = useState("");
  const [title, setTitle] = useState(USE_MOCK ? "Post title" : "");
  const [postType, setPostType] = useState<PhotoPostType>("1");
  const [shopId, setShopId] = useState("");
  const [groupType, setGroupType] = useState("");
  const [groupId, setGroupId] = useState("");
  const [productId, setProductId] = useState("");
  const [linkTitle, setLinkTitle] = useState("");
  const mockNote = USE_MOCK ? " (simulado)" : "";

  const typedUris = parseLines(urisText);
  const effectiveUris = typedUris.length > 0 ? typedUris : defaultPhotoUris;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (effectiveUris.length === 0) {
      toast.error("Informe ao menos um photo_uri (ou envie fotos no passo 5)");
      return;
    }
    mutation.mutate(
      {
        photoFileUris: effectiveUris,
        musicId: musicId.trim() || undefined,
        title: title.trim() || undefined,
        postType,
        shopId: shopId.trim() || undefined,
        groupType: groupType.trim() || undefined,
        groupId: groupId.trim() || undefined,
        productId: productId.trim() || undefined,
        linkTitle: linkTitle.trim() || undefined,
      },
      {
        onSuccess: (data) => {
          toast.success(`Fotos publicadas${mockNote}${data.quota ? ` · cota: ${data.quota}` : ""}`);
        },
        onError: (err) => toast.error((err as Error).message),
      }
    );
  };

  return (
    <StepCard step={6} icon={Rocket} title="Publicar fotos shoppable" subtitle="Post Shoppable Photos (202607)">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">photo_uris (um por linha — vazio usa as fotos do passo 5)</Label>
          <textarea
            rows={2}
            className={textareaClass}
            placeholder="skldjfskdlfjlskdfs000023423s"
            value={urisText}
            onChange={(e) => setUrisText(e.target.value)}
          />
          <p className="text-[11px] text-muted-foreground">
            {typedUris.length === 0 && defaultPhotoUris.length > 0
              ? `Vazio: vai usar as ${defaultPhotoUris.length} foto(s) enviadas no passo 5.`
              : `${effectiveUris.length} foto(s) reconhecida(s).`}
          </p>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Título do post (opcional)" value={title} onChange={setTitle} placeholder="Legenda + #hashtags" />
          <Field label="music_id (opcional)" value={musicId} onChange={setMusicId} placeholder="ID da aba Produtos & Música" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Tipo de vínculo (link_info.post_type)</Label>
          <div className="flex flex-wrap gap-2">
            {PHOTO_POST_TYPES.map((opt) => (
              <Button
                key={opt.value}
                type="button"
                size="sm"
                variant={postType === opt.value ? "toggle-on" : "toggle"}
                onClick={() => setPostType(opt.value)}
              >
                {opt.label}
              </Button>
            ))}
          </div>
        </div>
        {postType === "2" ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Field label="shop_id" value={shopId} onChange={setShopId} placeholder="7494831143334152261" />
            <Field label="group_type (1=home, 2=categoria, 3=coleção)" value={groupType} onChange={setGroupType} placeholder="1" />
            <Field label="group_id" value={groupId} onChange={setGroupId} placeholder="6" />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="ID do produto" value={productId} onChange={setProductId} placeholder="74998589993939330" />
            <Field label="Título da âncora (< 30 car.)" value={linkTitle} onChange={setLinkTitle} placeholder="product A" />
          </div>
        )}
        <Button type="submit" disabled={mutation.isPending} className="gap-2">
          <Rocket className="h-4 w-4" /> {mutation.isPending ? "Publicando…" : "Publicar fotos"}
        </Button>
      </form>
      {mutation.isError && (
        <ErrorBanner text={`Não foi possível publicar as fotos: ${(mutation.error as Error).message}`} />
      )}
      {mutation.data?.photo?.photo_post_id && (
        <>
          <ResultField label="photo_post_id" value={mutation.data.photo.photo_post_id} />
          {mutation.data.quota && <p className="text-xs text-muted-foreground">Cota de publicação: {mutation.data.quota}</p>}
        </>
      )}
    </StepCard>
  );
}

// =============== Aba 3: Status (consultas) ===============

function StatusTab({ initialTaskId, initialVideoId }: { initialTaskId?: string; initialVideoId?: string }) {
  return (
    <div className="space-y-6">
      <VideoStatusTool initialId={initialVideoId} />
      <PrecheckResultTool initialId={initialTaskId} />
    </div>
  );
}

/** Get Shoppable Video Status (202509) — video_id no path. */
function VideoStatusTool({ initialId }: { initialId?: string }) {
  const [videoId, setVideoId] = useState(initialId || (USE_MOCK ? "7493990579714164574" : ""));
  const [applied, setApplied] = useState(videoId);

  const { data, isLoading, error, refetch, isFetching } = useShoppableVideoStatus(applied);
  const video = data?.video;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!videoId.trim()) return;
    setApplied(videoId.trim());
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <PlayCircle className="h-4 w-4" /> Status do vídeo publicado
        </CardTitle>
        <p className="mt-0.5 text-xs text-muted-foreground">Get Shoppable Video Status (202509)</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1 space-y-1">
            <Label className="text-xs text-muted-foreground">video_id</Label>
            <Input value={videoId} onChange={(e) => setVideoId(e.target.value)} placeholder="7493990579714164574" />
          </div>
          <Button type="submit" className="gap-2" disabled={!videoId.trim()}>
            <Search className="h-4 w-4" /> Consultar
          </Button>
        </form>

        {!applied ? (
          <EmptyState icon={PlayCircle} text="Informe o ID de um vídeo publicado (aba Publicar) para ver o status." />
        ) : error ? (
          <ErrorBanner text={`Não foi possível consultar o status: ${(error as Error).message}`} />
        ) : isLoading || !video ? (
          <div className="space-y-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-5 w-24" />
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-3 rounded-lg border bg-muted/30 p-4">
            <Badge variant={statusVariant(video.post_status)} className="gap-1.5">
              <StatusIcon status={video.post_status} />
              {STATUS_LABELS[video.post_status?.toUpperCase() ?? ""] ?? video.post_status ?? "—"}
            </Badge>
            <span className="text-sm text-muted-foreground">ID: {video.id ?? "—"}</span>
            {video.post_time != null && (
              <span className="text-sm text-muted-foreground">Publicado em {formatDate(video.post_time)}</span>
            )}
            <Button size="sm" variant="ghost" className="ml-auto gap-1.5" onClick={() => refetch()} disabled={isFetching}>
              <RefreshCw className="h-3.5 w-3.5" /> Atualizar
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/** Get Shoppable Video Precheck Result (202601) — task_id no path. */
function PrecheckResultTool({ initialId }: { initialId?: string }) {
  const [taskId, setTaskId] = useState(initialId || (USE_MOCK ? "7493990579714164574" : ""));
  const [applied, setApplied] = useState(taskId);

  const { data, isLoading, error, refetch, isFetching } = useShoppableVideoPrecheckResult(applied);
  const task = data?.precheck_task;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!taskId.trim()) return;
    setApplied(taskId.trim());
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <ShieldCheck className="h-4 w-4" /> Resultado do precheck
        </CardTitle>
        <p className="mt-0.5 text-xs text-muted-foreground">Get Shoppable Video Precheck Result (202601)</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1 space-y-1">
            <Label className="text-xs text-muted-foreground">task_id</Label>
            <Input value={taskId} onChange={(e) => setTaskId(e.target.value)} placeholder="1123123123" />
          </div>
          <Button type="submit" className="gap-2" disabled={!taskId.trim()}>
            <Search className="h-4 w-4" /> Consultar
          </Button>
        </form>

        {!applied ? (
          <EmptyState icon={ShieldCheck} text="Informe o task_id devolvido pelo Precheck Video Content (aba Publicar)." />
        ) : error ? (
          <ErrorBanner text={`Não foi possível consultar o precheck: ${(error as Error).message}`} />
        ) : isLoading || !task ? (
          <div className="space-y-2">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">ID do precheck: {task.id ?? "—"}</span>
              <Button size="sm" variant="ghost" className="gap-1.5" onClick={() => refetch()} disabled={isFetching}>
                <RefreshCw className="h-3.5 w-3.5" /> Atualizar
              </Button>
            </div>
            <PrecheckResultBlock title="Checagem de violação de política" result={task.violation_check_result} />
            <PrecheckResultBlock title="Checagem de qualidade" result={task.good_quality_check_result} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function PrecheckResultBlock({
  title,
  result,
}: {
  title: string;
  result?: { status?: string; issues?: { risk?: string; code?: string; suggestions?: string }[] };
}) {
  const issues = result?.issues ?? [];
  return (
    <div className="rounded-lg border bg-muted/30 p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{title}</p>
        <Badge variant={statusVariant(result?.status)} className="gap-1.5">
          <StatusIcon status={result?.status} />
          {STATUS_LABELS[result?.status?.toUpperCase() ?? ""] ?? result?.status ?? "—"}
        </Badge>
      </div>
      {issues.length === 0 ? (
        <p className="text-xs text-muted-foreground">Nenhum problema encontrado.</p>
      ) : (
        <ul className="space-y-1.5 text-xs">
          {issues.map((issue, i) => (
            <li key={i} className="flex items-start gap-1.5">
              <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0 text-warning" />
              <span>
                <strong>{issue.risk ?? issue.code ?? "Aviso"}:</strong> {issue.suggestions ?? "Sem detalhes."}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// =============== Compartilhados ===============

function ProductImage({ src, alt }: { src?: string; alt?: string }) {
  const [err, setErr] = useState(false);
  if (!src || err) return <Package className="h-8 w-8 text-muted-foreground" />;
  return <img src={src} alt={alt ?? ""} onError={() => setErr(true)} className="h-full w-full object-cover" />;
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
