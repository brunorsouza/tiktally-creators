# Design System — TikTally Creator

Inspirado no DS do **TikTally Seller** (mesma arquitetura de tokens), com a identidade própria do
creator. Uma frase: **mesma estrutura, hue trocado**.

| | TikTally Seller | **TikTally Creator** |
|---|---|---|
| Primária | Roxo `262 83% 58%` | **Rosa `344 90% 56%`** (`#FE2C55`) |
| Acento da família | Ciano (logo/gradientes) | Ciano `184 88% 45%` (logo/gradientes) |
| Semânticas | success/warning/info/destructive | **idênticas** (família coesa) |
| Superfícies | cinza frio | branco levemente **rosado** |
| Regra de cor | tudo em HSL | tudo em HSL |

O logo reforça a relação: seller = check ciano + quadrado rosa; creator = **check rosa + quadrado ciano** (espelho).

---

## Onde ficam os tokens

- **`src/index.css`** — fonte da verdade. Todos os tokens em HSL, com paridade **light** (`:root`) e **dark** (`.dark`).
- **`tailwind.config.ts`** — expõe os tokens como classes utilitárias (`bg-primary`, `text-muted-foreground`, `shadow-premium`, `bg-gradient-primary`, `animate-glow`, etc.).

**Regra de ouro:** nunca use hex/rgb solto num componente. Sempre um token (`hsl(var(--x))`) ou a classe do Tailwind.

## Cores

### Marca
| Token | Classe | Uso |
|---|---|---|
| `--primary` | `bg-primary` / `text-primary` | Ações primárias, links, estados ativos |
| `--primary-glow` | `primary-glow` | Realce/halo da primária (gradiente/animação) |
| `--brand-pink` | `text-brand-pink` | Rosa da marca (logo) |
| `--brand-cyan` | `text-brand-cyan` | Ciano da marca (logo/dual-tone) |
| `--accent` / `--accent-foreground` | `bg-accent` | Hover sutil (ghost); texto rosa no hover |

### Superfícies & texto
`--background`, `--foreground`, `--card(-foreground)`, `--popover(-foreground)`, `--muted(-foreground)`, `--secondary(-foreground)`, `--border`, `--input`, `--ring`.

### Semânticas (iguais ao seller)
| Token | HSL | Classe |
|---|---|---|
| `--success` | `142 71% 45%` | `bg-success text-success-foreground` |
| `--warning` | `38 92% 50%` | `bg-warning` |
| `--info` | `199 89% 48%` | `bg-info` |
| `--destructive` | `0 84% 60%` | `bg-destructive` |

## Gradientes

Dual-tone rosa↔ciano, expostos como `bg-gradient-*`:

| Classe | Composição |
|---|---|
| `bg-gradient-primary` | rosa → rosa claro |
| `bg-gradient-secondary` | **ciano → rosa** (assinatura da marca) |
| `bg-gradient-premium` | rosa → magenta → ciano |
| `bg-gradient-success` | verde |
| `bg-gradient-card` | branco → rosado (cards) |
| `bg-gradient-dark` | superfícies escuras |

## Sombras

Escala neutra + realces da marca: `shadow-sm` `shadow-md` `shadow-lg` `shadow-xl` `shadow-premium` (halo rosa) `shadow-glow` (rosa) `shadow-elegant`.

## Raio, transições e animações

- **Raio:** `--radius: 0.75rem` → `rounded-lg/md/sm` derivados.
- **Transições:** `--transition-smooth`, `--transition-spring`; timing `ease-spring` no Tailwind.
- **Animações:** `animate-fade-in`, `animate-slide-up`, `animate-glow` (pulso rosa), `accordion-*`.

## Tipografia

System sans (padrão Tailwind), `antialiased`, com ligaduras (`rlig`/`calt`). Sem fonte custom — igual ao seller (trocar aqui se quiser uma display font depois).

## Convenções de componente

- **Botão primário:** `bg-primary text-primary-foreground hover:bg-primary/90` (já é o default do `Button`).
- **Card:** `bg-card border rounded-xl shadow-sm`; para destaque, `shadow-premium` ou `bg-gradient-card`.
- **StatCard:** chip de ícone colorido por acento (`primary`/`success`/`info`/`warning`) sobre `/10` de opacidade.
- **Sidebar item ativo:** rosa da marca (override `[data-sidebar][data-active]` no index.css + tokens `sidebar-*`).
- **Dark mode:** `next-themes` (classe `.dark`); todo token tem par dark — nunca hardcode cor por tema.

## Como estender

1. Novo token → declare em `:root` **e** `.dark` no `index.css` (sempre HSL).
2. Exponha no `tailwind.config.ts` (em `colors`/`boxShadow`/`backgroundImage`…).
3. Use pela classe utilitária. Nunca pule a etapa 1 (quebra o dark mode).
