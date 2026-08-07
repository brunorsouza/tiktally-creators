import { useState } from "react";
import { Plus, Pin, Trash2, Package, AlertCircle, Store, Percent } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useShowcaseProducts,
  useAddShowcaseProducts,
  useRemoveShowcaseProducts,
  useTopShowcaseProducts,
} from "@/hooks/useShowcase";
import { USE_MOCK } from "@/services/creatorClient";
import { formatCurrency } from "@/lib/formatters";
import type { GetShowcaseProductsData } from "@/types/creator-api.generated";

type Product = NonNullable<GetShowcaseProductsData["products"]>[number];
type Money = { minimum_amount?: string; maximum_amount?: string; currency?: string };

function fmtRange(p?: Money) {
  if (!p?.minimum_amount) return "—";
  const cur = p.currency || "BRL";
  const min = formatCurrency(parseFloat(p.minimum_amount), cur);
  if (!p.maximum_amount || p.maximum_amount === p.minimum_amount) return min;
  return `${min} – ${formatCurrency(parseFloat(p.maximum_amount), cur)}`;
}

function productImage(p: Product) {
  return p.main_images?.[0]?.url || p.addition?.customized_main_images?.[0]?.url || "";
}

function ProductImage({ src, alt }: { src?: string; alt?: string }) {
  const [err, setErr] = useState(false);
  if (!src || err) return <Package className="h-10 w-10 text-muted-foreground" />;
  return <img src={src} alt={alt ?? ""} onError={() => setErr(true)} className="h-full w-full object-cover" />;
}

export default function VitrinePage() {
  const { data, isLoading, error } = useShowcaseProducts();
  const add = useAddShowcaseProducts();
  const remove = useRemoveShowcaseProducts();
  const top = useTopShowcaseProducts();
  const [newId, setNewId] = useState("");

  const products = data?.products ?? [];
  const busy = add.isPending || remove.isPending || top.isPending;
  const mockNote = USE_MOCK ? " (simulado no mock)" : "";

  const handleAdd = () => {
    const id = newId.trim();
    if (!id) return;
    add.mutate(
      { add_type: "PRODUCT_ID", product_ids: [id] },
      {
        onSuccess: () => {
          toast.success(`Produto ${id} adicionado à vitrine${mockNote}`);
          setNewId("");
        },
        onError: (e) => toast.error((e as Error).message),
      }
    );
  };

  const handleTop = (p: Product) =>
    top.mutate(
      { product_ids: [p.id] },
      {
        onSuccess: () => toast.success(`"${p.title ?? p.id}" fixado no topo${mockNote}`),
        onError: (e) => toast.error((e as Error).message),
      }
    );

  const handleRemove = (p: Product) =>
    remove.mutate(
      { product_ids: [p.id] },
      {
        onSuccess: () => toast.success(`"${p.title ?? p.id}" removido da vitrine${mockNote}`),
        onError: (e) => toast.error((e as Error).message),
      }
    );

  return (
    <div className="space-y-gap">
      <PageHeader title="Vitrine" subtitle={<>Produtos que você promove na sua vitrine {data?.total_count != null ? ` · ${data.total_count} no total` : ""}.</>} />

      {/* Adicionar por ID */}
      <Card>
        <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
          <Input
            placeholder="ID do produto para adicionar…"
            value={newId}
            onChange={(e) => setNewId(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            className="sm:max-w-xs"
          />
          <Button onClick={handleAdd} disabled={!newId.trim() || add.isPending} className="gap-2">
            <Plus className="h-4 w-4" /> Adicionar à vitrine
          </Button>
        </CardContent>
      </Card>

      {error && (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="flex items-center gap-3 p-5 text-sm">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <span>Não foi possível carregar a vitrine: {(error as Error).message}</span>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-72 w-full rounded-xl" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-16 text-center text-muted-foreground">
            <Package className="h-8 w-8" />
            <p className="text-sm">Nenhum produto na vitrine.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p, i) => {
            const img = productImage(p);
            const price = p.price?.seller_discount_price ?? p.price?.original_price;
            return (
              <Card key={p.id ?? i} className="animate-fade-in overflow-hidden">
                <div className="relative flex h-40 items-center justify-center bg-muted">
                  <ProductImage src={img} alt={p.title} />
                  {p.status?.is_hidden && (
                    <Badge variant="secondary" className="absolute left-2 top-2">Oculto</Badge>
                  )}
                  <Badge
                    variant={p.status?.inventory_status === "IN_STOCK" ? "success" : "destructive"}
                    className="absolute right-2 top-2"
                  >
                    {p.status?.inventory_status === "IN_STOCK" ? "Em estoque" : "Esgotado"}
                  </Badge>
                </div>
                <CardContent className="space-y-3 p-4">
                  <p className="line-clamp-2 min-h-[2.5rem] text-sm font-medium">{p.title ?? `Produto ${p.id}`}</p>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Store className="h-3.5 w-3.5" />
                    <span className="truncate">{p.shop?.name ?? "—"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{fmtRange(price)}</span>
                    {p.commission?.rate != null && (
                      <Badge variant="outline" className="gap-1">
                        <Percent className="h-3 w-3" />
                        {(p.commission.rate / 100).toFixed(2)}%
                      </Badge>
                    )}
                  </div>
                  <div className="flex gap-2 pt-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 gap-1"
                      disabled={busy}
                      onClick={() => handleTop(p)}
                    >
                      <Pin className="h-3.5 w-3.5" /> Topo
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1 text-destructive hover:bg-destructive/10 hover:text-destructive"
                      disabled={busy}
                      onClick={() => handleRemove(p)}
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Remover
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
