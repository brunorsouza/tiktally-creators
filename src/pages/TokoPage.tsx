import { useState, type FormEvent } from "react";
import {
  Globe2,
  ShieldAlert,
  AlertCircle,
  AlertTriangle,
  ArrowRightLeft,
  Wand2,
  PackageSearch,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useTokoProductMappers, useMapTokoProductV2 } from "@/hooks/useToko";
import { USE_MOCK } from "@/services/creatorClient";
import type { GetTokoProductMappersData } from "@/types/creator-api.generated";

type MapperRow = NonNullable<GetTokoProductMappersData["product"]>[number];
type MapperError = GetTokoProductMappersData["error"];

const SCOPE_NAME = "creator.affiliate.share_link.read";

const textareaClass =
  "flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

/** Aceita IDs Tokopedia separados por vírgula, ponto-e-vírgula ou quebra de linha;
 *  ignora entradas não numéricas e remove duplicatas. Sem limite de quantidade
 *  documentado pela API para este endpoint (diferente dos de Links, que travam em 50). */
function parseTokoPids(raw: string): number[] {
  const ids = raw
    .split(/[\n,;]+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => Number(s))
    .filter((n) => Number.isFinite(n) && Number.isInteger(n) && n > 0);
  return Array.from(new Set(ids));
}

export default function TokoPage() {
  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="animate-slide-up">
          <h1 className="text-2xl font-bold tracking-tight">Toko Mapper</h1>
          <p className="text-muted-foreground">
            Converte IDs de produto entre o formato Tokopedia e o formato TikTok Shop.
          </p>
        </div>
        <Badge variant={USE_MOCK ? "warning" : "success"} className="mt-1 shrink-0">
          {USE_MOCK ? "Mock" : "Live"}
        </Badge>
      </header>

      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="flex items-start gap-3 p-4 text-sm">
          <Globe2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <div className="space-y-1">
            <p className="font-medium">Recurso específico da Tokopedia (Indonésia)</p>
            <p className="text-muted-foreground">
              A Tokopedia foi incorporada ao TikTok Shop na Indonésia e manteve seu próprio formato de ID de
              produto (<code className="rounded bg-background/60 px-1 py-0.5 text-xs">toko_pid</code>). Esta área
              só é útil para agências/creators cadastrados na região da Indonésia — <strong>não se aplica ao
              mercado brasileiro</strong>, onde todo produto já usa nativamente o ID do TikTok Shop (
              <code className="rounded bg-background/60 px-1 py-0.5 text-xs">tts_pid</code>). Fica aqui só para
              cobertura completa dos 36 endpoints de creator.
            </p>
          </div>
        </CardContent>
      </Card>

      {!USE_MOCK && (
        <Card className="border-warning/30 bg-warning/10">
          <CardContent className="flex items-start gap-3 p-4 text-sm">
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
            <div className="space-y-1">
              <p className="font-medium">Mapear produto (V2) exige um escopo ainda não liberado</p>
              <p className="text-muted-foreground">
                O endpoint Toko Product Mapper V2 pede o escopo{" "}
                <code className="rounded bg-background/60 px-1 py-0.5 text-xs">{SCOPE_NAME}</code> (pacote{" "}
                <strong>Read Affiliate Share Link</strong>), que hoje está <strong>ausente</strong> no app (ver{" "}
                <code className="text-xs">docs/RELATORIO_ESCOPOS_MVP.md</code>). Em modo live essa chamada tende a
                falhar por permissão até o pacote ser adicionado e o creator re-autorizar o app. A consulta de
                mapeamentos (GET, abaixo) não exige escopo e continua disponível normalmente. Em modo mock as duas
                ferramentas funcionam sem restrição.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <LookupTool />
      <MapperV2Tool />
    </div>
  );
}

// =============== Ferramenta 1: consultar mapeamento (GET) ===============

function LookupTool() {
  const [idsText, setIdsText] = useState(USE_MOCK ? "2177906740" : "");
  const [appliedIds, setAppliedIds] = useState<number[]>([]);
  const { data, isLoading, error } = useTokoProductMappers(appliedIds);

  const ids = parseTokoPids(idsText);
  const hasSearched = appliedIds.length > 0;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (ids.length === 0) {
      toast.error("Informe ao menos um ID Tokopedia (toko_pid)");
      return;
    }
    setAppliedIds(ids);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <ArrowRightLeft className="h-4 w-4 text-primary" /> Consultar mapeamento
        </CardTitle>
        <p className="mt-0.5 text-xs text-muted-foreground">Get Toko Product Mappers (202606)</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="lookup-ids">IDs Tokopedia (toko_pid)</Label>
            <textarea
              id="lookup-ids"
              rows={3}
              className={textareaClass}
              placeholder="2177906740"
              value={idsText}
              onChange={(e) => setIdsText(e.target.value)}
              disabled={isLoading}
            />
            <p className="text-[11px] text-muted-foreground">
              Um ID por linha ou separados por vírgula — a API não tem um modo "listar tudo", é preciso informar
              os IDs. {ids.length > 0 && `${ids.length} ID(s) reconhecido(s).`}
            </p>
          </div>
          <Button type="submit" disabled={isLoading || ids.length === 0} className="gap-2">
            <ArrowRightLeft className="h-4 w-4" /> {isLoading ? "Consultando…" : "Consultar"}
          </Button>
        </form>

        {hasSearched && error && (
          <ErrorBanner text={`Não foi possível consultar o mapeamento: ${(error as Error).message}`} />
        )}

        {hasSearched && isLoading && (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        )}

        {hasSearched && !isLoading && !error && data && (
          <ResultPanel product={data.product ?? []} apiError={data.error} />
        )}
      </CardContent>
    </Card>
  );
}

