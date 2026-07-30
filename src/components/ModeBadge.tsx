import { Badge } from "@/components/ui/badge";
import { USE_MOCK } from "@/services/creatorClient";
import { cn } from "@/lib/utils";

/** Badge Mock/Live padrão, lê o USE_MOCK do creatorClient. */
export function ModeBadge({ className }: { className?: string }) {
  return (
    <Badge variant={USE_MOCK ? "warning" : "success"} className={cn("shrink-0", className)}>
      {USE_MOCK ? "Mock" : "Live"}
    </Badge>
  );
}
