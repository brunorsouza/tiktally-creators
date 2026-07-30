import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { ModeBadge } from "./ModeBadge";

/**
 * Cabeçalho de página padrão: título + subtítulo + (ações e/ou badge Mock/Live).
 * Substitui os headers reimplementados inline em cada tela.
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
    <header className={cn("flex flex-wrap items-start justify-between gap-4 animate-slide-up", className)}>
      <div className="min-w-0">
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {subtitle && <p className="text-muted-foreground">{subtitle}</p>}
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
