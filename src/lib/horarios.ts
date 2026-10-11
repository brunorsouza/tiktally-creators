/**
 * Melhor Horário: agregação de vendas por hora do dia e por dia×hora.
 *
 * Camada PURA (sem React, sem API): recebe vendas já extraídas dos pedidos e devolve
 * os baldes, a melhor janela e o nível de confiança. Ver docs/SPEC_MELHOR_HORARIO.md.
 *
 * O que este módulo NÃO é: um "melhor horário para postar". Nenhuma API de creator
 * devolve a hora de publicação de um vídeo, então o que medimos aqui é a hora em que a
 * VENDA aconteceu. Para LIVE isso é praticamente a mesma coisa (o pedido nasce durante a
 * transmissão); para VÍDEO não é: os pedidos pingam por dias depois do post. Quem faz
 * essa distinção virar texto na tela é a aba Horários (spec §4).
 */

/** Uma venda reduzida ao mínimo necessário para o cálculo de horário. */
export interface Venda {
  /** `create_time` do pedido, Unix em segundos, UTC+0 (como a API devolve). */
  timestamp: number;
  /** Comissão da SKU em R$, já resolvida (actual quando liquidada, senão estimada). */
  comissao: number;
  /** `content_type` da SKU: VIDEO, LIVE, SHOP, LINKSHARE… */
  contentType?: string;
}

export const CONTENT_FILTERS = ["tudo", "live", "video"] as const;
export type ContentFilter = (typeof CONTENT_FILTERS)[number];

export type Confianca = "insuficiente" | "baixa" | "media" | "alta";

/**
 * Guard-rails de amostra (spec §6.4).
 *
 * Sem eles a feature mente: 24 baldes já é pouco, e a grade de 7×24 são 168 células;
 * um creator de 300 pedidos tem ~1,8 pedido por célula, ou seja, ruído. Abaixo do mínimo
 * a tela mostra o aviso em vez de uma recomendação inventada.
 */
export const MIN_PEDIDOS_RECOMENDACAO = 30;
export const MIN_PEDIDOS_GRADE = 200;

/** Recomendamos uma janela de 3h, não uma hora exata: é mais robusta e mais acionável. */
export const JANELA_HORAS = 3;

/** Níveis de cor do heatmap (0 = célula vazia). */
export const NIVEIS_GRADE = 5;

export interface HoraBucket {
  /** 0–23, já no fuso do creator. */
  hora: number;
  pedidos: number;
  comissao: number;
}

export interface CelulaGrade {
  /** 0 = domingo … 6 = sábado (mesma convenção de `Date.getDay`). */
  dia: number;
  hora: number;
  pedidos: number;
  comissao: number;
  /** 0 = vazia; 1–5 = quintil de intensidade entre as células com venda. */
  nivel: number;
}

export interface Janela {
  /** Hora inicial (0–23). A janela é circular: 23 + 3h cobre 23, 0 e 1. */
  inicio: number;
  /** Última hora coberta (0–23). */
  fim: number;
  comissao: number;
  pedidos: number;
  /** Fatia da comissão total do período que cai nesta janela (0–1). */
  share: number;
}

export interface ResumoHorarios {
  /** Sempre 24 posições, na ordem 0h → 23h. */
  horas: HoraBucket[];
  /** Sempre 168 células (7 dias × 24 horas). */
  grade: CelulaGrade[];
  totalPedidos: number;
  totalComissao: number;
  /** Vendas ignoradas por não terem `create_time` utilizável. */
  descartados: number;
  confianca: Confianca;
  /** A grade 7×24 tem amostra suficiente para ser exibida? */
  gradeDisponivel: boolean;
  /** Ausente quando a confiança é `insuficiente`; nesse caso não recomendamos nada. */
  melhorJanela?: Janela;
  /** Fuso efetivamente usado na conversão (ex.: "America/Sao_Paulo"). */
  timeZone: string;
}

/** O fuso do dispositivo do creator, exibido na tela para o número nunca ser ambíguo. */
export function fusoDoDispositivo(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "America/Sao_Paulo";
  } catch {
    return "America/Sao_Paulo";
  }
}

const WEEKDAY_INDEX: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

