import { useState } from "react";
import {
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  LogOut,
  RefreshCw,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Logo } from "@/components/brand/Logo";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  useCreatorConnection,
  useDisconnectCreator,
  type CreatorConnectionStatus,
} from "@/hooks/useCreatorConnection";
import { useCreatorProfile } from "@/hooks/useCreatorProfile";

/**
 * Conexão da conta de CREATOR do TikTok Shop (OAuth `user_type=1`).
 *
 * ⚠️ Creator ≠ Seller. A doc oficial ("Get Access Token") define domínios
 * diferentes por tipo:
 *   - Seller:  https://services.tiktokshop.com/open/authorize?service_id=...
 *   - Partner: https://partner.tiktokshop.com/open/authorize?service_id=...
 *   - Creator: https://shop.tiktok.com/alliance/creator/auth?app_key=...&state=...
 * O link de creator usa **app_key** (não service_id) e outro domínio. Se cair no
 * services.tiktokshop.com, aparece o login do VENDEDOR — não é o que queremos.
 *
 * Fluxo: creator aprova o link → TikTok volta no redirect registrado do app
 * (?code=...) → edge `account-connect` troca por access_token (deve vir
 * user_type=1) e grava em `creator_tokens`.
 *
 * A página é CIENTE do estado: se já existe token pro usuário logado, mostra o
 * cartão "conectado" (com desconectar/reconectar); senão, o convite de conexão.
 */

/** Escopo novo (ativado em 25/08) que destrava a comissão exata (Trace Orders). */
const SHARE_LINK_SCOPE = "creator.affiliate.share_link.read";

function buildAuthorizeUrl(): string {
  const appKey = import.meta.env.VITE_TIKTOK_APP_KEY;
  const state = encodeURIComponent(window.crypto.randomUUID());
  sessionStorage.setItem("tt_oauth_state", state);
  // Fluxo de CREATOR (user_type=1) — domínio e param específicos.
  return `https://shop.tiktok.com/alliance/creator/auth?app_key=${appKey}&state=${state}`;
}

function fmtDate(iso?: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <Card className="w-full max-w-md">{children}</Card>
    </div>
  );
}

/** Estado 1: carregando o status da conexão. */
function LoadingCard() {
  return (
    <PageShell>
      <CardContent className="flex min-h-[220px] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </CardContent>
    </PageShell>
  );
}

/** Estado 2: NÃO conectado — convite de conexão. */
function ConnectCta() {
  const canConnect = !!import.meta.env.VITE_TIKTOK_APP_KEY;
  return (
    <PageShell>
      <CardHeader className="items-center text-center">
        <div className="mb-2 flex h-14 w-14 items-center justify-center rounded-2xl border bg-gradient-card shadow-premium">
          <Logo size={34} />
        </div>
        <CardTitle className="text-[22px]">Conecte sua conta de creator</CardTitle>
        <CardDescription className="leading-relaxed">
          Autorize o TikTally Creator a ler suas comissões e a performance dos seus vídeos e lives.
          Só leitura — nada é publicado sem você pedir.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-3 text-left text-sm text-muted-foreground">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-success" />
          <span className="leading-relaxed">
            A conexão usa o login oficial do TikTok Shop. Seu token fica seguro no servidor e nunca
            no navegador.
          </span>
        </div>
        <Button
          className="w-full gap-2"
          disabled={!canConnect}
          onClick={() => canConnect && (window.location.href = buildAuthorizeUrl())}
        >
          Conectar TikTok <ArrowRight className="h-4 w-4" />
        </Button>
        {!canConnect && (
          <p className="text-xs text-warning">
            Configure <code>VITE_TIKTOK_APP_KEY</code> no .env para habilitar a conexão.
          </p>
        )}
      </CardContent>
    </PageShell>
  );
}

/** Uma linha rótulo → valor do resumo da conexão. */
function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{children}</span>
    </div>
  );
}

