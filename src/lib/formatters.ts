/**
 * Formatters — padrão TikTally (pt-BR, BRL por default).
 *
 * A Affiliate Creator API devolve valores como objeto { amount, currency }
 * (ex.: { amount: "12.90", currency: "BRL" }). `formatMoney` lida com isso
 * direto; `formatCurrency` recebe número + código de moeda.
 */

export function formatCurrency(value: number, currency = "BRL"): string {
  if (value == null || Number.isNaN(value)) return "—";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency,
  }).format(value);
}

/** Recebe o objeto { amount, currency } que a API do TikTok retorna. */
/**
 * Converte o `amount` da API em número.
 *
 * A Affiliate Creator API devolve valores JÁ FORMATADOS na moeda da loja
 * ("R$ 14,99", "R$ 1.499,00", "Rp9.900"), não em decimal cru. Um `parseFloat`
 * direto erra feio: "R$ 14,99" vira 1499 (100x maior) e "R$ 1.499,00" vira 1.499
 * (1000x menor), porque o separador decimal vira ruído.
 *
 * Regra: o último separador é decimal apenas quando sobram 1 ou 2 dígitos depois
 * dele; caso contrário todos os separadores são de milhar.
 */
export function parseAmount(amount?: string | number | null): number {
  if (amount == null) return 0;
  if (typeof amount === "number") return Number.isFinite(amount) ? amount : 0;

  const cleaned = amount.replace(/[^0-9,.-]/g, "");
  if (!cleaned) return 0;

  const lastComma = cleaned.lastIndexOf(",");
  const lastDot = cleaned.lastIndexOf(".");
  const sepIndex = Math.max(lastComma, lastDot);

  let normalized: string;
  if (sepIndex === -1) {
    normalized = cleaned;
  } else {
    const decimals = cleaned.length - sepIndex - 1;
    if (decimals === 1 || decimals === 2) {
      // separador decimal de verdade — o resto é milhar
      normalized = cleaned.slice(0, sepIndex).replace(/[.,]/g, "") + "." + cleaned.slice(sepIndex + 1);
    } else {
      normalized = cleaned.replace(/[.,]/g, "");
    }
  }

  const n = parseFloat(normalized);
  return Number.isFinite(n) ? n : 0;
}

export function formatMoney(money?: { amount?: string | number; currency?: string } | null): string {
  if (!money || money.amount == null) return "—";
  return formatCurrency(parseAmount(money.amount), money.currency || "BRL");
}

export function formatNumber(value: number): string {
  if (value == null || Number.isNaN(value)) return "—";
  return new Intl.NumberFormat("pt-BR").format(value);
}

/** 1.234 → "1,2K", 1.500.000 → "1,5M". */
export function abbreviateNumber(value: number): string {
  if (value == null || Number.isNaN(value)) return "—";
  const abs = Math.abs(value);
  if (abs >= 1_000_000) return (value / 1_000_000).toFixed(1).replace(".", ",") + "M";
  if (abs >= 1_000) return (value / 1_000).toFixed(1).replace(".", ",") + "K";
  return String(value);
}

export function formatPercent(value: number, digits = 1): string {
  if (value == null || Number.isNaN(value)) return "—";
  return new Intl.NumberFormat("pt-BR", {
    style: "percent",
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
}

/** Aceita Date, ISO string, ou Unix timestamp (segundos). */
export function formatDate(date: Date | string | number): string {
  const d = toDate(date);
  if (!d) return "—";
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" }).format(d);
}

export function formatDateTime(date: Date | string | number): string {
  const d = toDate(date);
  if (!d) return "—";
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(d);
}

function toDate(date: Date | string | number): Date | null {
  if (date == null) return null;
  if (date instanceof Date) return date;
  if (typeof date === "number") {
    // Unix em segundos (padrão da TikTok API) vs. ms
    return new Date(date < 1e12 ? date * 1000 : date);
  }
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}
