# TikTally Creator

Painel de **ganhos e analytics para creators afiliados do TikTok Shop** (Brasil).
Projeto **separado** do [TikTally](../tiktok-shop-tally) (que é para _sellers_) — mesma stack,
mesma assinatura HMAC da TikTok Open API, mas com **token de creator** (`user_type = 1`) e escopos
`creator.*`.

> **Status:** setup inicial / MVP fase 1. O objetivo do MVP é o **Painel de Ganhos** (comissões por
> período, pedidos atribuídos) + **Analytics de creator** (performance por vídeo/live).

## Stack

- **Frontend:** React 18 + TypeScript + Vite (SWC)
- **UI:** Tailwind CSS + shadcn/ui + lucide-react + next-themes (dark mode)
- **Estado servidor:** TanStack Query 5
- **Rotas:** React Router v6
- **Backend:** Supabase (Auth + Postgres + Edge Functions Deno)
- **Charts:** Recharts

## Comandos

```bash
npm install          # instala deps
cp .env.example .env  # preencha as variáveis (ver docs/SETUP.md)
npm run dev          # dev server em http://localhost:8091
npm run build        # build de produção
npm run lint         # eslint
```

> Porta **8091** (o TikTally-seller usa 8080), pra rodar os dois lado a lado.

## Arquitetura (padrão TikTally)

Fluxo de dados: **TikTok API → Edge Function (assina) → Service → Hook (React Query) → Página**

```
src/
├── components/
│   ├── ui/               # shadcn/ui (button, card, input, badge, skeleton, sonner…)
│   ├── Layout.tsx        # shell com sidebar
│   ├── ProtectedRoute.tsx
│   └── StatCard.tsx      # card de KPI
├── contexts/
│   └── AuthContext.tsx   # auth dos usuários DO APP (Supabase)
├── hooks/                # useCreatorProfile, useCreatorEarnings (React Query)
├── services/             # tiktok-creator (caller de edge), profile, earnings
├── pages/                # Auth, Dashboard (Ganhos), Connect, Analytics…
├── lib/                  # utils (cn), formatters (BRL/datas)
├── types/creator.ts      # tipos de domínio da Creator API
└── integrations/supabase # client + types

supabase/
├── functions/
│   ├── _shared/tiktokSign.ts    # assinatura HMAC (adaptada, sem shop_cipher)
│   ├── _shared/creatorAuth.ts   # resolve creator_token do usuário
│   ├── creator-get-profile/     # Get Creator Profile (202508)
│   ├── creator-search-orders/   # Search Creator Affiliate Orders (202410)
│   └── creator-token-exchange/  # OAuth code → creator token (ESQUELETO)
└── migrations/0001_init.sql     # creator_tokens + creator_profiles + RLS
```

## Diferença-chave vs. TikTally-seller

| | Seller (TikTally) | Creator (este projeto) |
|---|---|---|
| Token | `user_type = 0` | **`user_type = 1`** |
| `shop_cipher` | obrigatório | **não usa** |
| Escopos | `seller.*` | **`creator.*`** |
| Assinatura HMAC | ⟵ igual ⟶ | ⟵ igual ⟶ |

## Referência da API

Todos os **36 endpoints de creator** (request/response completos) estão em
[`docs/TIKTOK_AFFILIATE_CREATOR_API.md`](./docs/TIKTOK_AFFILIATE_CREATOR_API.md).

## ⚠️ Bloqueador conhecido (verificar antes de ir fundo)

Confirmar no **Partner Center** que o app tem os escopos `creator.*` e **disponibilidade BR** das
Affiliate APIs. Detalhes em [`docs/SETUP.md`](./docs/SETUP.md).

---

Software independente. Não afiliado à TikTok ou ByteDance.
