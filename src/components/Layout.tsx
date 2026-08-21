import { ReactNode, useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Wallet, BarChart3, LogOut, TerminalSquare, User, Store,
  Compass, Gift, Link2, Clapperboard, Boxes, Package, Film, Activity,
  CircleUserRound, PlugZap, Search, Bell, Sun, Moon, MoonStar, type LucideIcon,
} from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { Logo } from "@/components/brand/Logo";
import { USE_MOCK } from "@/services/creatorClient";

/* ── Navegação em dois níveis ──────────────────────────────────────────────
   O trilho (78px) troca a SEÇÃO; a sidebar (272px) lista as telas da seção.
   `SECTIONS` é a única fonte da verdade — a rota ativa resolve a seção. */

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
}

interface Section {
  id: string;
  label: string;
  icon: LucideIcon;
  title: string;
  sub: string;
  /** Rótulo e texto do painel de contexto no pé da sidebar. */
  panel?: { label: string; text: string };
  items: NavItem[];
}

const SECTIONS: Section[] = [
  {
    id: "inicio",
    label: "Início",
    icon: LayoutDashboard,
    title: "Início",
    sub: "O resumo do seu dia em um lugar só.",
    panel: {
      label: "Bom saber",
      text: "O painel soma os pedidos atribuídos ao seu conteúdo no período que você escolher.",
    },
    items: [{ to: "/", label: "Painel", icon: LayoutDashboard }],
  },
  {
    id: "produtos",
    label: "Produtos",
    icon: Package,
    title: "Produtos",
    sub: "Escolha o que promover e acompanhe suas amostras.",
    panel: {
      label: "Bom saber",
      text: "A ordem da vitrine importa: os primeiros itens levam a maior parte dos cliques.",
    },
    items: [
      { to: "/descoberta", label: "Descoberta", icon: Compass },
      { to: "/vitrine", label: "Vitrine", icon: Store },
      { to: "/amostras", label: "Amostras", icon: Gift },
    ],
  },
  {
    id: "conteudo",
    label: "Conteúdo",
    icon: Film,
    title: "Conteúdo",
    sub: "Do rascunho ao vídeo publicado.",
    panel: {
      label: "Próximo passo",
      text: "Um link por vídeo é o jeito mais simples de saber o que converteu.",
    },
    items: [
      { to: "/estudio", label: "Estúdio", icon: Clapperboard },
      { to: "/links", label: "Links", icon: Link2 },
    ],
  },
  {
    id: "resultados",
    label: "Resultados",
    icon: Activity,
    title: "Resultados",
    sub: "Quanto entrou e o que fez entrar.",
    panel: {
      label: "Bom saber",
      text: "A comissão é liberada quando termina o prazo de devolução do pedido.",
    },
    items: [
      { to: "/ganhos", label: "Ganhos", icon: Wallet },
      { to: "/analytics", label: "Analytics", icon: BarChart3 },
    ],
  },
  {
    id: "conta",
    label: "Conta",
    icon: CircleUserRound,
    title: "Conta",
    sub: "Identidade, permissões e conexão.",
    items: [
      { to: "/perfil", label: "Perfil", icon: User },
      { to: "/conectar", label: "Conexão", icon: PlugZap },
      { to: "/toko", label: "Toko Mapper", icon: Boxes },
      { to: "/api-tester", label: "API Tester", icon: TerminalSquare },
    ],
  },
];

/** Barra inferior do mobile — os cinco destinos mais usados. */
const DOCK: NavItem[] = [
  { to: "/", label: "Painel", icon: LayoutDashboard },
  { to: "/descoberta", label: "Descobrir", icon: Compass },
  { to: "/estudio", label: "Criar", icon: Clapperboard },
  { to: "/ganhos", label: "Ganhos", icon: Wallet },
  { to: "/perfil", label: "Perfil", icon: User },
];

const THEMES = [
  { key: "light", icon: Sun, label: "Claro" },
  { key: "dark", icon: Moon, label: "Escuro" },
  { key: "black", icon: MoonStar, label: "Black" },
] as const;

function sectionForPath(pathname: string): Section {
  const exact = SECTIONS.find((s) => s.items.some((i) => i.to === pathname));
  if (exact) return exact;
  // rotas filhas (ex.: /ganhos/123) caem na seção do prefixo mais longo
  const byPrefix = SECTIONS.filter((s) =>
    s.items.some((i) => i.to !== "/" && pathname.startsWith(i.to))
  );
  return byPrefix[0] ?? SECTIONS[0];
}

