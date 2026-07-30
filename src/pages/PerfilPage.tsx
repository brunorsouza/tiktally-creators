import { useState } from "react";
import { MapPin, ShieldCheck, BadgeCheck, Store, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useCreatorProfile } from "@/hooks/useCreatorProfile";
import { USE_MOCK } from "@/services/creatorClient";

const PERM_LABELS: Record<string, string> = {
  LIVE_STREAM_PERMISSION: "Live",
  SELF_SALE_PERMISSION: "Venda própria",
  ADD_AFFILIATE_PERMISSION: "Afiliado",
  PHOTO_SHOPPABLE_PERMISSION_PRODUCT: "Foto shoppable (produto)",
  PHOTO_SHOPPABLE_PERMISSION_SHOP: "Foto shoppable (loja)",
};

const USER_TYPE_LABELS: Record<string, string> = {
  TIKTOK_SHOP_OFFICIAL_ACCOUNT: "Conta oficial",
  TIKTOK_MARKETING_ACCOUNT: "Conta de marketing",
  TIKTOK_SHOP_CREATOR: "Creator TikTok Shop",
};

export default function PerfilPage() {
  const { data: profile, isLoading, error } = useCreatorProfile();

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="animate-slide-up">
          <h1 className="text-2xl font-bold tracking-tight">Perfil do creator</h1>
          <p className="text-muted-foreground">Identidade e permissões da sua conta no TikTok Shop.</p>
        </div>
        <Badge variant={USE_MOCK ? "warning" : "success"} className="mt-1 shrink-0">
          {USE_MOCK ? "Mock" : "Live"}
        </Badge>
      </header>

      {error && (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="flex items-center gap-3 p-5 text-sm">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <span>Não foi possível carregar o perfil: {(error as Error).message}</span>
          </CardContent>
        </Card>
      )}

      <Card className="animate-fade-in overflow-hidden">
        <div className="h-20 bg-gradient-primary" />
        <CardContent className="p-6">
          <div className="-mt-14 flex flex-col gap-4 sm:flex-row sm:items-end">
            {isLoading ? (
              <Skeleton className="h-24 w-24 rounded-2xl" />
            ) : (
              <Avatar url={profile?.avatar?.url} name={profile?.username} />
            )}
            <div className="min-w-0 flex-1">
              {isLoading ? (
                <Skeleton className="h-7 w-40" />
              ) : (
                <h2 className="truncate text-xl font-bold">@{profile?.username ?? "—"}</h2>
              )}
              <div className="mt-1 flex flex-wrap items-center gap-2">
                {profile?.user_type && (
                  <Badge variant="secondary" className="gap-1">
                    <BadgeCheck className="h-3.5 w-3.5" />
                    {USER_TYPE_LABELS[profile.user_type] ?? profile.user_type}
                  </Badge>
                )}
                {profile?.seller_type && (
                  <Badge variant="outline" className="gap-1">
                    <Store className="h-3.5 w-3.5" />
                    {profile.seller_type}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <InfoRow icon={MapPin} label="Região de atuação" value={profile?.selection_region} loading={isLoading} />
            <InfoRow icon={MapPin} label="Região de registro" value={profile?.register_region} loading={isLoading} />
          </div>

          <div className="mt-6">
            <p className="mb-2 flex items-center gap-2 text-sm font-medium">
              <ShieldCheck className="h-4 w-4 text-primary" /> Permissões
            </p>
            {isLoading ? (
              <div className="flex gap-2">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-6 w-20" />
              </div>
            ) : profile?.permissions?.length ? (
              <div className="flex flex-wrap gap-2">
                {profile.permissions.map((p) => (
                  <Badge key={p} variant="success" className="font-normal">
                    {PERM_LABELS[p] ?? p}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Nenhuma permissão informada.</p>
            )}
          </div>

          <div className="mt-6 border-t pt-4">
            <p className="text-xs text-muted-foreground">Creator Open ID</p>
            {isLoading ? (
              <Skeleton className="mt-1 h-4 w-64" />
            ) : (
              <code className="break-all text-xs">{profile?.creator_user_open_id ?? "—"}</code>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Avatar({ url, name }: { url?: string; name?: string }) {
  const [err, setErr] = useState(false);
  const initial = (name?.[0] ?? "?").toUpperCase();
  return (
    <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl border-4 border-card bg-muted text-3xl font-bold text-muted-foreground shadow-lg">
      {url && !err ? (
        <img src={url} alt={name ?? "avatar"} onError={() => setErr(true)} className="h-full w-full object-cover" />
      ) : (
        initial
      )}
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
  loading,
}: {
  icon: typeof MapPin;
  label: string;
  value?: string;
  loading?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border bg-muted/30 p-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        {loading ? <Skeleton className="mt-1 h-4 w-16" /> : <p className="font-medium">{value ?? "—"}</p>}
      </div>
    </div>
  );
}