/** Estado 3: conectado — mostra a conta e permite desconectar/reconectar. */
function ConnectedCard({ status }: { status: CreatorConnectionStatus }) {
  const profile = useCreatorProfile();
  const disconnect = useDisconnectCreator();
  const [confirming, setConfirming] = useState(false);
  const canConnect = !!import.meta.env.VITE_TIKTOK_APP_KEY;

  const username = profile.data?.username;
  const avatarUrl = profile.data?.avatar?.url;
  const region = profile.data?.register_region || profile.data?.selection_region || status.region;
  const scopes = status.scopes ?? [];
  const hasShareLink = scopes.includes(SHARE_LINK_SCOPE);
  const expiresFmt = fmtDate(status.expires_at);

  const handleDisconnect = () => {
    disconnect.mutate(undefined, {
      onSuccess: () => {
        toast.success("Conta desconectada.");
        setConfirming(false);
      },
      onError: (e) => toast.error(e instanceof Error ? e.message : "Falha ao desconectar."),
    });
  };

  return (
    <PageShell>
      <CardHeader className="items-center text-center">
        <div className="relative mb-2">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={username || "avatar do creator"}
              className="h-16 w-16 rounded-full border object-cover shadow-premium"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full border bg-gradient-card shadow-premium">
              <Logo size={32} />
            </div>
          )}
          <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-background">
            <CheckCircle2 className="h-6 w-6 text-success" />
          </span>
        </div>
        <CardTitle className="flex items-center gap-2 text-[20px]">
          {profile.isLoading ? "Conta conectada" : username ? `@${username}` : "Conta conectada"}
        </CardTitle>
        <Badge
          variant="outline"
          className="mt-1 gap-1 border-success/40 bg-success/10 text-success"
        >
          <CheckCircle2 className="h-3.5 w-3.5" /> Conectado
        </Badge>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="divide-y rounded-lg border px-3">
          {region && <InfoRow label="Região">{region}</InfoRow>}
          <InfoRow label="Escopos autorizados">{scopes.length}</InfoRow>
          {expiresFmt && (
            <InfoRow label="Token expira em">
              {/* Vencido mas renovável não é problema do creator: o servidor
                  troca o token no próximo uso. Vermelho só quando a autorização
                  em si morreu e não há renovação possível. */}
              <span className={status.needs_reauth ? "text-destructive" : undefined}>
                {status.expired && !status.needs_reauth ? "renova automaticamente" : expiresFmt}
              </span>
            </InfoRow>
          )}
          {status.creator_open_id && (
            <InfoRow label="Open ID">
              <code className="text-xs text-muted-foreground">
                {status.creator_open_id.slice(0, 10)}…
              </code>
            </InfoRow>
          )}
        </div>

        {/* Autorização morta → só um novo OAuth resolve */}
        {status.needs_reauth && (
          <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-left text-sm text-destructive">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              A autorização desta conta expirou. Reconecte para voltar a carregar seus dados.
            </span>
          </div>
        )}

        {/* Escopo novo ausente → reconectar habilita comissão exata */}
        {!hasShareLink && !status.needs_reauth && (
          <div className="flex items-start gap-2 rounded-lg border border-warning/30 bg-warning/5 p-3 text-left text-sm text-warning-foreground">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
            <span className="leading-relaxed text-muted-foreground">
              Falta o escopo <code className="text-foreground">share_link.read</code>. Reconecte para
              habilitar a <strong className="text-foreground">comissão exata em R$</strong> (Trace
              Orders) e a geração de links.
            </span>
          </div>
        )}

        {/* Ações */}
        {confirming ? (
          <div className="space-y-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3">
            <p className="text-sm font-medium">Desconectar esta conta?</p>
            <p className="text-xs text-muted-foreground">
              O token é removido do servidor. Seus dados deixam de carregar até você reconectar.
            </p>
            <div className="flex gap-2 pt-1">
              <Button
                variant="destructive"
                size="sm"
                className="flex-1 gap-2"
                disabled={disconnect.isPending}
                onClick={handleDisconnect}
              >
                {disconnect.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <LogOut className="h-4 w-4" />
                )}
                Sim, desconectar
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                disabled={disconnect.isPending}
                onClick={() => setConfirming(false)}
              >
                Cancelar
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1 gap-2"
              disabled={!canConnect}
              onClick={() => canConnect && (window.location.href = buildAuthorizeUrl())}
            >
              <RefreshCw className="h-4 w-4" /> Reconectar
            </Button>
            <Button
              variant="outline"
              className="flex-1 gap-2 border-destructive/30 text-destructive hover:bg-destructive/5 hover:text-destructive"
              onClick={() => setConfirming(true)}
            >
              <LogOut className="h-4 w-4" /> Desconectar
            </Button>
          </div>
        )}
      </CardContent>
    </PageShell>
  );
}

export default function ConnectPage() {
  const conn = useCreatorConnection();

  if (conn.isLoading) return <LoadingCard />;
  if (conn.data?.connected) return <ConnectedCard status={conn.data} />;
  return <ConnectCta />;
}
