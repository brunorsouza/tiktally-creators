# Setup — TikTally Creator

Passo a passo pra tirar o projeto do zero até rodar com dados reais.

## 1. Pré-requisitos

- Node 18+ e npm
- Conta Supabase (projeto **próprio** — não reusar o do TikTally-seller)
- Supabase CLI (`npm i -g supabase`) para migrations/edge functions
- App no TikTok Shop Partner Center com escopos `creator.*` (ver passo 4)

## 2. Instalar e configurar env

```bash
npm install
cp .env.example .env
```

Preencha o `.env` (ver comentários no `.env.example`). Mínimo pra subir o front:
`VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`.

## 3. Banco (Supabase)

Aplique a migration inicial (cria `creator_tokens`, `creator_profiles` e RLS):

```bash
supabase link --project-ref <seu-ref>
supabase db push
```

Depois gere os tipos reais (substitui o placeholder):

```bash
supabase gen types typescript --project-id <seu-ref> > src/integrations/supabase/types.ts
```

Cadastre os **secrets** das edge functions (Dashboard → Edge Functions → Secrets):

```
TIKTOK_APP_KEY, TIKTOK_APP_SECRET, TIKTOK_ENV=production, TIKTOK_SERVICE_ID
SUPABASE_SERVICE_ROLE_KEY   # já existe por padrão no ambiente das functions
```

Deploy das functions:

```bash
supabase functions deploy creator-get-profile
supabase functions deploy creator-search-orders
supabase functions deploy creator-token-exchange
```

## 4. ⚠️ TikTok App — escopos de creator (BLOQUEADOR)

Este é o ponto que precisa ser **validado antes** de investir na feature:

1. No **Partner Center**, confirme que o app tem os pacotes de escopo de creator:
   - `creator.affiliate.info` (Affiliate Information)
   - `creator.affiliate_collaboration.read` (Read Creator Affiliate Collaborations)
   - `creator.video.write` (Content Posting) — sensível, revisão extra
   - `creator.showcase.read` / `creator.showcase.write`, `creator.affiliate.share_link.read`,
     `creator.data.live.read.public` (conforme as features)
2. Confirme **disponibilidade regional para o Brasil**. A doc oficial descreve elegibilidade de
   creator afiliado como US/UK/SEA e diz que Affiliate APIs não existem em UK/EU. Na prática o
   programa existe na TikTok Shop BR — mas **valide no seu app** antes de prosseguir.
3. Configure a **redirect URI** do OAuth de creator para `${VITE_PUBLIC_URL}/auth/callback`.

Referência completa dos endpoints: [`TIKTOK_AFFILIATE_CREATOR_API.md`](./TIKTOK_AFFILIATE_CREATOR_API.md).

## 5. OAuth de creator (fase 1 — a completar)

O fluxo está esqueletado:
- `src/pages/ConnectPage.tsx` monta a URL de authorize.
- `src/pages/AuthCallbackPage.tsx` recebe o `code`.
- `supabase/functions/creator-token-exchange/` troca o `code` pelo token — **TODO**: preencher o
  endpoint real de token exchange (`user_type=1`) conforme a config do app, e o upsert em
  `creator_tokens`.

## 6. Rodar

```bash
npm run dev   # http://localhost:8091
```

Sem TikTok conectado, o Painel mostra o estado "Conecte sua conta". Com token válido em
`creator_tokens`, as edge functions `creator-get-profile` e `creator-search-orders` passam a
responder e o painel popula.
