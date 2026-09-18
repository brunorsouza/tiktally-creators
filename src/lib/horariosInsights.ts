import {
  BLOCOS,
  DIAS_LONGOS,
  JANELA_HORAS,
  celulaBloco,
  rotuloHora,
  type CelulaBloco,
  type CelulaGrade,
  type ContentFilter,
  type HoraBucket,
  type Janela,
  type ResumoHorarios,
} from "@/lib/horarios";

/**
 * Leitura editorial do resumo de horários: as estatísticas derivadas e as frases que a
 * tela mostra. Separado de `horarios.ts` de propósito — lá mora a matemática, aqui mora
 * o que o app AFIRMA a partir dela, que é onde esta feature pode mentir.
 *
 * Ver docs/SPEC_MELHOR_HORARIO.md §4 e §6.4. Duas regras valem em tudo neste arquivo:
 *
 * 1. Toda afirmação tem piso de evidência. Sem o piso a frase não aparece — não existe
 *    versão "fraquinha" de um conselho tirado de 1 pedido.
 * 2. Em amostra baixa o verbo DESCREVE ("foi o seu vale"); só em amostra alta ele
 *    PRESCREVE ("evite"). O mesmo número não vira ordem quando não tem lastro.
 */

/** Pisos de evidência por afirmação — quantos pedidos a frase precisa para existir. */
export const MIN_PEDIDOS_ACAO_LIVE = 3;
export const MIN_PEDIDOS_ACAO_TESTE = 2;
/** Prescrever "evite" exige lastro; abaixo disso a mesma célula só é descrita. */
export const MIN_PEDIDOS_PRESCRICAO = 100;

export interface EstatisticasHorarios {
  /** Comissão média das horas que tiveram ao menos um pedido (linha de referência). */
  mediaHorasAtivas: number;
  horasAtivas: number;
  /** Comissão por pedido dentro da janela de ouro. */
  ticketJanela: number;
  /** Comissão por pedido no resto do dia. */
  ticketFora: number;
  /** Quanto o ticket da janela supera o do resto do dia (0,47 = 47% acima). */
  upliftTicket: number;
  /** Dia da semana com mais comissão + a melhor hora dentro dele. */
  diaMaisForte?: { dia: number; comissao: number; melhorHora?: HoraBucket };
  /** Célula (dia × bloco) mais quente da semana. */
  celulaQuente?: CelulaBloco;
  /** Melhor hora dentro da célula quente — o que vira horário sugerido de live. */
  horaDaCelulaQuente?: HoraBucket;
  /**
   * Célula que rendeu bem apesar de quase não ser trabalhada — candidata a teste.
   * "Pouco trabalhada" = menos pedidos que a média das células ativas.
   */
  celulaSubaproveitada?: CelulaBloco;
  /** Pior janela de 3h DENTRO do intervalo em que o creator de fato vende. */
  janelaFria?: Janela;
  /** As 5 horas com mais comissão. */
  topHoras: HoraBucket[];
}

function ticketDe(comissao: number, pedidos: number): number {
  return pedidos > 0 ? comissao / pedidos : 0;
}

/**
 * Pior janela de 3h — só DENTRO do intervalo ativo do creator.
 *
 * Sem essa restrição a resposta é sempre a madrugada, e "evite as 4h da manhã" é um
 * conselho vazio para quem nunca trabalhou às 4h. O buraco que interessa é o que fica no
 * meio do dia em que a pessoa já está ativa.
 */