/**
 * Formatter memoizado por fuso.
 *
 * `create_time` é UTC+0 (explícito na doc da API) e o creator lê a tela no fuso dele.
 * Sem essa conversão TODA recomendação sai 3h errada em BR, e silenciosamente: a tela
 * continua parecendo perfeita. Por isso o fuso é explícito aqui e visível na UI.
 */
const formatterCache = new Map<string, Intl.DateTimeFormat>();

function formatterDe(timeZone: string): Intl.DateTimeFormat {
  const cached = formatterCache.get(timeZone);
  if (cached) return cached;
  // `hourCycle: "h23"` em vez de `hour12: false`: sem ele, meia-noite vira "24" em
  // alguns motores e o balde de 0h fica vazio.
  const f = new Intl.DateTimeFormat("en-US", {
    timeZone,
    weekday: "short",
    hour: "2-digit",
    hourCycle: "h23",
  });
  formatterCache.set(timeZone, f);
  return f;
}

/** Hora (0–23) e dia da semana (0–6) de um Unix timestamp, no fuso pedido. */
export function partesNoFuso(timestamp: number, timeZone: string): { hora: number; dia: number } | null {
  if (!Number.isFinite(timestamp) || timestamp <= 0) return null;
  try {
    const parts = formatterDe(timeZone).formatToParts(new Date(timestamp * 1000));
    let hora = NaN;
    let dia = NaN;
    for (const p of parts) {
      if (p.type === "hour") hora = Number(p.value) % 24;
      else if (p.type === "weekday") dia = WEEKDAY_INDEX[p.value] ?? NaN;
    }
    if (!Number.isFinite(hora) || !Number.isFinite(dia)) return null;
    return { hora, dia };
  } catch {
    return null;
  }
}

export function classificarConfianca(pedidos: number): Confianca {
  if (pedidos < MIN_PEDIDOS_RECOMENDACAO) return "insuficiente";
  if (pedidos < 100) return "baixa";
  if (pedidos < 300) return "media";
  return "alta";
}

/** A venda entra no recorte escolhido? `tudo` inclui SHOP/LINKSHARE, que não são conteúdo. */
export function passaNoFiltro(contentType: string | undefined, filtro: ContentFilter): boolean {
  if (filtro === "tudo") return true;
  if (filtro === "live") return contentType === "LIVE";
  return contentType === "VIDEO";
}

/**
 * Melhor janela contígua de N horas, por soma móvel CIRCULAR.
 *
 * Circular porque o dia dá a volta: uma conta que vende das 23h às 1h tem a melhor
 * janela atravessando a meia-noite, e uma soma linear nunca a encontraria.
 */
export function melhorJanelaDe(horas: HoraBucket[], tamanho = JANELA_HORAS): Janela | undefined {
  if (horas.length !== 24 || tamanho < 1 || tamanho > 24) return undefined;
  const total = horas.reduce((s, h) => s + h.comissao, 0);

  let melhor: Janela | undefined;
  for (let inicio = 0; inicio < 24; inicio++) {
    let comissao = 0;
    let pedidos = 0;
    for (let k = 0; k < tamanho; k++) {
      const b = horas[(inicio + k) % 24];
      comissao += b.comissao;
      pedidos += b.pedidos;
    }
    // Empate em comissão (comum quando tudo é zero) desempata por nº de pedidos.
    const ganha =
      !melhor || comissao > melhor.comissao || (comissao === melhor.comissao && pedidos > melhor.pedidos);
    if (ganha) {
      melhor = {
        inicio,
        fim: (inicio + tamanho - 1) % 24,
        comissao,
        pedidos,
        share: total > 0 ? comissao / total : 0,
      };
    }
  }
  return melhor;
}

/**
 * Nível de cor de cada célula: escala de MAGNITUDE, ancorada no percentil 95.
 *
 * Por que não quintil (corte por posição, 20% das células em cada nível): quintil
 * *garante* que 20% das células saiam no nível máximo, tenham elas magnitude relevante
 * ou não. Numa grade de 168 células com poucos pedidos por célula, isso pinta ruído de
 * vermelho vivo, que é fabricar sinal, exatamente o que esta feature existe para não fazer.
 *
 * Por que percentil 95 e não o máximo: uma única venda gorda achataria todo o resto no
 * nível 1. Acima da referência a escala satura no nível 5.
 */
