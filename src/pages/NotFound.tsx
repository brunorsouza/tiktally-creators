import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="font-display text-7xl font-extrabold tracking-tight text-primary">404</p>
      <p className="max-w-sm text-pretty text-muted-foreground">
        Essa página não existe — ou mudou de lugar.
      </p>
      <Button asChild variant="outline" className="mt-2">
        <Link to="/">Voltar ao painel</Link>
      </Button>
    </div>
  );
}