function janelaFriaDe(horas: HoraBucket[]): Janela | undefined {
  const ativas = horas.filter((h) => h.pedidos > 0);
  if (ativas.length < 2) return undefined;

  /*
   * O intervalo candidato vai da primeira à última hora FORTE (acima da média das horas
   * ativas) — não da primeira à última hora com qualquer venda.
   *
   * Com "qualquer venda" a resposta vira a madrugada em qualquer conta que venda 24h, e
   * "evite as 3h da manhã" não é conselho: é o horário em que a pessoa dorme. O buraco
   * que importa é o vão ENTRE os picos — a hora morta no meio do dia de trabalho.
   */
  const media = ativas.reduce((s, h) => s + h.comissao, 0) / ativas.length;
  const fortes = ativas.filter((h) => h.comissao >= media);
  if (fortes.length < 2) return undefined;
  const primeira = fortes[0].hora;
  const ultima = fortes[fortes.length - 1].hora;
  // Precisa de espaço para existir um "meio": um vão de 3h entre os dois picos extremos.
  if (ultima - primeira < JANELA_HORAS + 1) return undefined;

  const total = horas.reduce((s, h) => s + h.comissao, 0);
  let pior: Janela | undefined;
  for (let inicio = primeira; inicio + JANELA_HORAS - 1 <= ultima; inicio++) {
    let comissao = 0;
    let pedidos = 0;
    for (let k = 0; k < JANELA_HORAS; k++) {
      comissao += horas[inicio + k].comissao;
      pedidos += horas[inicio + k].pedidos;
    }
    if (!pior || comissao < pior.comissao) {
      pior = {
        inicio,
        fim: inicio + JANELA_HORAS - 1,
        comissao,
        pedidos,
        share: total > 0 ? comissao / total : 0,
      };
    }
  }
  return pior;
}

export function calcularEstatisticas(resumo: ResumoHorarios, blocos: CelulaBloco[]): EstatisticasHorarios {
  const { horas, grade, totalComissao, totalPedidos, melhorJanela } = resumo;

  const ativas = horas.filter((h) => h.pedidos > 0);
  const mediaHorasAtivas = ativas.length ? totalComissao / ativas.length : 0;

  const ticketJanela = melhorJanela ? ticketDe(melhorJanela.comissao, melhorJanela.pedidos) : 0;
  const ticketFora = melhorJanela
    ? ticketDe(totalComissao - melhorJanela.comissao, totalPedidos - melhorJanela.pedidos)
    : 0;

  // Dia mais forte + a melhor hora dentro dele.
  const porDia = Array.from({ length: 7 }, () => 0);
  for (const c of grade) porDia[c.dia] += c.comissao;
  let diaMaisForte: EstatisticasHorarios["diaMaisForte"];
  const melhorDia = porDia.reduce((best, v, i) => (v > porDia[best] ? i : best), 0);
  if (porDia[melhorDia] > 0) {
    const doDia = grade.filter((c) => c.dia === melhorDia && c.pedidos > 0);
    const pico = doDia.reduce<CelulaGrade | undefined>(
      (best, c) => (!best || c.comissao > best.comissao ? c : best),
      undefined
    );
    diaMaisForte = {
      dia: melhorDia,
      comissao: porDia[melhorDia],
      melhorHora: pico ? { hora: pico.hora, pedidos: pico.pedidos, comissao: pico.comissao } : undefined,
    };
  }

  const comVenda = blocos.filter((b) => b.pedidos > 0);
  const celulaQuente = comVenda.reduce<CelulaBloco | undefined>(
    (best, c) => (!best || c.comissao > best.comissao ? c : best),
    undefined
  );

  // Melhor hora dentro da célula quente — é dela que sai o horário sugerido de live.
  let horaDaCelulaQuente: HoraBucket | undefined;
  if (celulaQuente) {
    const faixa = BLOCOS[celulaQuente.bloco];
    const candidatas = grade.filter(
      (c) => c.dia === celulaQuente.dia && c.hora >= faixa.inicio && c.hora < faixa.fim && c.pedidos > 0
    );
    const pico = candidatas.reduce<CelulaGrade | undefined>(
      (best, c) => (!best || c.comissao > best.comissao ? c : best),
      undefined
    );
    if (pico) horaDaCelulaQuente = { hora: pico.hora, pedidos: pico.pedidos, comissao: pico.comissao };
  }

  /*
   * Candidata a teste: bloco de TICKET alto que você quase não trabalha.
   *
   * "Quase não trabalha" precisa ser bem abaixo da média, não apenas abaixo — com o corte
   * em `< média` uma célula de 15 pedidos numa média de 16,5 entrava como "você quase não
   * trabalha isso", o que é falso. O corte é 60% da média.
   *
   * E o ranking é por ticket, não por comissão total: comissão total num bloco pouco
   * trabalhado é quase sempre baixa por definição, então ordenar por ela devolveria só
   * ruído. Ticket alto com pouco volume é que é sinal de "aqui pode ter mais".
   */
  const mediaPedidosCelula = comVenda.length
    ? comVenda.reduce((s, c) => s + c.pedidos, 0) / comVenda.length
    : 0;
  const ticketGeral = ticketDe(totalComissao, totalPedidos);
  const celulaSubaproveitada = comVenda
    .filter(
      (c) =>
        c !== celulaQuente &&
        c.pedidos <= mediaPedidosCelula * 0.6 &&
        ticketDe(c.comissao, c.pedidos) > ticketGeral
    )
    .reduce<CelulaBloco | undefined>(
      (best, c) =>
        !best || ticketDe(c.comissao, c.pedidos) > ticketDe(best.comissao, best.pedidos) ? c : best,
      undefined
    );

  return {
    mediaHorasAtivas,
    horasAtivas: ativas.length,
    ticketJanela,
    ticketFora,
    upliftTicket: ticketFora > 0 ? ticketJanela / ticketFora - 1 : 0,
    diaMaisForte,
    celulaQuente,
    horaDaCelulaQuente,
    celulaSubaproveitada,
    janelaFria: janelaFriaDe(horas),
    topHoras: [...ativas].sort((a, b) => b.comissao - a.comissao).slice(0, 5),
  };
}

