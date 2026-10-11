import { LucideIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string;
  icon?: LucideIcon;
  hint?: string;
  loading?: boolean;
  accent?: "primary" | "success" | "info" | "warning";
  /** Variação no período, ex.: "+18%". `up` pinta de verde; senão fica neutro. */
  delta?: string;
  up?: boolean;
  /** Contexto da variação, ex.: "vs. semana anterior". */
  deltaLabel?: string;
}

/** O quadrado tintado marca a cor pelo ícone e pela borda — nunca por fundo cheio. */
const ACCENT: Record<string, string> = {
  primary: "text-primary",
  success: "text-success",
  info: "text-info",
  warning: "text-warning",
};

/**
 * KPI do DS: ícone tintado + rótulo, número grande no display face, e a
 * variação como chip. As medidas (34px de ícone, 30px de número, -1px de
 * tracking) são do design — mexer nelas descaracteriza o cartão.
 */
export function StatCard({
  label,
  value,
  icon: Icon,
  hint,
  loading,
  accent = "primary",
  delta,
  up,
  deltaLabel,
}: StatCardProps) {
  return (
    <div className="tile animate-fade-in">
      <div className="flex items-center gap-[9px]">
        {Icon && (
          <span className={cn("tint", ACCENT[accent])}>
            <Icon className="h-[19px] w-[19px] stroke-[1.6]" />
          </span>
        )}
        <p className="min-w-0 text-[13.5px] font-semibold text-muted-foreground">{label}</p>
      </div>

      {loading ? (
        <Skeleton className="mt-3.5 h-[30px] w-32" />
      ) : (
        <p className="num mt-3.5 text-[30px] font-extrabold leading-none tracking-[-1px] [overflow-wrap:anywhere]">
          {value}
        </p>
      )}

      {!loading && (delta || hint || deltaLabel) && (
        <div className="mt-[11px] flex flex-wrap items-center gap-2">
          {delta && (
            <span
              className={cn(
                "rounded-[8px] px-2 py-[3px] text-[12.5px] font-bold",
                up ? "bg-success/[.08] text-success" : "bg-secondary text-faint"
              )}
            >
              {delta}
            </span>
          )}
          {(deltaLabel || hint) && (
            <span className="text-[12.5px] leading-snug text-faint">{deltaLabel ?? hint}</span>
          )}
        </div>
      )}
    </div>
  );
}
