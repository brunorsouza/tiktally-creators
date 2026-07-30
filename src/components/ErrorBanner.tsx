import { ReactNode } from "react";
import { AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/** Banner de erro padrão (card vermelho suave + ícone). */
export function ErrorBanner({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <Card className={cn("border-destructive/30 bg-destructive/5", className)}>
      <CardContent className="flex items-center gap-3 p-4 text-sm">
        <AlertCircle className="h-5 w-5 shrink-0 text-destructive" />
        <span className="min-w-0">{children}</span>
      </CardContent>
    </Card>
  );
}