// =============== Frases ===============

/** "um terço" lê melhor que "32,0%" numa frase — mas só quando a fração é redonda mesmo. */
export function fracaoEmPalavras(share: number): string | null {
  if (share >= 0.44 && share <= 0.57) return "metade";
  if (share >= 0.3 && share <= 0.38) return "um terço";
  if (share >= 0.22 && share < 0.3) return "um quarto";
  if (share >= 0.17 && share < 0.22) return "um quinto";
  return null;
}

const BLOCO_ADVERBIO = ["à noite", "à tarde", "de manhã", "de madrugada"] as const;

/** "quarta à noite" — como a célula quente é falada numa frase. */
export function rotuloCelula(c: CelulaBloco): string {
  return `${DIAS_LONGOS[c.dia]} ${BLOCO_ADVERBIO[c.bloco]}`;
}

export interface Acao {
  id: "live" | "video" | "teste";
  titulo: string;
  texto: string;
}

/**
 * As ações sugeridas — a parte mais perigosa da tela, porque é a única que diz ao creator
 * o que FAZER. Cada uma só existe se passar do próprio piso de evidência.
 *
 * A ação de vídeo é a mais delicada: ela é INFERÊNCIA, não achado. O dado diz quando o
 * público compra; postar antes da janela abrir é raciocínio em cima disso, porque
 * nenhuma API de creator devolve a hora de publicação de um vídeo (spec §2). O texto
 * carrega essa distinção em vez de esconder — e sob o filtro "Vídeo" o painel ainda
 * mostra a ressalva inteira.
 */
