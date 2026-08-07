import { ShieldCheck, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/brand/Logo";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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
 * (?code=...) → edge `creator-token-exchange` troca por access_token (deve vir
 * user_type=1) e grava em `creator_tokens`.
 */
function buildAuthorizeUrl(): string {
  const appKey = import.meta.env.VITE_TIKTOK_APP_KEY;
  const state = encodeURIComponent(window.crypto.randomUUID());
  sessionStorage.setItem("tt_oauth_state", state);
  // Fluxo de CREATOR (user_type=1) — domínio e param específicos.
  return `https://shop.tiktok.com/alliance/creator/auth?app_key=${appKey}&state=${state}`;
}

export default function ConnectPage() {
  const canConnect = !!import.meta.env.VITE_TIKTOK_APP_KEY;

  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <Card className="w-full max-w-md text-center">
        <CardHeader className="items-center">
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
              Configure <code>VITE_TIKTOK_APP_KEY</code> no .env para habilitar a conexão.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