function aplicarNiveis(celulas: { comissao: number; nivel: number }[]): void {
  const valores = celulas.filter((c) => c.comissao > 0).map((c) => c.comissao).sort((a, b) => a - b);
  if (!valores.length) return;

  const ref = valores[Math.min(valores.length - 1, Math.floor(valores.length * 0.95))];
  if (!(ref > 0)) return;

  for (const c of celulas) {
    c.nivel =
      c.comissao <= 0
        ? 0
        : Math.min(NIVEIS_GRADE, Math.max(1, Math.ceil((c.comissao / ref) * NIVEIS_GRADE)));
  }
}

/**
 * Agrega as vendas em 24 baldes de hora + a grade de 7×24.
 *
 * Por que somar totais por hora já é comparável, sem normalizar: em qualquer período
 * cada hora do dia ocorre uma vez por dia, então as 24 horas aparecem o mesmo número de
 * vezes (o mesmo vale para cada célula de dia×hora, ~N/7 vezes).
 */
export function resumirHorarios(
  vendas: Venda[],
  opts: { timeZone: string; filtro: ContentFilter }
): ResumoHorarios {
  const { timeZone, filtro } = opts;

  const horas: HoraBucket[] = Array.from({ length: 24 }, (_, hora) => ({ hora, pedidos: 0, comissao: 0 }));
  const grade: CelulaGrade[] = [];
  for (let dia = 0; dia < 7; dia++) {
    for (let hora = 0; hora < 24; hora++) grade.push({ dia, hora, pedidos: 0, comissao: 0, nivel: 0 });
  }

  let totalPedidos = 0;
  let totalComissao = 0;
  let descartados = 0;

  for (const v of vendas) {
    if (!passaNoFiltro(v.contentType, filtro)) continue;
    const p = partesNoFuso(v.timestamp, timeZone);
    if (!p) {
      descartados += 1;
      continue;
    }
    const comissao = Number.isFinite(v.comissao) ? v.comissao : 0;

    horas[p.hora].pedidos += 1;
    horas[p.hora].comissao += comissao;

    const celula = grade[p.dia * 24 + p.hora];
    celula.pedidos += 1;
    celula.comissao += comissao;

    totalPedidos += 1;
    totalComissao += comissao;
  }

  aplicarNiveis(grade);

  const confianca = classificarConfianca(totalPedidos);

  return {
    horas,
    grade,
    totalPedidos,
    totalComissao,
    descartados,
    confianca,
    gradeDisponivel: totalPedidos >= MIN_PEDIDOS_GRADE,
    // Abaixo do mínimo não recomendamos NADA. É o guard-rail que impede o app de mandar
    // um creator de 12 pedidos postar às 3h da manhã.
    melhorJanela: confianca === "insuficiente" ? undefined : melhorJanelaDe(horas),
    timeZone,
  };
}

// =============== Rótulos ===============

export function rotuloHora(hora: number): string {
  return `${String(hora).padStart(2, "0")}h`;
}

export function rotuloJanela(j: Janela): string {
  return `${rotuloHora(j.inicio)}–${rotuloHora(j.fim)}`;
}

/** A janela é circular, então "23h–01h" cobre 23, 0 e 1; este helper resolve a volta. */
export function horasDaJanela(j: Janela): number[] {
  const horas: number[] = [];
  let h = j.inicio;
  for (;;) {
    horas.push(h);
    if (h === j.fim) break;
    h = (h + 1) % 24;
  }
  return horas;
}

export const DIAS_CURTOS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"] as const;

export const CONFIANCA_LABEL: Record<Confianca, string> = {
  insuficiente: "Dados insuficientes",
  baixa: "Confiança baixa",
  media: "Confiança média",
  alta: "Confiança alta",
};

/**
 * Como a tela deve LER o recorte escolhido (spec §4). É a parte que impede a feature de
 * mentir. Em LIVE o pedido nasce durante a transmissão, então recomendar horário de
 * transmissão é legítimo. Em VÍDEO o pedido chega dias depois do post, então o mesmo
 * cálculo só diz quando o público compra, nunca quando postar.
 */