export function acoesDe(
  resumo: ResumoHorarios,
  stats: EstatisticasHorarios,
  filtro: ContentFilter
): Acao[] {
  const acoes: Acao[] = [];
  const { melhorJanela } = resumo;

  /*
   * Piso ANTES de qualquer piso individual: se a amostra não sustenta nem nomear a janela
   * de ouro, ela não sustenta nenhum conselho. Sem esta linha a tela ficava se
   * contradizendo — o cartão dizia "ainda não dá para dizer" e o painel ao lado mandava
   * marcar live na quinta às 12h, com base em 3 pedidos.
   */
  if (resumo.confianca === "insuficiente") return acoes;

  const celula = stats.celulaQuente;
  if (
    filtro !== "video" &&
    celula &&
    celula.pedidos >= MIN_PEDIDOS_ACAO_LIVE &&
    stats.horaDaCelulaQuente
  ) {
    const h = stats.horaDaCelulaQuente;
    acoes.push({
      id: "live",
      titulo: `Marque a próxima live para ${DIAS_LONGOS[celula.dia]}, por volta das ${rotuloHora(h.hora)}`,
      // Sem meia-hora: a grade é horária, e "20h30" seria uma precisão que o dado não tem.
      texto: `É a célula mais quente da sua semana — ${BRL(celula.comissao)} em ${celula.pedidos} pedidos, ${BRL(
        h.comissao
      )} só na hora das ${rotuloHora(h.hora)}.`,
    });
  }

  if (filtro !== "live" && melhorJanela) {
    const limite = rotuloHora((melhorJanela.inicio + 22) % 24); // ~2h antes da janela abrir
    acoes.push({
      id: "video",
      titulo: `Publique os vídeos até as ${limite}`,
      texto: `Inferência, não medição: o dado diz quando seu público compra (${rotuloHora(
        melhorJanela.inicio
      )}–${rotuloHora(
        melhorJanela.fim
      )}), e o vídeo precisa já estar circulando quando a janela abre. A hora de publicação de um vídeo não vem em nenhuma API de creator.`,
    });
  }

  const teste = stats.celulaSubaproveitada;
  if (teste && teste.pedidos >= MIN_PEDIDOS_ACAO_TESTE) {
    const ticketCelula = ticketDe(teste.comissao, teste.pedidos);
    const ticketGeral = ticketDe(resumo.totalComissao, resumo.totalPedidos);
    acoes.push({
      id: "teste",
      titulo: `Teste ${rotuloCelula(teste)}`,
      texto: `Só ${teste.pedidos} pedidos ali no período, mas a ${BRL(
        ticketCelula
      )} cada — contra ${BRL(ticketGeral)} da sua média. Bloco de ticket alto que você quase não trabalha.`,
    });
  }

  return acoes;
}

/**
 * A nota do rodapé do painel de ações — o vale do dia.
 *
 * O verbo muda com a amostra: abaixo de `MIN_PEDIDOS_PRESCRICAO` ela DESCREVE o que
 * aconteceu; só com lastro ela manda evitar. "Evite 14h–16h" tirado de 1 pedido no mês
 * é ruído virando ordem.
 */
export function notaDoVale(
  resumo: ResumoHorarios,
  stats: EstatisticasHorarios
): { prescritiva: boolean; texto: string } | null {
  // Mesma regra das ações: sem lastro para a janela de ouro, não há vale para apontar.
  if (resumo.confianca === "insuficiente") return null;
  const fria = stats.janelaFria;
  if (!fria) return null;
  const faixa = `${rotuloHora(fria.inicio)}–${rotuloHora(fria.fim)}`;
  const quanto = `${BRL(fria.comissao)} em ${fria.pedidos} ${fria.pedidos === 1 ? "pedido" : "pedidos"}`;

  /*
   * A frase é COMPARATIVA, não absoluta. "R$ 781,23 é o buraco do seu dia" soa falso num
   * creator grande — R$ 781 não é buraco de nada. O que torna a janela fria informativa é
   * ela render uma fração do que as MESMAS três horas rendem no pico.
   */
  const janela = resumo.melhorJanela;
  const contra =
    janela && janela.comissao > 0
      ? ` — ${Math.round((fria.comissao / janela.comissao) * 100)}% do que as mesmas 3 horas rendem em ${rotuloHora(
          janela.inicio
        )}–${rotuloHora(janela.fim)}`
      : "";

  if (resumo.totalPedidos >= MIN_PEDIDOS_PRESCRICAO) {
    return { prescritiva: true, texto: `Evite ${faixa}: ${quanto}${contra}.` };
  }
  return {
    prescritiva: false,
    texto: `${faixa} foi o seu vale no período: ${quanto}${contra}. Com ${resumo.totalPedidos} pedidos ainda é cedo para tratar como regra.`,
  };
}

function BRL(v: number): string {
  try {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
  } catch {
    return `R$ ${v.toFixed(2)}`;
  }
}
