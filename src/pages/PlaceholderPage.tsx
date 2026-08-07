import { Construction } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/PageHeader";

/** Página placeholder pra rotas ainda não implementadas (fase 1+). */
export default function PlaceholderPage({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="space-y-gap">
      <PageHeader title={title} subtitle={subtitle} />
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
          <div className="tint h-12 w-12 text-faint">
            <Construction className="h-6 w-6 stroke-[1.6]" />
          </div>
          <p className="text-sm text-muted-foreground">Em construção — próxima etapa do MVP.</p>
        </CardContent>
      </Card>
    </div>
  );
}
