import { Construction } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

/** Página placeholder pra rotas ainda não implementadas (fase 1+). */
export default function PlaceholderPage({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="space-y-6">
      <header className="animate-slide-up">
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {subtitle && <p className="text-muted-foreground">{subtitle}</p>}
      </header>
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
            <Construction className="h-6 w-6" />
          </div>
          <p className="text-sm text-muted-foreground">Em construção — próxima etapa do MVP.</p>
        </CardContent>
      </Card>
    </div>
  );
}
