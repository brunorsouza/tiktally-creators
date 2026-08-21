import type { GanhosFilters } from "@/hooks/useGanhos";

export const DAY = 24 * 3600;

/**
 * Janela de N dias de CALENDÁRIO terminando em `endingAt`.
 *
 * Alinhar o início em 00:00 importa: uma janela de 7x24h termina no meio do dia e
 * atravessa 8 datas, então "7 dias" desenhava 8 barras no gráfico. Assim a contagem
 * de dias, os rótulos e as barras falam a mesma língua.
 */
export function periodOf(days: number, endingAt: number): GanhosFilters {
  const start = new Date(endingAt * 1000);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - (days - 1));
  return { createTimeGe: Math.floor(start.getTime() / 1000), createTimeLt: endingAt, pageSize: 100 };
}

/**
 * Períodos do painel inteiro (KPIs, saudação e gráfico).
 *
 * Duas naturezas: janela móvel ("últimos N dias", termina agora) e mês de calendário
 * ("este mês" / "mês passado"), que é o recorte usado pra fechar comissão.
 */
export type Period = { kind: "rolling"; days: number } | { kind: "month"; offset: number };

export const PANEL_PERIODS: { key: string; label: string }[] = [
  { key: "7d", label: "7 dias" },
  { key: "90d", label: "90 dias" },
  { key: "month", label: "Mês" },
];

export const ROLLING_DAYS: Record<string, number> = { "7d": 7, "90d": 90 };

/** "agosto" no ano corrente; "julho de 2025" quando for outro ano. */
export function monthName(d: Date, ref: Date): string {
  const opts: Intl.DateTimeFormatOptions =
    d.getFullYear() === ref.getFullYear() ? { month: "long" } : { month: "long", year: "numeric" };
  return new Intl.DateTimeFormat("pt-BR", opts).format(d);
}

/**
 * Resolve o período em duas janelas comparáveis (atual e anterior) mais os rótulos.
 * No mês corrente a janela termina AGORA, não no fim do mês — senão a comparação com
 * o mês anterior inteiro ficaria injusta; por isso o rótulo diz "mês parcial".
 */
export function resolvePeriod(p: Period, now: number) {
  if (p.kind === "rolling") {
    return {
      current: periodOf(p.days, now),
      previous: (() => {
        const atual = periodOf(p.days, now);
        return periodOf(p.days, atual.createTimeGe as number);
      })(),
      spanDays: p.days,
      subject: `últimos ${p.days} dias`,
      kpiLabel: `${p.days} dias`,
      deltaLabel: `vs. ${p.days} dias anteriores`,
    };
  }

  const ref = new Date(now * 1000);
  const start = new Date(ref.getFullYear(), ref.getMonth() - p.offset, 1);
  const nextStart = new Date(ref.getFullYear(), ref.getMonth() - p.offset + 1, 1);
  const prevStart = new Date(ref.getFullYear(), ref.getMonth() - p.offset - 1, 1);

  const ge = Math.floor(start.getTime() / 1000);
  const lt = Math.min(Math.floor(nextStart.getTime() / 1000), now);
  const parcial = lt < Math.floor(nextStart.getTime() / 1000);
  const nome = monthName(start, ref);

  return {
    current: { createTimeGe: ge, createTimeLt: lt, pageSize: 100 },
    previous: {
      createTimeGe: Math.floor(prevStart.getTime() / 1000),
      createTimeLt: ge,
      pageSize: 100,
    },
    spanDays: Math.max(1, Math.ceil((lt - ge) / DAY)),
    subject: parcial ? `${nome} (até hoje)` : `${nome}`,
    kpiLabel: nome,
    deltaLabel: "vs. mês anterior",
  };
}