// =============== Ferramenta 2: mapear produto V2 (POST, gated) ===============

function MapperV2Tool() {
  const mutation = useMapTokoProductV2();
  const [idsText, setIdsText] = useState(USE_MOCK ? "2177906740" : "");
  const mockNote = USE_MOCK ? " (simulado)" : "";
  const ids = parseTokoPids(idsText);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (ids.length === 0) {
      toast.error("Informe ao menos um ID Tokopedia (toko_pid)");
      return;
    }
    mutation.mutate(ids, {
      onSuccess: (result) => {
        const n = result.product?.length ?? 0;
        toast.success(n > 0 ? `${n} produto(s) mapeado(s)${mockNote}` : `Nenhum produto mapeado${mockNote}`);
      },
      onError: (err) => toast.error((err as Error).message),
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Wand2 className="h-4 w-4 text-primary" /> Mapear produto (V2)
        </CardTitle>
        <p className="mt-0.5 text-xs text-muted-foreground">Toko Product Mapper V2 (202607)</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="mapper-ids">IDs Tokopedia (toko_pid)</Label>
            <textarea
              id="mapper-ids"
              rows={3}
              className={textareaClass}
              placeholder="2177906740"
              value={idsText}
              onChange={(e) => setIdsText(e.target.value)}
              disabled={mutation.isPending}
            />
            <p className="text-[11px] text-muted-foreground">
              Um ID por linha ou separados por vírgula.{" "}
              {ids.length > 0 && `${ids.length} ID(s) reconhecido(s).`}
            </p>
          </div>
          <Button type="submit" disabled={mutation.isPending || ids.length === 0} className="gap-2">
            <Wand2 className="h-4 w-4" /> {mutation.isPending ? "Mapeando…" : "Mapear"}
          </Button>
        </form>

        {mutation.isError && (
          <ErrorBanner text={`Não foi possível mapear os produtos: ${(mutation.error as Error).message}`} />
        )}

        {mutation.data && (
          <ResultPanel
            product={mutation.data.product ?? []}
            apiError={mutation.data.error}
            onClear={() => mutation.reset()}
          />
        )}
      </CardContent>
    </Card>
  );
}

// =============== Resultado (compartilhado pelas duas ferramentas) ===============

function ResultPanel({
  product,
  apiError,
  onClear,
}: {
  product: MapperRow[];
  apiError?: MapperError;
  onClear?: () => void;
}) {
  return (
    <div className="animate-fade-in space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Resultado</h3>
        {onClear && (
          <Button size="sm" variant="ghost" className="gap-1.5" onClick={onClear}>
            <X className="h-3.5 w-3.5" /> Limpar
          </Button>
        )}
      </div>

      {apiError?.message && (
        <div className="flex items-start gap-2 rounded-lg border border-warning/30 bg-warning/10 p-3 text-xs">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-warning" />
          <span>
            <strong>Aviso retornado pela API</strong>
            {apiError.code != null && ` (código ${apiError.code})`}: {apiError.message}
          </span>
        </div>
      )}

      {product.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed py-10 text-center text-muted-foreground">
          <PackageSearch className="h-7 w-7" />
          <p className="text-sm">Nenhum mapeamento encontrado para os IDs informados.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-3 py-2 font-medium">ID Tokopedia (toko_pid)</th>
                <th className="px-3 py-2 font-medium">ID TikTok Shop (tts_pid)</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {product.map((p, i) => (
                <tr key={`${p.toko_pid ?? "row"}-${i}`}>
                  <td className="px-3 py-2.5 font-mono text-xs">{p.toko_pid ?? "—"}</td>
                  <td className="px-3 py-2.5 font-mono text-xs">{p.tts_pid ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
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
