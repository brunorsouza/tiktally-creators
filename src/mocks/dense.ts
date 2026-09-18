import type { SearchCreatorAffiliateOrdersData } from "@/types/creator-api.generated";
import type { EndpointKey } from "@/api/endpoints.generated";

/**
 * Mock denso — OPT-IN via `VITE_MOCK_DENSE=true`.
 *
 * Por que existe: o fixture gerado da doc tem 13 pedidos em ~19 dias. Dá para conferir
 * um campo, mas não dá para desenhar nem revisar a aba Horários, que precisa de volume
 * (24 baldes de hora, 168 células de dia×hora) — com 13 pedidos a tela mostra, com razão,
 * o estado de "amostra insuficiente", e nunca se vê o resto da feature.
 *
 * Por que é opt-in e não o default: `searchCreatorAffiliateOrders` alimenta Painel,
 * Ganhos e Ranking também. Trocar o fixture por padrão mudaria os números de todas essas
 * telas em mock, o que ninguém pediu. Com a flag desligada nada muda; com ela ligada
 * todas as telas ficam mais realistas de uma vez.
 *
 *   VITE_MOCK_DENSE=true npm run dev
 */
export const MOCK_DENSE = import.meta.env.VITE_MOCK_DENSE === "true";

/** PRNG determinístico — o mesmo dev vê os mesmos números entre reloads. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Pesos de hora do dia por origem — o ponto do mock denso.
 *
 * LIVE é concentrada (o creator transmite à noite, com um bloco menor no almoço), porque
 * o pedido de live nasce DURANTE a transmissão. VIDEO é espalhada, porque o pedido chega
 * por dias depois do post. É essa diferença que a aba Horários precisa mostrar, então o
 * mock tem que contê-la — senão o split LIVE/VÍDEO não se distingue na tela.
 */
const PESOS_HORA: Record<string, number[]> = {
  //         0  1  2  3  4  5  6  7  8  9 10 11 12 13 14 15 16 17 18 19 20 21 22 23
  LIVE: [1, 0, 0, 0, 0, 0, 0, 1, 2, 3, 3, 4, 9, 8, 3, 2, 2, 3, 6, 18, 24, 22, 12, 4],
  VIDEO: [6, 4, 2, 1, 1, 1, 2, 5, 7, 8, 8, 9, 10, 9, 8, 8, 9, 10, 12, 15, 18, 19, 16, 10],
  SHOP: [4, 3, 2, 1, 1, 1, 2, 4, 6, 7, 8, 8, 9, 8, 7, 7, 7, 8, 9, 11, 12, 12, 9, 6],
  LINKSHARE: [3, 2, 1, 1, 1, 1, 2, 4, 6, 7, 7, 8, 8, 8, 7, 7, 7, 8, 9, 10, 11, 10, 8, 5],
};

const ORIGENS: { tipo: keyof typeof PESOS_HORA; peso: number; ids: string[] }[] = [
  {
    tipo: "VIDEO",
    peso: 45,
    ids: [
      "7271486684427046149",
      "7283910044120398338",
      "7291002847712398211",
      "7299771120045982745",
      "7305664209981123097",
      "7312889441002391044",
      "7320117744192003182",
      "7329004471120983055",
    ],
  },
  {
    tipo: "LIVE",
    peso: 33,
    ids: [
      "7493990579714164574",
      "7495117002348871233",
      "7497330011298471620",
      "7499884120037718009",
      "7502119874003912558",
    ],
  },
  { tipo: "SHOP", peso: 16, ids: ["", ""] },
  { tipo: "LINKSHARE", peso: 6, ids: ["lnk_9f21", "lnk_4c88"] },
];

const PRODUTOS = [
  { nome: "Máscara Facial Argila Verde", id: "1729793769377859852", loja: "Bella Store", preco: 49.9 },
  { nome: "Sérum Vitamina C 30ml", id: "6200011293847520011", loja: "Bella Store", preco: 89.9 },
  { nome: "Protetor Solar FPS 60 Toque Seco", id: "6200011293847520012", loja: "Derma Brasil", preco: 74.5 },
  { nome: "Kit Escova Secadora 3 em 1", id: "6200011293847520013", loja: "Casa & Cia", preco: 199.9 },
  { nome: "Batom Líquido Matte Nude", id: "6200011293847520014", loja: "Bella Store", preco: 29.9 },
  { nome: "Creme Hidratante Corporal 400ml", id: "6200011293847520015", loja: "Derma Brasil", preco: 39.9 },
  { nome: "Óleo Capilar Reparador", id: "6200011293847520016", loja: "Hair Lab", preco: 59.9 },
  { nome: "Pó Compacto Matte", id: "6200011293847520017", loja: "Bella Store", preco: 44.9 },
];

const STATUS: { valor: string; peso: number }[] = [
  { valor: "SETTLED", peso: 58 },
  { valor: "TO-SETTLE", peso: 30 },
  { valor: "AWAITING PAYMENT", peso: 8 },
  { valor: "REFUNDED", peso: 4 },
];

