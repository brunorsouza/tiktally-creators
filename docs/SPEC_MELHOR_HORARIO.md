# Spec: Melhor Horário (Horários que vendem) do TikTally Creator

> Status: **implementado na Fase 1** · Autor: sessão TikTally Creator · Data: 2026-09-18
> Companheira de [`SPEC_AGENDADOR_POSTS.md`](./SPEC_AGENDADOR_POSTS.md): esta spec cobre a
> **sugestão** de horário; aquela cobre o **agendamento** em si (§11, Fase 3: "sugestão de
> melhor horário").

---

## 1. Problema & objetivo

O creator quer saber **a que horas postar / transmitir** para vender mais. Hoje ele chuta,
ou copia conselho genérico de internet ("poste às 19h") que não tem nada a ver com a
audiência dele.

**Resultado esperado:** uma aba em Analytics que responde, com os dados da própria conta,
**em que horas o dinheiro dele entra**, e que é honesta sobre o que esse número é e o que
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
| Performance por hora do vídeo | `Get Video Performances` (202403) | **Granularidade diária**. A doc é explícita: _"hour/minute/second values will be ignored"_. Além disso é **US-creator-only**, escopo inativo, latência de 1 dia, e exige `video_ids` conhecidos de antemão. |

Consequência: mesmo com `creator.video.write` aprovado **e** creator nos EUA,
`Get Video Performances` continua sem responder: ela não tem eixo de hora.

### Falso positivo descartado

`Get Shop Performance Per Hour` (`/analytics/202510/shop/performance/{date}/performance_per_hour`)
**tem** granularidade horária, mas é API de **seller**: exige token `user_type=0` +
`shop_cipher`. Não cabe neste app (creator, `user_type=1`, sem `shop_cipher`, escopos
`creator.*`). Serve ao TikTally-seller, não a este projeto.

---

## 3. O que dá pra fazer com os escopos de hoje

O único sinal com resolução de hora acessível ao creator é `create_time` de
**Search Creator Affiliate Orders** (202410), escopo `creator.affiliate_collaboration.read`,
🟢 **ativo**, e já implementado em `useAllAffiliateOrders`.

Cada SKU do pedido traz:

| Campo | Serve para |
|---|---|
| `create_time` (Unix, **UTC+0**) | a hora do dia em que a venda aconteceu |
| `content_type` (`VIDEO` / `LIVE` / `SHOP` / `LINKSHARE`…) | separar live de vídeo. **Isto decide a leitura** (§4) |
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

A UI **muda o texto conforme o recorte**, e não é decoração, é o que impede a feature de
mentir.

---

## 5. Decisão de arquitetura: derivado no cliente

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
hooks/useHorarios.ts  (React Query derivado, nenhuma chamada nova à API)
        ▼
Aba "Horários" em /analytics
```

Reusar `useAllAffiliateOrders` significa **nenhuma requisição adicional**: a mesma query do
Ranking serve as duas abas (mesma `queryKey`, cache compartilhado).

---

## 6. Regras de cálculo (as decisões que importam)

### 6.1 Fuso: o bug mais caro possível

`create_time` é **UTC+0** (explícito na doc). O creator é BR (UTC−3). Se a conversão
faltar, **toda** recomendação sai 3 horas errada, e silenciosamente: a tela parece
perfeita.

Regra: converter sempre com `Intl.DateTimeFormat` num fuso **explícito**
(default: o fuso do dispositivo do creator), e **exibir o nome do fuso na tela**, para o
número nunca ser ambíguo.

### 6.2 Por que totais por hora são comparáveis sem normalizar

Em qualquer período, cada hora do dia ocorre uma vez por dia; as 24 horas aparecem o
mesmo número de vezes. Então somar comissão por hora já é comparável, sem dividir por
nada. (Mesma coisa para as 168 células de dia×hora: cada uma ocorre ~N/7 vezes.)

### 6.3 Janela de 3h, não hora única

Recomendar "19h" é preciso demais para o dado que temos. Recomendamos **janela de 3h**
("19h–21h"), escolhida pela soma móvel circular, mais robusta e mais acionável.

### 6.4 Amostra: o guard-rail que impede a feature de mentir

24 baldes já é pouco; 168 células (7×24) é ruído puro para quase todo creator. Com o teto
de 2000 pedidos de `useAllAffiliateOrders`, um creator típico de 300 pedidos/90 dias tem
~1,8 pedido por célula de dia×hora.

| Pedidos no período | Confiança | Comportamento |
|---|---|---|
| < 30 | **insuficiente** | **não mostra recomendação nenhuma, nem ações, nem vale**, só o aviso |
| 30–99 | baixa | mostra, rotulada como exploratória |
| 100–299 | média | mostra |
| ≥ 300 | alta | mostra |
| ≥ 30 | n/a | libera a **grade de 28 células** (7 dias × 4 blocos) |
| ≥ 200 | n/a | libera a **grade cheia de 7×24** (168 células) |

Sem isso, o app diria com confiança a um creator de 12 pedidos que ele deve postar às 3h
da manhã. Esse é o modo de falha real desse tipo de feature.

### 6.5 Piso de evidência por afirmação

O guard-rail de amostra é global; cada frase que o app **afirma** tem ainda o seu próprio
piso, em `lib/horariosInsights.ts`. Sem o piso, a frase não existe. Não há versão
"fraquinha" de um conselho tirado de 1 pedido.

| Afirmação | Piso | Por quê |
|---|---|---|
| Qualquer ação | confiança ≠ `insuficiente` | Se não dá para nomear a janela, não dá para mandar marcar live. Sem isso a tela se contradizia: "ainda não dá para dizer" ao lado de "marque a live para quinta às 12h". |
| "Marque a próxima live para…" | célula com ≥ 3 pedidos | Uma célula de 1 pedido não é padrão semanal. |
| "Teste \<bloco\>" | ≥ 2 pedidos, volume ≤ 60% da média por célula **e** ticket acima do geral | Ranquear por comissão total devolveria ruído: bloco pouco trabalhado tem comissão baixa por definição. O sinal é **ticket alto com pouco volume**. |
| "**Evite** \<faixa\>" | ≥ 100 pedidos | Abaixo disso o verbo **descreve** ("foi o seu vale") em vez de prescrever. O mesmo número não vira ordem sem lastro. |

Duas regras de redação saíram da revisão visual, e valem para o que vier depois:

- **A janela fria é o vão entre os picos, não a cauda do dia.** Buscá-la entre a primeira e
  a última hora com _qualquer_ venda devolve sempre a madrugada, e "evite as 3h" não é
  conselho para quem dorme nesse horário. O intervalo candidato vai da primeira à última
  hora **acima da média**.
- **O vale é comparativo, não absoluto.** "R$ 781 é o buraco do seu dia" soa falso num
  creator grande; o que informa é render **37% do que as mesmas 3 horas rendem no pico**.

---

## 7. Telas / UX

**Aba "Horários"** em `/analytics` (4ª aba, ao lado de Ranking / Vídeo específico / Live).
Layout conforme o redesenho de 2026-09-18.

1. **Barra de contexto**: segmented `Tudo · Live · Vídeo` (§4) + volume do recorte
   ("463 pedidos · R$ 6.290,69 em comissão") + fuso + **Exportar** (CSV com as 24 horas e
   as 28 células; `;` e BOM para o Excel pt-BR abrir certo).
2. **Cartão "Sua janela de ouro"** (2/3): a janela em número grande, chip de confiança,
   uma frase de leitura, quatro KPIs (comissão na janela, pedidos, comissão por pedido com
   o _uplift_ vs. resto do dia, dia mais forte) e a **barra de amostra**, que mostra o
   quanto dá para confiar como medida, não como adjetivo. Em `insuficiente` o cartão vira
   "Ainda não dá para dizer" e os KPIs somem.
3. **Painel "O que fazer com isso"** (1/3): as ações derivadas (§6.5), a nota do vale e a
   **ressalva de leitura**, que muda com o filtro e fica âmbar em "Vídeo".
4. **Gráfico por hora (24 colunas)**: visão primária. Toggle `R$ · Pedidos`, faixa da
   janela de pico rotulada, linha da média das horas ativas, rótulo só nas duas maiores
   barras, e **hora sem pedido vira traço na linha de base, não buraco**. Ausência de
   venda e ausência de dado não podem ler igual.
5. **Grade dia × bloco (7 × 4 = 28 células)** (2/3): a semana no recorte que a amostra
   sustenta, com o **valor em R$ dentro da célula** e a mais quente contornada. A grade
   cheia de 7×24 fica atrás do link "Ver a grade de 24h", com ≥200 pedidos.
6. **"Suas 5 melhores horas"** (1/3): comissão, volume e ticket lado a lado, mais a
   leitura de que volume e ticket costumam morar em horários diferentes.
7. **Tabela**: mesma informação em texto (acessibilidade e conferência).

### Notas de visualização

- Barras: **uma cor** para todas. Colorir barra por valor re-codifica o que o comprimento
  já mostra (anti-padrão). A cor cheia marca só a janela: é destaque da resposta, não
  codificação do dado. Sem janela recomendada, nada é destacado.
- Heatmap: rampa **sequencial de um tom**, claro→escuro, com paridade light/dark validada
  (monotonia de luminosidade e gap entre passos). O passo mais claro **recua para a
  superfície** de propósito: é o "quase zero" de um heatmap; a leitura fina fica no valor
  dentro da célula, no hover e na tabela.
- O nível da célula é **magnitude ancorada no percentil 95**, nunca quintil: quintil
  garante que 20% das células saiam no nível máximo, tenham elas magnitude relevante ou
  não. É fabricar sinal.
- A tinta sobre os dois passos extremos inverte **por tema** (`--heat-ink`), porque a rampa
  inverte: no claro os passos 4-5 são escuros, no escuro são os mais claros. Todos os pares
  medidos acima de 4,5:1.
- Números dentro das células só na grade de 28 (onde cabem); na de 168, nunca.

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

- **Fase 1, agora (esta entrega):** aba Horários derivada dos pedidos, com o split
  LIVE/VÍDEO, guard-rail de amostra e fuso explícito. Sem escopo novo, sem backend.
- **Fase 2, acumular o dado que falta:** tabela de snapshot gravando `post_time` real
  (do Agendador) e `start_time` de live (`GetLiveRoomInfo`). **Só existe a partir do
  momento em que começamos a gravar**. Por isso vale começar cedo, para haver 6 meses de
  histórico próprio no dia em que `creator.video.write` sair.
- **Fase 3, fechar o ciclo:** com pares reais (hora de publicação → performance), a
  recomendação passa a ser sobre **postar**, não só sobre quando o público compra; e
  integra no campo data/hora do Compositor do Agendador.

---

## 11. Riscos

- **Confundir correlação com recomendação**: mitigado pelo split LIVE/VÍDEO (§4) e pelos
  rótulos. É o risco nº 1: a versão ingênua dessa feature mente.
- **Amostra pequena**: mitigado pelo guard-rail (§6.4).
- **Fuso**: mitigado pela conversão explícita + fuso visível (§6.1).
- **Teto de 2000 pedidos** por período (`useAllAffiliateOrders`): creators grandes em
  janelas longas podem truncar; o aviso já existe.
