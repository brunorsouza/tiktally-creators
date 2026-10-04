import { ReactNode, useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Wallet, BarChart3, LogOut, TerminalSquare, User, Store,
  Compass, Gift, Link2, Clapperboard, Boxes, Package, Film, Activity,
  CircleUserRound, PlugZap, Search, Bell, Sun, Moon, MoonStar, Menu, X,
  type LucideIcon,
} from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { Logo } from "@/components/brand/Logo";
import { USE_MOCK } from "@/services/creatorClient";
import { CreatorAvatar } from "@/components/CreatorAvatar";
import { useCreatorProfile } from "@/hooks/useCreatorProfile";

/* ── Navegação no TOPO ─────────────────────────────────────────────────────
   Terceira estrutura, e a que ficou. A barra lateral — de dois níveis ou de
   um — comia largura e, pior, dava ao app cara de painel administrativo. Isto
   aqui é gestão financeira: a tela tem que abrir no dinheiro, não num índice.

   Agora as seções são um grupo segmentado na barra de cima e as telas da seção
   aparecem numa segunda linha, só quando a seção tem mais de uma. O conteúdo
   fica com 100% da largura em qualquer monitor.

   `SECTIONS` segue sendo a única fonte da verdade — a rota ativa resolve a
   seção, e o dock e o menu "Mais" do mobile saem daqui. */

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

/** Barra inferior do mobile — quatro destinos + a porta para todo o resto.
    O dock cobre 4 das 12 telas; sem o "Mais", as outras 8 não têm rota no
    celular (a sidebar começa em md). */