/** Iniciais para o avatar — do nome, com fallback pro e-mail. */
function initials(name?: string | null, email?: string | null): string {
  const source = name?.trim() || email?.split("@")[0] || "";
  const parts = source.split(/[\s._-]+/).filter(Boolean);
  if (parts.length === 0) return "TT";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

/** Micro-rótulo do DS: 12px, 700, caixa alta, bem espaçado. */
function PanelLabel({ children }: { children: ReactNode }) {
  return (
    <div className="text-xs font-bold uppercase tracking-[0.7px] text-faint">{children}</div>
  );
}

/** Alterna entre os três temas em ciclo — um botão só, como no trilho do DS. */
function ThemeCycleButton({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const index = Math.max(0, THEMES.findIndex((t) => t.key === theme));
  const current = THEMES[index];
  const next = THEMES[(index + 1) % THEMES.length];
  const Icon = mounted ? current.icon : Moon;

  return (
    <button
      type="button"
      onClick={() => setTheme(next.key)}
      title={`Tema: ${current.label} — trocar para ${next.label}`}
      aria-label={`Trocar tema para ${next.label}`}
      className={cn(
        "grid h-11 w-11 place-items-center rounded-[14px] border text-muted-foreground transition-colors hover:border-primary hover:text-primary",
        className
      )}
    >
      <Icon className="h-[21px] w-[21px] stroke-[1.5]" />
    </button>
  );
}

/** Trilho de seções — 78px, sempre visível no desktop. */
function Rail({ active }: { active: string }) {
  const { signOut } = useAuth();
  return (
    <nav className="z-30 hidden w-[78px] shrink-0 flex-col items-center gap-1.5 border-r bg-panel pb-3.5 pt-[18px] lg:flex">
      <Link
        to="/"
        aria-label="TikTally Creator"
        className="mb-4 grid h-[38px] w-[38px] place-items-center"
      >
        <Logo size={34} />
      </Link>

      {SECTIONS.map((s) => {
        const on = s.id === active;
        const Icon = s.icon;
        return (
          <Link
            key={s.id}
            to={s.items[0].to}
            title={s.label}
            className={cn(
              "flex h-[52px] w-14 flex-col items-center justify-center gap-0.5 rounded-rail transition-colors",
              on ? "bg-primary/[.085] text-primary" : "text-faint hover:text-foreground"
            )}
          >
            <Icon className={cn("h-[22px] w-[22px]", on ? "stroke-[1.9]" : "stroke-[1.4]")} />
            <span className={cn("text-[10px] tracking-[0.1px]", on ? "font-bold" : "font-medium")}>
              {s.label}
            </span>
          </Link>
        );
      })}

      <div className="flex-1" />
      <ThemeCycleButton />
      <button
        type="button"
        onClick={signOut}
        title="Sair"
        aria-label="Sair"
        className="grid h-11 w-11 place-items-center rounded-[14px] text-faint transition-colors hover:text-primary"
      >
        <LogOut className="h-[21px] w-[21px] stroke-[1.5]" />
      </button>
    </nav>
  );
}

/** Sidebar contextual — título da seção, telas e o rodapé de identidade. */
function SectionSidebar({ section }: { section: Section }) {
  const location = useLocation();
  const { user } = useAuth();
  const name = (user?.user_metadata?.name as string | undefined) ?? null;

  return (
    <aside className="z-20 hidden w-[272px] shrink-0 flex-col overflow-y-auto border-r bg-panel md:flex">
      <div className="px-5 pb-3.5 pt-[22px]">
        <h2 className="font-display text-xl font-bold tracking-[-0.3px]">{section.title}</h2>
        <p className="mt-[3px] text-[13px] leading-[1.45] text-faint">{section.sub}</p>
      </div>

      <div className="flex flex-col gap-[3px] px-3">
        {section.items.map(({ to, label, icon: Icon }) => {
          const on = location.pathname === to;
          return (
            <Link
              key={to}
              to={to}
              className={cn(
                "flex items-center gap-[11px] rounded-md px-[13px] py-[11px] text-[14.5px] transition-colors",
                on
                  ? "bg-primary/[.085] font-semibold text-primary"
                  : "font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <Icon className="h-5 w-5 shrink-0 stroke-[1.4]" />
              <span className="flex-1 text-left">{label}</span>
            </Link>
          );
        })}
      </div>

      <div className="mt-1.5 px-4 pb-4 pt-5">
        {section.id === "conta" ? (
          <div className="rounded-[8px] border bg-card p-4">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "h-2 w-2 rounded-full",
                  USE_MOCK ? "bg-warning" : "animate-breathe bg-success"
                )}
              />
              <div className="text-sm font-semibold">
                {USE_MOCK ? "Dados de demonstração" : "Conta conectada"}
              </div>
            </div>
            <p className="mt-2 text-[12.5px] leading-[1.5] text-faint">
              {USE_MOCK
                ? "Você está vendo fixtures locais. Conecte o TikTok Shop para ver seus números reais."
                : "Lendo pedidos, comissões e conteúdo direto do TikTok Shop."}
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {["Vitrine", "Pedidos", "Vídeos"].map((tag) => (
                <span
                  key={tag}
                  className="rounded-lg bg-secondary px-2.5 py-1 text-[11.5px] text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ) : (
          section.panel && (
            <div className="rounded-[8px] border bg-card p-4">
              <PanelLabel>{section.panel.label}</PanelLabel>
              <p className="mt-2 text-sm leading-[1.5] text-muted-foreground">
                {section.panel.text}
              </p>
            </div>
          )
        )}
      </div>

      <div className="flex-1" />
      <div className="flex items-center gap-[11px] border-t px-4 py-3.5">
        <div className="grid h-[34px] w-[34px] shrink-0 place-items-center rounded-[11px] bg-primary/[.085] font-display text-sm font-bold text-primary">
          {initials(name, user?.email)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-[13.5px] font-semibold">{name ?? "Creator"}</div>
          <div className="truncate text-[11.5px] text-faint">{user?.email}</div>
        </div>
      </div>
    </aside>
  );
}

export function Layout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const section = useMemo(() => sectionForPath(location.pathname), [location.pathname]);

  return (
    <div className="bg-paper flex h-screen overflow-hidden">
      <Rail active={section.id} />
      <SectionSidebar section={section} />

      <main className="relative flex min-w-0 flex-1 flex-col overflow-y-auto">
        {/* Topbar — some no mobile, onde o dock inferior assume a navegação.
            Fundo opaco de propósito: no design a topbar tampa a textura de
            papel enquanto o conteúdo passa por baixo. */}
        <div className="sticky top-0 z-20 flex items-center gap-3.5 border-b bg-background px-4 py-3.5 md:px-[34px]">
          {/* 45px é a medida do design — é ela que fecha a topbar em 74px. */}
          <div className="hidden h-[45px] flex-1 items-center gap-2.5 rounded-[13px] border bg-card px-3.5 md:flex md:max-w-[420px]">
            <Search className="h-[19px] w-[19px] shrink-0 stroke-[1.5] text-faint" />
            <span className="truncate text-sm text-faint">Buscar produto, pedido ou vídeo</span>
            <kbd className="ml-auto rounded-[6px] border px-1.5 py-0.5 font-mono text-[11px] text-faint">
              /
            </kbd>
          </div>

          {/* Marca no mobile (o trilho está escondido) */}
          <Link to="/" className="flex items-center gap-2 md:hidden">
            <Logo size={28} />
            <span className="font-display text-base font-bold tracking-tight">
              TikTally <span className="text-primary">Creator</span>
            </span>
          </Link>

          <div className="flex-1" />

          <div
            className={cn(
              "hidden items-center gap-2 rounded-[8px] border px-[13px] py-2 text-[13px] font-semibold sm:flex",
              USE_MOCK ? "text-warning" : "text-success"
            )}
          >
            <span
              className={cn(
                "h-[7px] w-[7px] rounded-full bg-current",
                !USE_MOCK && "animate-breathe"
              )}
            />
            {USE_MOCK ? "Modo demonstração" : "Dados ao vivo"}
          </div>

          <button
            type="button"
            title="Notificações"
            aria-label="Notificações"
            className="relative grid h-[42px] w-[42px] shrink-0 place-items-center rounded-[13px] border bg-card text-muted-foreground transition-colors hover:border-primary hover:text-primary"
          >
            <Bell className="h-5 w-5 stroke-[1.5]" />
          </button>

          <ThemeCycleButton className="bg-card lg:hidden" />
        </div>

        <div className="min-w-0 flex-1 px-4 pb-24 pt-6 md:px-[34px] md:pb-16 md:pt-8">
          {children}
        </div>
      </main>

      {/* Dock — navegação principal do mobile */}
      <nav className="fixed inset-x-0 bottom-0 z-30 flex border-t bg-panel px-3 pb-[22px] pt-2.5 md:hidden">
        {DOCK.map(({ to, label, icon: Icon }) => {
          const on = location.pathname === to;
          return (
            <Link
              key={to}
              to={to}
              className={cn(
                "flex flex-1 flex-col items-center gap-[3px] py-1.5",
                on ? "text-primary" : "text-faint"
              )}
            >
              <Icon className={cn("h-[23px] w-[23px]", on ? "stroke-[1.9]" : "stroke-[1.4]")} />
              <span className={cn("text-[10px]", on ? "font-bold" : "font-medium")}>{label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