export const LEITURA: Record<ContentFilter, { titulo: string; explicacao: string; recomenda: boolean }> = {
  tudo: {
    titulo: "Quando suas vendas acontecem",
    explicacao:
      "Soma tudo: live, vídeo, vitrine e links. Mostra em que horas o seu público costuma comprar.",
    recomenda: false,
  },
  live: {
    titulo: "Melhor horário para transmitir",
    explicacao:
      "Pedidos de live nascem durante a transmissão, então a hora do pedido é praticamente a hora da live. Aqui a recomendação vale como horário de transmissão.",
    recomenda: true,
  },
  video: {
    titulo: "Quando seu público compra",
    explicacao:
      "Isto NÃO é a melhor hora para postar: as vendas de um vídeo chegam ao longo de vários dias depois da publicação, então a hora da venda não diz a hora do post. O TikTok não informa a que horas cada vídeo foi publicado.",
    recomenda: false,
  },
};

// =============== Blocos do dia (grade 7 × 4) ===============

/**
 * A grade de 28 células (7 dias × 4 blocos) em vez de 168 (7 × 24).
 *
 * É o recorte que a amostra de um creator real sustenta: com 33 pedidos, 168 células dão
 * 0,2 pedido por célula (desenho é ruído puro), enquanto 28 células dão ~1,2. Ainda é pouco,
 * mas já é tendência legível, e a tela diz isso em vez de esconder. A grade cheia
 * de 24h continua existindo atrás de um link, para quem tem volume (MIN_PEDIDOS_GRADE).
 */
export const BLOCOS = [
  { key: "noite", label: "Noite", faixa: "18h–00h", inicio: 18, fim: 24 },
  { key: "tarde", label: "Tarde", faixa: "12h–18h", inicio: 12, fim: 18 },
  { key: "manha", label: "Manhã", faixa: "06h–12h", inicio: 6, fim: 12 },
  { key: "madrugada", label: "Madrugada", faixa: "00h–06h", inicio: 0, fim: 6 },
] as const;

/** Índice de `BLOCOS` para cada hora do dia. */
function blocoDaHora(hora: number): number {
  return BLOCOS.findIndex((b) => hora >= b.inicio && hora < b.fim);
}

export interface CelulaBloco {
  /** 0 = domingo … 6 = sábado. */
  dia: number;
  /** Índice em `BLOCOS` (0 = Noite … 3 = Madrugada). */
  bloco: number;
  pedidos: number;
  comissao: number;
  nivel: number;
}

/** Ordem de exibição da semana: segunda primeiro (a semana de trabalho do creator). */
export const DIAS_ORDEM = [1, 2, 3, 4, 5, 6, 0] as const;

/** Com menos que isto nem a grade de 28 células se sustenta; é o mesmo piso da recomendação. */
export const MIN_PEDIDOS_BLOCOS = MIN_PEDIDOS_RECOMENDACAO;

/** Dobra a grade de 168 células nas 28 de dia × bloco. */
export function resumirBlocos(grade: CelulaGrade[]): CelulaBloco[] {
  const out: CelulaBloco[] = [];
  for (let dia = 0; dia < 7; dia++) {
    for (let bloco = 0; bloco < BLOCOS.length; bloco++) {
      out.push({ dia, bloco, pedidos: 0, comissao: 0, nivel: 0 });
    }
  }
  for (const c of grade) {
    const b = blocoDaHora(c.hora);
    if (b < 0) continue;
    const alvo = out[c.dia * BLOCOS.length + b];
    alvo.pedidos += c.pedidos;
    alvo.comissao += c.comissao;
  }
  aplicarNiveis(out);
  return out;
}

/** Célula de `resumirBlocos` para um par (dia, bloco). */
export function celulaBloco(blocos: CelulaBloco[], dia: number, bloco: number): CelulaBloco {
  return blocos[dia * BLOCOS.length + bloco];
}

export const DIAS_LONGOS = [
  "domingo",
  "segunda",
  "terça",
  "quarta",
  "quinta",
  "sexta",
  "sábado",
] as const;