const DOCK: NavItem[] = [
  { to: "/", label: "Painel", icon: LayoutDashboard },
  { to: "/descoberta", label: "Descobrir", icon: Compass },
  { to: "/estudio", label: "Criar", icon: Clapperboard },
  { to: "/ganhos", label: "Ganhos", icon: Wallet },
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

/** Link de navegação — mesma régua na sidebar e no menu "Mais" do mobile. */
function NavLink({ item, onNavigate }: { item: NavItem; onNavigate?: () => void }) {
  const location = useLocation();
  const on = location.pathname === item.to;
  const Icon = item.icon;
  return (
    <Link
      to={item.to}
      onClick={onNavigate}
      aria-current={on ? "page" : undefined}
      className={cn(
        "flex items-center gap-[11px] rounded-md px-[13px] py-[9px] text-[14.5px] transition-colors",
        on
          ? "bg-primary/[.085] font-semibold text-primary"
          : "font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
      )}
    >
      <Icon className={cn("h-5 w-5 shrink-0", on ? "stroke-[1.9]" : "stroke-[1.4]")} />
      <span className="flex-1 text-left">{item.label}</span>
    </Link>
  );
}

/** A árvore inteira de navegação: 5 grupos, 12 destinos, nada escondido. */
function NavTree({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="flex flex-col gap-[18px]">
      {SECTIONS.map((section) => (
        <div key={section.id}>
          <div className="px-[13px] pb-[7px]">
            <PanelLabel>{section.label}</PanelLabel>
          </div>
          <div className="flex flex-col gap-[3px]">
            {section.items.map((item) => (
              <NavLink key={item.to} item={item} onNavigate={onNavigate} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/** Rodapé de identidade — o mesmo bloco na sidebar e no menu do mobile.
    Sem o botão de tema de propósito: em 252px ele roubava a largura do nome.
    O tema mora na topbar (desktop) e no próprio menu (mobile). */
function IdentityFooter() {
  const { user, signOut } = useAuth();
  const { data: profile } = useCreatorProfile();
  const name = (user?.user_metadata?.name as string | undefined) ?? null;

  return (
    <div className="flex items-center gap-[11px] border-t px-4 py-3">
      <CreatorAvatar
        url={profile?.avatar?.url}
        fallback={initials(name, user?.email)}
        className="grid h-[34px] w-[34px] shrink-0 place-items-center rounded-[11px] bg-primary/[.085] font-display text-sm font-bold text-primary"
      />
      <div className="min-w-0 flex-1">
        <div className="truncate text-[13.5px] font-semibold">
          {profile?.username ?? name ?? "Creator"}
        </div>
        <div className="truncate text-[11.5px] text-faint">{user?.email}</div>
      </div>
      <button
        type="button"
        onClick={signOut}
        title="Sair"
        aria-label="Sair"
        className="grid h-[38px] w-[38px] shrink-0 place-items-center rounded-[14px] border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
      >
        <LogOut className="h-[19px] w-[19px] stroke-[1.5]" />
      </button>
    </div>
  );
}

/** Marca — some o nome em telas estreitas, o símbolo fica. */
function Brand() {
  return (
    <Link to="/" aria-label="TikTally Creator" className="flex shrink-0 items-center gap-2.5">
      <Logo size={28} />
      {/* O nome fica em todas as larguras: no mobile a barra só tem o sino, e
          um símbolo sozinho num vão de 300px parece bug, não minimalismo. */}
      <span className="font-display text-[17px] font-bold tracking-tight">
        TikTally <span className="text-primary">Creator</span>
      </span>
    </Link>
  );
}

/** As cinco seções como grupo segmentado — o trilho lateral virou isto. */
function SectionTabs({ active }: { active: string }) {
  return (
    <nav aria-label="Seções" className="segmented hidden md:flex">
      {SECTIONS.map((s) => (
        <Link
          key={s.id}
          to={s.items[0].to}
          data-active={s.id === active}
          aria-current={s.id === active ? "page" : undefined}
          className="segmented-item"
        >
          {s.label}
        </Link>
      ))}
    </nav>
  );
}

/** Segunda linha: as telas da seção. Só existe quando há mais de uma —
    numa seção de tela única ela seria uma régua decorativa. */
function SectionBar({ section }: { section: Section }) {
  const location = useLocation();
  if (section.items.length < 2) return null;
  return (
    <nav
      aria-label={`Telas de ${section.label}`}
      className="hidden items-center gap-1 border-b bg-panel px-4 md:flex md:px-[34px]"
    >
      {section.items.map(({ to, label, icon: Icon }) => {
        const on = location.pathname === to;
        return (
          <Link
            key={to}
            to={to}
            aria-current={on ? "page" : undefined}
            className={cn(
              "flex items-center gap-2 border-b-2 px-3 py-[11px] text-[13.5px] transition-colors",
              on
                ? "border-primary font-bold text-primary"
                : "border-transparent font-medium text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon className={cn("h-[17px] w-[17px]", on ? "stroke-[2]" : "stroke-[1.5]")} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

/** Menu "Mais" do mobile — a mesma árvore da sidebar, em painel deslizante. */
function MobileNav({ open, onClose }: { open: boolean; onClose: () => void }) {
  // Fecha no Esc e trava o scroll do fundo enquanto o painel está aberto.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <button
        type="button"
        aria-label="Fechar menu"
        onClick={onClose}
        className="absolute inset-0 bg-foreground/35 animate-fade-in"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Navegação"
        className="absolute inset-y-0 right-0 flex w-[84%] max-w-[320px] flex-col border-l bg-panel shadow-lg"
      >
        <div className="flex items-center justify-between px-4 pb-3 pt-4">
          <span className="font-display text-base font-bold tracking-tight">Navegação</span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar menu"
            className="grid h-11 w-11 place-items-center rounded-[14px] border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
          >
            <X className="h-5 w-5 stroke-[1.5]" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-4">
          <NavTree onNavigate={onClose} />
          <div className="mt-5 flex items-center justify-between rounded-[8px] border bg-card px-4 py-3">
            <PanelLabel>Tema</PanelLabel>
            <ThemeCycleButton className="h-[38px] w-[38px]" />
          </div>
        </div>

        <IdentityFooter />
      </div>
    </div>
  );
}

export function Layout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const { user } = useAuth();
  // Mesma query do Perfil — o react-query compartilha pela chave, então a foto
  // na topbar não custa uma requisição a mais.
  const { data: profile } = useCreatorProfile();
  const section = useMemo(() => sectionForPath(location.pathname), [location.pathname]);
  const [menuOpen, setMenuOpen] = useState(false);

  // Trocar de rota fecha o menu — inclusive quando o destino veio de dentro da página.
  useEffect(() => setMenuOpen(false), [location.pathname]);

  const dockActive = DOCK.some((d) => d.to === location.pathname);
  const name = (user?.user_metadata?.name as string | undefined) ?? null;

  return (
    <div className="bg-paper flex h-screen flex-col overflow-hidden">
      {/* Topbar — marca, seções e ações. Fundo opaco de propósito: ela tampa a
          textura enquanto o conteúdo passa por baixo. */}
      <header className="relative z-20 flex shrink-0 items-center gap-3.5 border-b bg-background px-4 py-3 md:px-[34px]">
        <Brand />

        <div className="md:pl-2">
          <SectionTabs active={section.id} />
        </div>

        <div className="flex-1" />

        <div
          className={cn(
            "hidden items-center gap-2 whitespace-nowrap rounded-[8px] border px-[13px] py-2 text-[13px] font-semibold xl:flex",
            USE_MOCK ? "text-warning" : "text-success"
          )}
        >
          <span
            className={cn("h-[7px] w-[7px] rounded-full bg-current", !USE_MOCK && "animate-breathe")}
          />
          {USE_MOCK ? "Modo demonstração" : "Dados ao vivo"}
        </div>

        <button
          type="button"
          title="Buscar"
          aria-label="Buscar produto, pedido ou vídeo"
          className="hidden h-[42px] w-[42px] shrink-0 place-items-center rounded-[13px] border bg-card text-muted-foreground transition-colors hover:border-primary hover:text-primary lg:grid"
        >
          <Search className="h-5 w-5 stroke-[1.5]" />
        </button>

        <button
          type="button"
          title="Notificações"
          aria-label="Notificações"
          className="relative grid h-[42px] w-[42px] shrink-0 place-items-center rounded-[13px] border bg-card text-muted-foreground transition-colors hover:border-primary hover:text-primary"
        >
          <Bell className="h-5 w-5 stroke-[1.5]" />
        </button>

        <ThemeCycleButton className="hidden bg-card md:grid" />

        {/* Avatar leva ao Perfil — a identidade saiu do pé da sidebar e virou
            o canto direito da barra, que é onde as pessoas procuram. */}
        <Link
          to="/perfil"
          title={profile?.username ?? name ?? user?.email ?? "Perfil"}
          aria-label="Perfil"
          className="hidden h-[42px] w-[42px] shrink-0 rounded-[13px] ring-1 ring-border transition-colors hover:ring-primary md:block"
        >
          <CreatorAvatar
            url={profile?.avatar?.url}
            fallback={initials(name, user?.email)}
            className="grid h-full w-full place-items-center rounded-[13px] bg-primary/[.12] font-display text-sm font-bold text-primary"
          />
        </Link>
      </header>

      <SectionBar section={section} />

      <main className="relative min-w-0 flex-1 overflow-y-auto">
        <div className="min-w-0 px-4 pb-24 pt-6 md:px-[34px] md:pb-16 md:pt-7">{children}</div>
      </main>

      {/* Dock — navegação principal do mobile */}
      <nav className="fixed inset-x-0 bottom-0 z-30 flex border-t bg-panel px-3 pb-[22px] pt-2.5 md:hidden">
        {DOCK.map(({ to, label, icon: Icon }) => {
          const on = location.pathname === to;
          return (
            <Link
              key={to}
              to={to}
              aria-current={on ? "page" : undefined}
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

        {/* Quinto slot: tudo que não coube no dock. Fica ativo quando a rota
            atual não é nenhum dos quatro destinos fixos. */}
        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          aria-haspopup="dialog"
          aria-expanded={menuOpen}
          className={cn(
            "flex flex-1 flex-col items-center gap-[3px] py-1.5",
            !dockActive ? "text-primary" : "text-faint"
          )}
        >
          <Menu className={cn("h-[23px] w-[23px]", !dockActive ? "stroke-[1.9]" : "stroke-[1.4]")} />
          <span className={cn("text-[10px]", !dockActive ? "font-bold" : "font-medium")}>Mais</span>
        </button>
      </nav>

      <MobileNav open={menuOpen} onClose={() => setMenuOpen(false)} />
    </div>
  );
}
