import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PANEL_PERIODS } from "@/lib/period";

/**
 * Seletor de período compartilhado entre Painel e Ganhos.
 *
 * Existe para as duas telas concordarem: antes cada uma tinha o seu, com janelas
 * calculadas de formas diferentes (uma alinhada ao início do dia, outra em blocos de
 * 24h), e o mesmo "30 dias" devolvia contagens diferentes em cada tela.
 */
export function PeriodPicker({
  periodKey,
  onPeriodKey,
  monthOffset,
  onMonthOffset,
  monthLabel,
}: {
  periodKey: string;
  onPeriodKey: (key: string) => void;
  monthOffset: number;
  onMonthOffset: (offset: number) => void;
  /** Nome do mês em foco, já formatado (ex.: "agosto" ou "julho de 2025"). */
  monthLabel: string;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="segmented" role="tablist" aria-label="Período">
        {PANEL_PERIODS.map((o) => (
          <button
            key={o.key}
            type="button"
            role="tab"
            aria-selected={periodKey === o.key}
            onClick={() => onPeriodKey(o.key)}
            className="segmented-item"
          >
            {o.label}
          </button>
        ))}
      </div>

      {periodKey === "month" && (
        <div className="flex items-center gap-1" aria-label="Escolher o mês">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            aria-label="Mês anterior"
            onClick={() => onMonthOffset(monthOffset + 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="min-w-[124px] text-center text-sm font-semibold capitalize">{monthLabel}</span>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            aria-label="Próximo mês"
            disabled={monthOffset === 0}
            onClick={() => onMonthOffset(Math.max(0, monthOffset - 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
