# Spec — Melhor Horário (Horários que vendem) do TikTally Creator

> Status: **implementado na Fase 1** · Autor: sessão TikTally Creator · Data: 2026-09-18
> Companheira de [`SPEC_AGENDADOR_POSTS.md`](./SPEC_AGENDADOR_POSTS.md) — esta spec cobre a
> **sugestão** de horário; aquela cobre o **agendamento** em si (§11, Fase 3: "sugestão de
> melhor horário").

---

## 1. Problema & objetivo

O creator quer saber **a que horas postar / transmitir** para vender mais. Hoje ele chuta,
ou copia conselho genérico de internet ("poste às 19h") que não tem nada a ver com a
audiência dele.

**Resultado esperado:** uma aba em Analytics que responde, com os dados da própria conta,
**em que horas o dinheiro dele entra** — e que é honesta sobre o que esse número é e o que
ele não é.

---

## 2. ⚠️ Achado decisivo: não existe API de "melhor horário"

Nenhum endpoint da Affiliate Creator API responde isso. Mais do que isso: **os dados
necessários para calcular a resposta correta não existem** no escopo de creator.

"Melhor horário para postar" exige pares **(hora da publicação → performance resultante)**.
Os dois lados faltam:

| O que seria necessário | Onde estaria | Situação real |
|---|---|---|
| Hora em que o vídeo foi publicado | `GetShoppableVideoStatus.post_time` | Só existe para vídeos postados **pela nossa API**. Vídeo postado no app do TikTok: **nenhum endpoint** devolve a hora de publicação. Depende de `creator.video.write` (🟠 inativo). |
| Performance por hora do vídeo | `Get Video Performances` (202403) | **Granularidade diária** — a doc é explícita: _"hour/minute/second values will be ignored"_. Além disso é **US-creator-only**, escopo inativo, latência de 1 dia, e exige `video_ids` conhecidos de antemão. |

Consequência: mesmo com `creator.video.write` aprovado **e** creator nos EUA,
`Get Video Performances` continua sem responder — ela não tem eixo de hora.

### Falso positivo descartado

`Get Shop Performance Per Hour` (`/analytics/202510/shop/performance/{date}/performance_per_hour`)
**tem** granularidade horária, mas é API de **seller**: exige token `user_type=0` +
`shop_cipher`. Não cabe neste app (creator, `user_type=1`, sem `shop_cipher`, escopos
`creator.*`). Serve ao TikTally-seller, não a este projeto.

---

## 3. O que dá pra fazer com os escopos de hoje

O único sinal com resolução de hora acessível ao creator é `create_time` de
**Search Creator Affiliate Orders** (202410) — escopo `creator.affiliate_collaboration.read`,
🟢 **ativo**, e já implementado em `useAllAffiliateOrders`.

Cada SKU do pedido traz:

| Campo | Serve para |
|---|---|
| `create_time` (Unix, **UTC+0**) | a hora do dia em que a venda aconteceu |
| `content_type` (`VIDEO` / `LIVE` / `SHOP` / `LINKSHARE`…) | separar live de vídeo — **isto decide a leitura** (§4) |
| `content_id` | agrupar por vídeo / sala de live |
| `estimated_commission` / `actual_commission` | o retorno em R$ (mesma regra de resolução de Ganhos) |

### Escopo: esta feature **não depende de aprovação nenhuma**

Diferente do Agendador (travado em `creator.video.write`), a sugestão de horário roda
**hoje**, em produção, com os escopos que o app já tem.

---

## 4. A distinção que define a feature: LIVE ≠ VÍDEO

Esse é o ponto intelectual da spec. O mesmo cálculo tem validade **completamente
diferente** dependendo do `content_type`:

| | LIVE | VÍDEO |
|---|---|---|
| Quando o pedido acontece | **durante** a transmissão | espalhado por dias após a publicação |
| Hora do pedido ≈ hora do conteúdo? | ✅ sim, acoplado | ❌ não, descorrelacionado |
| Leitura honesta | **"melhor horário para transmitir"** | **"quando seu público compra"** |
| Pode virar recomendação de publicação? | ✅ sim | ❌ **não** |

Um pedido de vídeo às 21h pode vir de um vídeo postado anteontem. Chamar isso de "melhor
horário para postar" é inventar um número. Portanto:

- Na visão **Live**, o app recomenda horário de transmissão.
- Na visão **Vídeo**, o app mostra o mapa de compra e diz explicitamente que isso **não** é
  hora de postar.
- Na visão **Tudo**, o rótulo é neutro ("quando suas vendas acontecem").

A UI **muda o texto conforme o recorte** — não é decoração, é o que impede a feature de
mentir.

---

## 5. Decisão de arquitetura — derivado no cliente

Zero backend novo, zero escopo novo, zero tabela nova.

```text
useAllAffiliateOrders(range)        ← já existe, já pagina até 2000 pedidos
        │  orders[].skus[] { create_time, content_type, commission… }
        ▼
lib/horarios.ts   (puro, testável, sem React)
   converte create_time → hora/dia-da-semana NO FUSO DO CREATOR
   agrega em 24 baldes de hora + grade 7×24
   suaviza (janela circular ±1h) e escolhe a melhor janela de 3h
   classifica a confiança pelo tamanho da amostra
        ▼
hooks/useHorarios.ts  (React Query derivado — nenhuma chamada nova à API)
        ▼
Aba "Horários" em /analytics
```

Reusar `useAllAffiliateOrders` significa **nenhuma requisição adicional**: a mesma query do
Ranking serve as duas abas (mesma `queryKey`, cache compartilhado).

---

## 6. Regras de cálculo (as decisões que importam)

### 6.1 Fuso — o bug mais caro possível

`create_time` é **UTC+0** (explícito na doc). O creator é BR (UTC−3). Se a conversão
faltar, **toda** recomendação sai 3 horas errada — e silenciosamente: a tela parece
perfeita.

Regra: converter sempre com `Intl.DateTimeFormat` num fuso **explícito**
(default: o fuso do dispositivo do creator), e **exibir o nome do fuso na tela**, para o
número nunca ser ambíguo.

### 6.2 Por que totais por hora são comparáveis sem normalizar

Em qualquer período, cada hora do dia ocorre uma vez por dia — as 24 horas aparecem o
mesmo número de vezes. Então somar comissão por hora já é comparável, sem dividir por
nada. (Mesma coisa para as 168 células de dia×hora: cada uma ocorre ~N/7 vezes.)

### 6.3 Janela de 3h, não hora única

Recomendar "19h" é preciso demais para o dado que temos. Recomendamos **janela de 3h**
("19h–21h"), escolhida pela soma móvel circular — mais robusta e mais acionável.

### 6.4 Amostra — o guard-rail que impede a feature de mentir

24 baldes já é pouco; 168 células (7×24) é ruído puro para quase todo creator. Com o teto
de 2000 pedidos de `useAllAffiliateOrders`, um creator típico de 300 pedidos/90 dias tem
~1,8 pedido por célula de dia×hora.

| Pedidos no período | Confiança | Comportamento |
|---|---|---|
| < 30 | **insuficiente** | **não mostra recomendação nenhuma** — só o aviso |
| 30–99 | baixa | mostra, rotulada como exploratória |
| 100–299 | média | mostra |
| ≥ 300 | alta | mostra |
| < 200 | — | **grade 7×24 fica indisponível** (só a visão por hora) |

Sem isso, o app diria com confiança a um creator de 12 pedidos que ele deve postar às 3h
da manhã. Esse é o modo de falha real desse tipo de feature.

---

## 7. Telas / UX

**Aba "Horários"** em `/analytics` (4ª aba, ao lado de Ranking / Vídeo específico / Live).

1. **Filtro de conteúdo** — segmented `Tudo · Live · Vídeo` (§4). Muda o texto da headline.
2. **Headline** — "Melhor janela: **19h–21h**", com chip de confiança e o fuso usado.
   Em `insuficiente`, vira um aviso explicando quantos pedidos faltam.
3. **Gráfico por hora (24 colunas)** — visão primária, sempre presente. Uma única cor
   (a magnitude já está no comprimento da barra); a janela recomendada fica destacada e
   rotulada. Hover com hora, comissão e nº de pedidos.
4. **Grade dia×hora (7×24)** — secundária, atrás de um toggle, só com ≥200 pedidos.
   Rampa sequencial de um tom só (rosa da marca), 5 níveis + vazio. Hover por célula.
5. **Tabela** — mesma informação em texto (acessibilidade e conferência).

### Notas de visualização

- Barras: **uma cor** para todas. Colorir barra por valor re-codifica o que o comprimento
  já mostra (anti-padrão).
- Heatmap: rampa **sequencial de um tom**, claro→escuro, com paridade light/dark validada
  (monotonia de luminosidade e gap entre passos). O passo mais claro **recua para a
  superfície** de propósito — é o "quase zero" de um heatmap; a leitura fina fica no hover
  e na tabela.
- Nenhum número dentro das células/barras — só no destaque e no hover.

---

## 8. Casos de borda

- **Creator novo / sem vendas** → estado `insuficiente`, com o número de pedidos que faltam.
- **Período curto** (7 dias) → quase sempre `baixa`; a tela diz isso em vez de fingir.
- **Todos os pedidos na mesma hora** (conta de teste) → janela sai correta, confiança baixa.
- **Fuso do dispositivo ≠ fuso da audiência** → o nome do fuso fica visível na tela.
- **`create_time` ausente** numa SKU → linha ignorada, contada em `descartados`.
- **Período truncado** (teto de 2000 pedidos) → herda o aviso de `truncated` do hook.
- **Só `content_type: SHOP`** (venda pela vitrine, sem conteúdo) → entra em "Tudo", fica
  fora de Live/Vídeo.

---

## 9. Perguntas em aberto

1. Métrica de ranking: **comissão** (default hoje) ou **nº de pedidos**? Comissão premia
   ticket alto; pedidos medem audiência. Talvez um toggle.
2. Vale mostrar a **defasagem** publicação→venda dos vídeos (histograma), para o creator
   entender por que vídeo não vira recomendação de horário?
3. Quando o Agendador (Fase 1) estiver no ar, a sugestão deve **pré-preencher** o campo de
   data/hora do Compositor, ou só sugerir ao lado?

---

## 10. Fases

- **Fase 1 — agora (esta entrega):** aba Horários derivada dos pedidos, com o split
  LIVE/VÍDEO, guard-rail de amostra e fuso explícito. Sem escopo novo, sem backend.
- **Fase 2 — acumular o dado que falta:** tabela de snapshot gravando `post_time` real
  (do Agendador) e `start_time` de live (`GetLiveRoomInfo`). **Só existe a partir do
  momento em que começamos a gravar** — por isso vale começar cedo, para haver 6 meses de
  histórico próprio no dia em que `creator.video.write` sair.
- **Fase 3 — fechar o ciclo:** com pares reais (hora de publicação → performance), a
  recomendação passa a ser sobre **postar**, não só sobre quando o público compra; e
  integra no campo data/hora do Compositor do Agendador.

---

## 11. Riscos

- **Confundir correlação com recomendação** — mitigado pelo split LIVE/VÍDEO (§4) e pelos
  rótulos. É o risco nº 1: a versão ingênua dessa feature mente.
- **Amostra pequena** — mitigado pelo guard-rail (§6.4).
- **Fuso** — mitigado pela conversão explícita + fuso visível (§6.1).
- **Teto de 2000 pedidos** por período (`useAllAffiliateOrders`) — creators grandes em
  janelas longas podem truncar; o aviso já existe.
