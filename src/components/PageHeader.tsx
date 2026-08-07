import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { ModeBadge } from "./ModeBadge";

/**
 * Cabeçalho de página padrão: título + subtítulo + (ações e/ou badge Mock/Live).
 * Título no display face (Archivo), subtítulo largo e legível — mesmo ritmo em
 * todas as telas do app.
 */
export function PageHeader({
  title,
  subtitle,
  actions,
  showMode = true,
  className,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
  showMode?: boolean;
  className?: string;
}) {
  return (
    <header
      className={cn(
        "flex animate-slide-up flex-wrap items-end justify-between gap-5",
        className
      )}
    >
      <div className="min-w-0">
        <h1 className="font-display text-[26px] font-extrabold leading-[1.1] tracking-[-1px] md:text-[32px]">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-[9px] max-w-[600px] text-pretty text-[15.5px] leading-[1.55] text-muted-foreground">
            {subtitle}
          </p>
        )}
      </div>
      {(actions || showMode) && (
        <div className="flex shrink-0 items-center gap-2">
          {actions}
          {showMode && <ModeBadge />}
        </div>
      )}
    </header>
  );
}
