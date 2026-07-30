import { ShieldCheck, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/brand/Logo";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * Conexão da conta de creator do TikTok Shop (OAuth `user_type=1`).
 *
 * Fluxo (a implementar na fase 1):
 * 1. Redireciona pro authorize da TikTok (services.tiktokshop.com/open/authorize)
 *    com o service_id do app e state = user.id.
 * 2. TikTok volta em /auth/callback?code=... (ver AuthCallbackPage).
 * 3. Edge fn `creator-token-exchange` troca o code por creator access_token e
 *    grava em `creator_tokens`.
 *
 * IMPORTANTE (bloqueador conhecido): confirmar no Partner Center que o app tem
 * os escopos `creator.*` e disponibilidade BR liberados. Ver docs/SETUP.md.
 */
function buildAuthorizeUrl(): string {
  const serviceId = import.meta.env.VITE_TIKTOK_SERVICE_ID;
  const state = encodeURIComponent(window.crypto.randomUUID());
  sessionStorage.setItem("tt_oauth_state", state);
  // Endpoint de authorize do TikTok Shop; ajustar conforme o app (creator scope).
  return `https://services.tiktokshop.com/open/authorize?service_id=${serviceId}&state=${state}`;
}

export default function ConnectPage() {
  const canConnect = !!import.meta.env.VITE_TIKTOK_SERVICE_ID;

  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <Card className="w-full max-w-md text-center">
        <CardHeader className="items-center">
          <div className="mb-2 flex h-14 w-14 items-center justify-center rounded-2xl border bg-gradient-card shadow-premium">
            <Logo size={34} />
          </div>
          <CardTitle>Conecte sua conta de creator</CardTitle>
          <CardDescription>
            Autorize o TikTally Creator a ler suas comissões e a performance dos seus vídeos e lives.
            Só leitura — nada é publicado sem você pedir.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-3 text-left text-sm text-muted-foreground">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-success" />
            <span>
              A conexão usa o login oficial do TikTok Shop. Seu token fica seguro no servidor e
              nunca no navegador.
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
              Configure <code>VITE_TIKTOK_SERVICE_ID</code> no .env para habilitar a conexão.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
