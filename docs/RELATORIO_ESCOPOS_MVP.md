# Relatório — Escopos de Creator disponíveis vs. MVP

**Data:** 2026-07-29
**App inspecionado:** `TikTally-prod` (Partner Center) — app_key `6i81ttkvadr1h`, mercado **Brasil**,
status **Ativado**, redirect `https://tiktally.com.br/auth/callback`.
**Fonte:** painel _Gerenciar API_ do app (42 pacotes: 37 ativos, 4 inativos, 1 não aprovado),
cruzado com [`docs/TIKTOK_AFFILIATE_CREATOR_API.md`](./TIKTOK_AFFILIATE_CREATOR_API.md) (36 endpoints de creator).

> **Achado-chave:** os escopos `creator.*` já vivem no **app de seller** (TikTally-prod), e a maioria
> já está **ativa**. Dá pra rodar ~65% do MVP **hoje**, sem pedir escopo novo. Faltam 2 ações
> pontuais (1 ativar, 1 adicionar).

---

## 1. Escopos `creator.*` no app (situação real)

| Escopo | Pacote | Status | Serve para |
|---|---|---|---|
| `creator.affiliate.info` | Affiliate Information | 🟢 **Ativo** | Perfil do creator |
| `creator.affiliate_collaboration.read` | Read Creator Affiliate Collaborations | 🟢 **Ativo** | **Pedidos/ganhos**, colaborações, amostras |
| `creator.showcase.read` | Read Showcase Products | 🟢 **Ativo** | Ler vitrine |
| `creator.showcase.write` | Manage Showcase Products | 🟢 **Ativo** | Gerir vitrine (add/remove/pin) |
| `creator.data.live.read.public` | Live Data | 🟢 **Ativo** | **Analytics de LIVE** (GMV, viewers…) |
| `creator.affiliate.link.write` | Manage Affiliate Tracking Links | 🟢 **Ativo** | Gerar links (escopo **legado**, ver §4) |
| `creator.video.write` | Content Posting | 🟠 **Inativo** | **Analytics de vídeo** + publicar conteúdo |
| `creator.affiliate.share_link.read` | Read Affiliate Share Link | 🔴 **Ausente** | **Comissão em R$** (Trace Orders) + links novos |

Bônus ativo relevante: `data.bestselling.public.read` (**Bestsellers**) 🟢 — inteligência de "o que promover".

---

## 2. O que dá pra fazer HOJE (escopos já ativos)

Cruzando com os 36 endpoints, **~23 já estão liberados**:

- **Perfil** — Get Creator Profile ✅ (`creator.affiliate.info`)
- **Painel de Ganhos (parcial)** — Search Creator Affiliate Orders (202410) ✅
  (`creator.affiliate_collaboration.read`) → pedidos + preço + **taxa de comissão** (você multiplica
  preço × rate p/ estimar; o valor R$ fechado exige o item do §3).
- **Descoberta & Colaborações** — Open/Target Collaboration search + Get by IDs ✅
- **Amostras** — label, search, detail, fulfillments ✅
- **Analytics de LIVE** — os 7 endpoints Live Room (202502) ✅ (`creator.data.live.read.public`)
- **Vitrine** — Get/Add/Remove/Top Showcase ✅ (`creator.showcase.read/write`)

## 3. O que está BLOQUEADO e por quê

| Bloqueio | Escopo | Endpoints afetados | Impacto no MVP |
|---|---|---|---|
| 🟠 **Inativo** (só clicar "Aplicar" + re-autorizar) | `creator.video.write` | Get Video Performances (202403) + todo o Estúdio shoppable (upload/post/precheck/music/status/shop products) — ~11 | **Analytics por vídeo** e publicação de conteúdo |
| 🔴 **Ausente** (precisa adicionar o pacote) | `creator.affiliate.share_link.read` | Trace Orders (202505), Generate General/Publisher Link (202505/202504), Toko Mapper v2 — 4 | **Comissão exata em R$** e geração de link nova |

## 4. ⚠️ Contexto que amarra tudo: sunset da Affiliate API legada

O **Changelog do Partner Center (hoje, 29/07/2026)** traz: _"For All Markets: Affiliate API — Legacy
Versions and Endpoints Sunset — **Breaking Change**"_. Isso explica a divergência do §1: o app tem o
escopo **legado** `creator.affiliate.link.write` (Manage Affiliate Tracking Links), enquanto os
endpoints **atuais** da doc (Trace Orders, Generate Link 202504/202505) pedem o escopo **novo**
`creator.affiliate.share_link.read`. Ou seja: além de faltar, é preciso migrar do legado pro novo
antes do sunset.

---

## 5. Veredito do MVP

O MVP (**Painel de Ganhos + Analytics de creator**) está **~65% coberto por escopos já ativos**:

- ✅ **Pronto hoje:** perfil, pedidos por conteúdo (com comissão **estimada**), analytics de **LIVE**,
  vitrine, descoberta e amostras.
- 🟠 **1 clique + re-auth:** `creator.video.write` (Content Posting, já no app mas inativo) →
  destrava **analytics por vídeo** e o estúdio de conteúdo. É o escopo **sensível** (revisão extra).
- 🔴 **1 pacote a adicionar + re-auth:** `creator.affiliate.share_link.read` → destrava **comissão
  em R$** (Trace Orders) e a geração de link nova. É o único item que exige aprovação de escopo novo.

### Recomendação

1. **Rodar o MVP já** com o que está ativo: Ganhos via **Search Orders** (comissão estimada = preço ×
   rate) + **Analytics de LIVE**. Zero dependência de aprovação.
2. **Adicionar `creator.affiliate.share_link.read`** (pacote _Read Affiliate Share Link_) para trocar
   a comissão estimada pela **exata** (Trace Orders) — alinhado ao sunset do legado.
3. **Ativar `creator.video.write`** só quando for fazer analytics por vídeo / publicação — assumindo
   a revisão extra do escopo sensível.
4. Depois de qualquer mudança de escopo, os creators **precisam re-autorizar** o app.

### Decisão de arquitetura em aberto

Os escopos de creator estão no app **TikTally-prod** (o app de seller, já autorizado por 5 sellers).
Para o produto de creator dá pra: (a) **reusar esse app** (já tem 6/7 escopos de creator) com o fluxo
de autorização de **creator** (`user_type=1`), ou (b) publicar um **app dedicado** ao creator. Reusar
acelera; um app dedicado separa métricas/aprovações. — decidir antes de fechar o OAuth.
