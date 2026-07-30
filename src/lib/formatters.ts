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
export function formatMoney(money?: { amount?: string | number; currency?: string } | null): string {
  if (!money || money.amount == null) return "—";
  const n = typeof money.amount === "string" ? parseFloat(money.amount) : money.amount;
  return formatCurrency(n, money.currency || "BRL");
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
