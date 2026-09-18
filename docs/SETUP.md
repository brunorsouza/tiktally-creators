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
supabase functions deploy affiliate-proxy      # dispatcher dos endpoints de creator
supabase functions deploy account-connect      # OAuth: code → token
supabase functions deploy account-connection   # status / disconnect
```

O `affiliate-proxy` e o `account-connect` importam de `supabase/functions/_shared/`; deploy pela
CLI sobe esses arquivos junto. Deploy pelo MCP do Supabase não resolve import de irmão — nesse
caminho os arquivos de `_shared/` têm de ir achatados ao lado do `index.ts`.

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

## 5. OAuth de creator

O fluxo:
- `src/pages/ConnectPage.tsx` monta a URL de authorize.
- `src/pages/AuthCallbackPage.tsx` recebe o `code`.
- `supabase/functions/account-connect/` troca o `code` pelo token (exige `user_type=1`, senão
  rejeita) e faz o upsert em `creator_tokens`.

### Validade dos tokens

O `access_token` da TikTok dura ~7 dias e o `refresh_token` ~365. O
`_shared/creatorAuth.ts` renova o access_token sozinho — de forma proativa a partir de 10 min
do vencimento, e sob demanda se a TikTok recusar o token mesmo assim. Nada disso aparece para
o creator.

Como a TikTok **rotaciona o refresh_token a cada uso**, duas renovações simultâneas
invalidariam uma à outra e derrubariam a conta. Quem renova é decidido pela função
`claim_creator_token_refresh` (migration `0002`), um `UPDATE..RETURNING` que serve de lock:
uma requisição leva a linha, as outras aproveitam o resultado.

Só quando o `refresh_token` morre (vencido ou revogado) é que o creator precisa agir — aí o
backend responde `CREATOR_REAUTH_REQUIRED`, o status expõe `needs_reauth: true` e as telas
pedem a reconexão.

## 6. Rodar

```bash
npm run dev   # http://localhost:8091
```

Sem TikTok conectado, o Painel mostra o estado "Conecte sua conta". Com token válido em
`creator_tokens`, as edge functions `creator-get-profile` e `creator-search-orders` passam a
responder e o painel popula.
