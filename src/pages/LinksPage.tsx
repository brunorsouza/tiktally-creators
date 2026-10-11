import { useState, type FormEvent } from "react";
import { Link2, Copy, ExternalLink, AlertCircle, ShieldAlert, Send, Users, Globe, X } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useGenerateGeneralLink, useGeneratePublisherLink, type GenerateLinkInput } from "@/hooks/useLinks";
import { USE_MOCK } from "@/services/creatorClient";

/** Link único gerado por qualquer um dos dois endpoints — `material_id` diverge de tipo
 *  entre eles (string no geral, number no de publisher), então aceitamos os dois aqui. */
interface SharingLinkRow {
  material_id?: string | number;
  sharing_link?: string;
  deep_link?: string;
  one_link?: string;
}

interface FailedMaterialRow {
  material_id?: string;
  fail_reason?: string;
}


/** Aceita IDs separados por vírgula, ponto-e-vírgula ou quebra de linha; remove duplicatas
 *  e respeita o limite de 50 da API. */
function parseIds(raw: string): string[] {
  const ids = raw
    .split(/[\n,;]+/)
    .map((s) => s.trim())
    .filter(Boolean);
  return Array.from(new Set(ids)).slice(0, 50);
}

async function copyLink(value: string, label: string) {
  try {
    await navigator.clipboard.writeText(value);
    toast.success(`${label} copiado para a área de transferência`);
  } catch {
    toast.error("Não foi possível copiar — copie manualmente");
  }
}

const textareaClass =
  "flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm leading-snug ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

type Mode = "general" | "publisher";

