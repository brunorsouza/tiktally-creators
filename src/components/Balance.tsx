import { ReactNode } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface BalanceProps {
  /** Rótulo do número grande, ex.: "Comissão liquidada · outubro". */
  label: string;
  /** O número que manda na tela — já formatado. */
  value: string;
  /** Total do período, para contexto abaixo da barra. */
  total?: string;
  /** Parte ainda não liquidada. */
  pending?: string;
  /** Fração liquidada do total, 0–1. Dita a barra. */
  share?: number;
  loading?: boolean;
  /** Ações — rotas que já existem. Nada de botão que não faz nada. */
  actions?: ReactNode;
}

/**
 * A abertura do Painel.
 *
 * Lidera com o que já é do creator (comissão liquidada), não com o total do
 * período: o total é a promessa, o liquidado é o fato. O resto — total e o que
 * ainda está preso no prazo de devolução — fica logo abaixo, porque a segunda
 * pergunta de quem abre o app é sempre "e o resto, quando cai?".
 *
 * Sem moldura de cartão de propósito. O número abre a página direto sobre o
 * fundo; caixa em volta do número principal o rebaixa a mais um KPI.
 */
export function Balance({
  label,
  value,
  total,
  pending,
  share,
  loading,
  actions,
}: BalanceProps) {
  const pct = Math.min(Math.max(share ?? 0, 0), 1) * 100;

  return (
    <section className="animate-fade-in">
      <p className="text-xs font-bold uppercase tracking-[0.9px] text-faint">{label}</p>

      {loading ? (
        <Skeleton className="mt-3 h-[66px] w-72" />
      ) : (
        <p className="num mt-2.5 font-display text-[clamp(44px,7vw,76px)] font-extrabold leading-[0.9] tracking-[-3px] [overflow-wrap:anywhere]">
          {value}
        </p>
      )}

      {!loading && share !== undefined && (
        <div
          className="mt-5 h-2 w-full max-w-[520px] overflow-hidden rounded-full bg-secondary"
          role="img"
          aria-label={`${pct.toFixed(0)}% da comissão do período já liquidada`}
        >
          <div className="h-full rounded-full bg-success" style={{ width: `${pct}%` }} />
        </div>
      )}

      {!loading && (total || pending) && (
        <p className="mt-3 max-w-[560px] text-[14.5px] leading-[1.5] text-muted-foreground">
          {total && (
            <>
              de <strong className="num font-semibold text-foreground">{total}</strong> em comissão
              no período
            </>
          )}
          {total && pending && " · "}
          {pending && (
            <>
              <strong className="num font-semibold text-foreground">{pending}</strong> ainda no prazo
              de devolução
            </>
          )}
        </p>
      )}

      {actions && <div className="mt-6 flex flex-wrap gap-2.5">{actions}</div>}
    </section>
  );
}

/** Botão da abertura — só envolve rota que existe. */
export function BalanceAction({
  children,
  variant = "primary",
  className,
  ...rest
}: {
  children: ReactNode;
  variant?: "primary" | "ghost";
} & React.ComponentPropsWithoutRef<"span">) {
  return (
    <span
      className={cn(
        "inline-flex cursor-pointer items-center gap-2 rounded-[14px] px-[22px] py-[13px] text-[14px] font-bold transition-colors",
        variant === "primary"
          ? "bg-primary text-primary-foreground shadow-premium hover:bg-primary-glow"
          : "bg-secondary text-foreground hover:bg-accent",
        className
      )}
      {...rest}
    >
      {children}
    </span>
  );
}