function escolherPorPeso<T>(itens: T[], pesos: number[], r: number): T {
  const total = pesos.reduce((s, p) => s + p, 0);
  let alvo = r * total;
  for (let i = 0; i < itens.length; i++) {
    alvo -= pesos[i];
    if (alvo <= 0) return itens[i];
  }
  return itens[itens.length - 1];
}

const DIAS = 90;
const BRL = (n: number) => n.toFixed(2);

type Pedido = NonNullable<SearchCreatorAffiliateOrdersData["orders"]>[number];

/**
 * ~450 pedidos nos últimos 90 dias.
 *
 * Os timestamps são montados a partir da HORA LOCAL pretendida (`setHours`) e só então
 * convertidos para Unix — assim o padrão de horário aparece como desenhado em qualquer
 * fuso em que o dev rode o app, que é justamente o que a tela precisa demonstrar.
 */
function gerarPedidos(): Pedido[] {
  const rnd = mulberry32(20260918);
  const pedidos: Pedido[] = [];
  const agora = new Date();

  for (let diasAtras = DIAS - 1; diasAtras >= 0; diasAtras--) {
    const base = new Date(agora);
    base.setDate(base.getDate() - diasAtras);
    base.setHours(0, 0, 0, 0);

    // fim de semana vende um pouco mais; o resto é ruído do dia
    const fimDeSemana = base.getDay() === 0 || base.getDay() === 6;
    const qtd = Math.round((fimDeSemana ? 6.2 : 4.6) * (0.55 + rnd()));

    for (let i = 0; i < qtd; i++) {
      const origem = escolherPorPeso(
        ORIGENS,
        ORIGENS.map((o) => o.peso),
        rnd()
      );
      const hora = escolherPorPeso(
        Array.from({ length: 24 }, (_, h) => h),
        PESOS_HORA[origem.tipo],
        rnd()
      );
      const produto = PRODUTOS[Math.floor(rnd() * PRODUTOS.length)];
      const status = escolherPorPeso(
        STATUS.map((s) => s.valor),
        STATUS.map((s) => s.peso),
        rnd()
      );

      const quando = new Date(base);
      quando.setHours(hora, Math.floor(rnd() * 60), Math.floor(rnd() * 60), 0);
      const createTime = Math.floor(quando.getTime() / 1000);
      if (createTime > Math.floor(agora.getTime() / 1000)) continue;

      const quantidade = rnd() < 0.78 ? 1 : rnd() < 0.85 ? 2 : 3;
      const rate = 800 + Math.floor(rnd() * 1300); // 8%–21% em centésimos de %
      const devolvidos = status === "REFUNDED" ? quantidade : 0;
      const baseVenda = produto.preco * (quantidade - devolvidos);
      const comissao = (baseVenda * rate) / 10000;
      const liquidado = status === "SETTLED";
      const contentId = origem.ids[Math.floor(rnd() * origem.ids.length)];

      pedidos.push({
        id: `80${String(createTime)}${String(i).padStart(2, "0")}`,
        create_time: createTime,
        status,
        skus: [
          {
            id: `9${String(createTime).slice(-9)}${i}`,
            product_name: produto.nome,
            product_id: produto.id,
            price: { amount: BRL(produto.preco), currency: "BRL" },
            shop_name: produto.loja,
            content_type: origem.tipo,
            ...(contentId ? { content_id: contentId } : {}),
            quantity: quantidade,
            commission_rate: rate,
            estimated_commission_base: { amount: BRL(produto.preco * quantidade), currency: "BRL" },
            estimated_commission: {
              amount: BRL((produto.preco * quantidade * rate) / 10000),
              currency: "BRL",
            },
            ...(liquidado
              ? {
                  actual_commission_base: { amount: BRL(baseVenda), currency: "BRL" },
                  actual_commission: { amount: BRL(comissao), currency: "BRL" },
                }
              : {}),
            returned_quantity: devolvidos,
            refunded_quantity: 0,
          },
        ],
      });
    }
  }

  return pedidos.sort((a, b) => (b.create_time ?? 0) - (a.create_time ?? 0));
}

let cache: Pedido[] | null = null;

function pedidosDensos(): Pedido[] {
  if (!cache) cache = gerarPedidos();
  return cache;
}

/**
 * Resposta de mock para um endpoint, quando o modo denso estiver ligado.
 * Devolve `null` quando não há override — aí vale o fixture gerado da doc.
 *
 * Diferente do fixture estático, aqui o recorte de data do body É respeitado, porque a
 * série cobre 90 dias: sem isso, trocar o período no seletor não mudaria nada na tela.
 */
export function mockOverride(
  key: EndpointKey,
  params: { body?: Record<string, unknown> }
): unknown | null {
  if (!MOCK_DENSE || key !== "searchCreatorAffiliateOrders") return null;

  const ge = Number(params.body?.create_time_ge ?? 0);
  const lt = Number(params.body?.create_time_lt ?? Number.MAX_SAFE_INTEGER);
  const orders = pedidosDensos().filter((o) => {
    const t = o.create_time ?? 0;
    return t >= ge && t < lt;
  });

  return { orders, total_count: orders.length } satisfies SearchCreatorAffiliateOrdersData;
}