export default function LinksPage() {
  const [mode, setMode] = useState<Mode>("general");

  return (
    <div className="space-y-gap">
      <PageHeader title="Links de afiliado" subtitle="Crie links de produtos para divulgar onde quiser. As vendas por esses links contam como suas." />

      {!USE_MOCK && (
        <Card className="border-warning/30 bg-warning/10">
          <CardContent className="flex items-start gap-3 p-4 text-sm">
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
            <div className="space-y-1">
              <p className="font-medium">A geração de links pode ainda não estar liberada</p>
              <p className="text-muted-foreground">
                O TikTok ainda está liberando essa permissão para o TikTally. Se o link não for gerado, reconecte sua
                conta em Conta → Conexão quando a liberação for anunciada.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="flex flex-wrap gap-2 p-4">
          <Button variant={mode === "general" ? "toggle-on" : "toggle"} onClick={() => setMode("general")} className="gap-2">
            <Send className="h-4 w-4" /> Link geral
          </Button>
          <Button variant={mode === "publisher" ? "toggle-on" : "toggle"} onClick={() => setMode("publisher")} className="gap-2">
            <Users className="h-4 w-4" /> Link para parceiro
          </Button>
        </CardContent>
      </Card>

      {mode === "general" ? <GeneralLinkTool /> : <PublisherLinkTool />}
    </div>
  );
}

// =============== Ferramenta 1: Link geral ===============

function GeneralLinkTool() {
  const mutation = useGenerateGeneralLink();
  const [idsText, setIdsText] = useState(USE_MOCK ? "7362840009596339971, 7362840009596339923" : "");
  const [campaignId, setCampaignId] = useState("");
  const [tokoLink, setTokoLink] = useState(false);

  const mockNote = USE_MOCK ? " (simulado)" : "";
  const ids = parseIds(idsText);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (ids.length === 0) {
      toast.error("Informe ao menos um ID de produto");
      return;
    }
    const input: GenerateLinkInput = {
      productIds: ids,
      campaignId: campaignId.trim() || undefined,
      linkType: tokoLink ? "TOKO" : undefined,
    };
    mutation.mutate(input, {
      onSuccess: (data) => {
        const n = data.sharing_links?.length ?? 0;
        toast.success(n > 0 ? `${n} ${n === 1 ? "link gerado" : "links gerados"}${mockNote}` : `Nenhum link gerado${mockNote}`);
      },
      onError: (err) => toast.error((err as Error).message),
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Gerar link geral</CardTitle>
          <p className="mt-0.5 text-xs text-muted-foreground">Um link por produto, para usar em qualquer lugar.</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="general-ids">IDs de produto</Label>
              <textarea
                id="general-ids"
                rows={3}
                className={textareaClass}
                placeholder="7362840009596339971, 7362840009596339923"
                value={idsText}
                onChange={(e) => setIdsText(e.target.value)}
                disabled={mutation.isPending}
              />
              <p className="text-[11px] text-muted-foreground">
                Um ID por linha ou separados por vírgula, até 50 produtos.{" "}
                {ids.length > 0 && `${ids.length} ${ids.length === 1 ? "produto reconhecido" : "produtos reconhecidos"}.`}
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
              <div className="space-y-1.5">
                <Label htmlFor="general-campaign">ID da campanha (opcional)</Label>
                <Input
                  id="general-campaign"
                  placeholder="7332840009596339923"
                  value={campaignId}
                  onChange={(e) => setCampaignId(e.target.value)}
                  disabled={mutation.isPending}
                />
              </div>
              <Button
                type="button"
                variant={tokoLink ? "toggle-on" : "toggle"}
                onClick={() => setTokoLink((v) => !v)}
                disabled={mutation.isPending}
                className="gap-2"
              >
                <Globe className="h-4 w-4" /> Link Tokopedia (só Indonésia)
              </Button>
            </div>

            <Button type="submit" disabled={mutation.isPending || ids.length === 0} className="w-full gap-2 sm:w-auto">
              <Link2 className="h-4 w-4" /> {mutation.isPending ? "Gerando…" : "Gerar link"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {mutation.isError && (
        <ErrorBanner text={`Não foi possível gerar o link: ${(mutation.error as Error).message}`} />
      )}

      {mutation.data && (
        <LinkResults
          sharingLinks={mutation.data.sharing_links ?? []}
          failedMaterials={mutation.data.failed_materials ?? []}
          onClear={() => mutation.reset()}
        />
      )}
    </div>
  );
}

// =============== Ferramenta 2: Link de publisher ===============

function PublisherLinkTool() {
  const mutation = useGeneratePublisherLink();
  const [publisherId, setPublisherId] = useState(USE_MOCK ? "CJ-PUBLISHER-001" : "");
  const [idsText, setIdsText] = useState(USE_MOCK ? "7362840009596339971, 7362840009596339923" : "");
  const [campaignId, setCampaignId] = useState("");
  const [tokoLink, setTokoLink] = useState(false);

  const mockNote = USE_MOCK ? " (simulado)" : "";
  const ids = parseIds(idsText);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!publisherId.trim()) {
      toast.error("Informe o ID do parceiro");
      return;
    }
    if (ids.length === 0) {
      toast.error("Informe ao menos um ID de produto");
      return;
    }
    mutation.mutate(
      {
        publisherId: publisherId.trim(),
        productIds: ids,
        campaignId: campaignId.trim() || undefined,
        linkType: tokoLink ? "TOKO" : undefined,
      },
      {
        onSuccess: (data) => {
          const n = data.sharing_links?.length ?? 0;
          toast.success(n > 0 ? `${n} ${n === 1 ? "link gerado" : "links gerados"} para o parceiro${mockNote}` : `Nenhum link gerado${mockNote}`);
        },
        onError: (err) => toast.error((err as Error).message),
      }
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Gerar link para parceiro</CardTitle>
          <p className="mt-0.5 text-xs text-muted-foreground">Links ligados a um parceiro de afiliados (site, cupom ou rede) que você usa.</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="publisher-id">ID do parceiro</Label>
              <Input
                id="publisher-id"
                placeholder="CJ-PUBLISHER-001"
                value={publisherId}
                onChange={(e) => setPublisherId(e.target.value)}
                disabled={mutation.isPending}
              />
              <p className="text-[11px] text-muted-foreground">
                Código que identifica o parceiro de afiliados (publisher) onde o link será usado.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="publisher-ids">IDs de produto</Label>
              <textarea
                id="publisher-ids"
                rows={3}
                className={textareaClass}
                placeholder="7362840009596339971, 7362840009596339923"
                value={idsText}
                onChange={(e) => setIdsText(e.target.value)}
                disabled={mutation.isPending}
              />
              <p className="text-[11px] text-muted-foreground">
                Um ID por linha ou separados por vírgula, até 50 produtos.{" "}
                {ids.length > 0 && `${ids.length} ${ids.length === 1 ? "produto reconhecido" : "produtos reconhecidos"}.`}
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
              <div className="space-y-1.5">
                <Label htmlFor="publisher-campaign">ID da campanha (opcional)</Label>
                <Input
                  id="publisher-campaign"
                  placeholder="7432840009596339923"
                  value={campaignId}
                  onChange={(e) => setCampaignId(e.target.value)}
                  disabled={mutation.isPending}
                />
              </div>
              <Button
                type="button"
                variant={tokoLink ? "toggle-on" : "toggle"}
                onClick={() => setTokoLink((v) => !v)}
                disabled={mutation.isPending}
                className="gap-2"
              >
                <Globe className="h-4 w-4" /> Link Tokopedia (só Indonésia)
              </Button>
            </div>

            <Button
              type="submit"
              disabled={mutation.isPending || !publisherId.trim() || ids.length === 0}
              className="w-full gap-2 sm:w-auto"
            >
              <Link2 className="h-4 w-4" /> {mutation.isPending ? "Gerando…" : "Gerar link"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {mutation.isError && (
        <ErrorBanner text={`Não foi possível gerar o link: ${(mutation.error as Error).message}`} />
      )}

      {mutation.data && (
        <LinkResults
          sharingLinks={mutation.data.sharing_links ?? []}
          failedMaterials={mutation.data.failed_materials ?? []}
          onClear={() => mutation.reset()}
        />
      )}
    </div>
  );
}

// =============== Resultado (compartilhado pelas duas ferramentas) ===============

function LinkResults({
  sharingLinks,
  failedMaterials,
  onClear,
}: {
  sharingLinks: SharingLinkRow[];
  failedMaterials: FailedMaterialRow[];
  onClear: () => void;
}) {
  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-muted-foreground">Resultado</h2>
        <Button size="sm" variant="ghost" className="gap-1.5" onClick={onClear}>
          <X className="h-3.5 w-3.5" /> Limpar
        </Button>
      </div>

      {failedMaterials.length > 0 && (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="space-y-2 p-4 text-sm">
            <p className="flex items-center gap-2 font-medium text-destructive">
              <AlertCircle className="h-4 w-4" />
              {failedMaterials.length} produto(s) não geraram link
            </p>
            <ul className="space-y-1 text-xs text-muted-foreground">
              {failedMaterials.map((f, i) => (
                <li key={f.material_id ?? i}>
                  <span className="font-medium text-foreground">{f.material_id ?? "—"}:</span>{" "}
                  {f.fail_reason ?? "Motivo não informado"}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {sharingLinks.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-12 text-center text-muted-foreground">
            <Link2 className="h-8 w-8" />
            <p className="text-sm">Nenhum link foi gerado com sucesso.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {sharingLinks.map((link, i) => (
            <LinkResultCard key={link.material_id ?? i} link={link} />
          ))}
        </div>
      )}
    </div>
  );
}

function LinkResultCard({ link }: { link: SharingLinkRow }) {
  return (
    <Card>
      <CardContent className="space-y-3 p-4">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Link2 className="h-4 w-4 text-primary" />
          Produto {link.material_id ?? "—"}
        </div>
        <CopyField label="Link de compartilhamento" value={link.sharing_link} openable />
        <CopyField label="Link direto do produto" value={link.deep_link} />
        <CopyField label="Link único (one-link)" value={link.one_link} />
        {!link.sharing_link && !link.deep_link && !link.one_link && (
          <p className="text-xs text-muted-foreground">Nenhum link retornado para este produto.</p>
        )}
      </CardContent>
    </Card>
  );
}

function CopyField({ label, value, openable }: { label: string; value?: string; openable?: boolean }) {
  if (!value) return null;
  return (
    <div className="space-y-1">
      <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <div className="flex items-center gap-1 rounded-lg border bg-muted/30 p-1.5 pl-2.5">
        <p className="min-w-0 flex-1 truncate text-xs">{value}</p>
        {openable && (
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7 shrink-0"
            aria-label="Abrir link em nova aba"
            onClick={() => window.open(value, "_blank", "noopener,noreferrer")}
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </Button>
        )}
        <Button
          size="sm"
          variant="ghost"
          className="h-7 shrink-0 gap-1 px-2"
          onClick={() => copyLink(value, label)}
        >
          <Copy className="h-3.5 w-3.5" /> Copiar
        </Button>
      </div>
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
