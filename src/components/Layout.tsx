import { ReactNode, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Wallet, BarChart3, LogOut, TerminalSquare, User, Store,
  Compass, Gift, Link2, Clapperboard, Boxes, Menu, X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Wordmark } from "@/components/brand/Wordmark";
import { ThemeToggle } from "@/components/ThemeToggle";

const NAV = [
  { to: "/", label: "Painel", icon: LayoutDashboard },
  { to: "/perfil", label: "Perfil", icon: User },
  { to: "/vitrine", label: "Vitrine", icon: Store },
  { to: "/descoberta", label: "Descoberta", icon: Compass },
  { to: "/amostras", label: "Amostras", icon: Gift },
  { to: "/links", label: "Links", icon: Link2 },
  { to: "/estudio", label: "Estúdio", icon: Clapperboard },
  { to: "/ganhos", label: "Ganhos", icon: Wallet },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/toko", label: "Toko Mapper", icon: Boxes },
  { to: "/api-tester", label: "API Tester", icon: TerminalSquare },
];

/** Conteúdo compartilhado entre a sidebar desktop e o drawer mobile. */
function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const location = useLocation();
  const { signOut, user } = useAuth();
  return (
    <>
      <Wordmark className="mb-8 px-2" />
      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto">
        {NAV.map(({ to, label, icon: Icon }) => {
          const active = location.pathname === to;
          return (
            <Link
              key={to}
              to={to}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-4 border-t pt-4">
        <ThemeToggle className="mb-3" />
        <p className="mb-2 truncate px-3 text-xs text-muted-foreground">{user?.email}</p>
        <Button variant="ghost" size="sm" className="w-full justify-start gap-3" onClick={signOut}>
          <LogOut className="h-4 w-4" />
          Sair
        </Button>
      </div>
    </>
  );
}

export function Layout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const [open, setOpen] = useState(false);

  // Fecha o drawer ao trocar de rota.
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar — desktop */}
      <aside className="hidden w-60 shrink-0 flex-col border-r bg-card px-4 py-6 md:flex">
        <SidebarContent />
      </aside>

      {/* Drawer — mobile */}
      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/50 animate-fade-in"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <aside className="absolute inset-y-0 left-0 flex w-64 max-w-[82%] flex-col border-r bg-card px-4 py-6 shadow-elegant">
            <button
              className="absolute right-3 top-4 rounded-md p-1.5 text-muted-foreground hover:bg-accent"
              onClick={() => setOpen(false)}
              aria-label="Fechar menu"
            >
              <X className="h-5 w-5" />
            </button>
            <SidebarContent onNavigate={() => setOpen(false)} />
          </aside>
        </div>
      )}

      {/* Coluna principal */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar — mobile */}
        <header className="sticky top-0 z-30 flex items-center justify-between border-b bg-card/95 px-4 py-3 backdrop-blur md:hidden">
          <Wordmark size={26} textClassName="text-base" />
          <button
            className="rounded-md p-2 text-muted-foreground hover:bg-accent"
            onClick={() => setOpen(true)}
            aria-label="Abrir menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        </header>

        <main className="min-w-0 flex-1 overflow-x-hidden">
          <div className="mx-auto max-w-6xl px-4 py-6 md:px-8 md:py-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
