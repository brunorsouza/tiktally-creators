import { useMemo, useState } from "react";
import { ResponsiveContainer, BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { formatCurrency, formatNumber, formatPercent, abbreviateNumber } from "@/lib/formatters";
import {
  DIAS_CURTOS,
  NIVEIS_GRADE,
  horasDaJanela,
  rotuloHora,
  type CelulaGrade,
  type HoraBucket,
  type Janela,
} from "@/lib/horarios";
import { cn } from "@/lib/utils";

/**
 * Visuais da aba Horários. Ver docs/SPEC_MELHOR_HORARIO.md §7.
 *
 * Duas formas, dois papéis:
 * - `BarrasPorHora` (24 colunas) é a visão PRIMÁRIA — 24 baldes é a granularidade que a
 *   amostra de um creator típico aguenta.
 * - `GradeSemanal` (7×24) é secundária e só aparece com amostra grande: são 168 células,
 *   e abaixo disso o desenho é ruído.
 */

function money(valor: number, currency: string): string {
  try {
    return formatCurrency(valor, currency || "BRL");
  } catch {
    return `${valor.toFixed(2)} ${currency ?? ""}`.trim();
  }
}

// =============== Barras por hora (visão primária) ===============

/** `payload` vem tipado como `Payload<ValueType, NameType>[]` pelo Recharts (com
 *  `payload?: any` dentro), então o tipo aqui precisa ser largo o bastante para o
 *  spread de `content={...}` casar — a estreitada para `HoraBucket` é feita aqui. */
function BarraTooltip({
  active,
  payload,
  currency,
}: {
  active?: boolean;
  payload?: readonly { payload?: unknown }[];
  currency: string;
}) {
  const b = active ? (payload?.[0]?.payload as HoraBucket | undefined) : undefined;
  if (!b) return null;
  return (
    <div className="rounded-lg border bg-card px-3 py-2 text-xs shadow-sm">
      <p className="font-semibold">{rotuloHora(b.hora)}</p>
      <p className="mt-0.5 text-muted-foreground">
        {money(b.comissao, currency)} · {formatNumber(b.pedidos)} {b.pedidos === 1 ? "pedido" : "pedidos"}
      </p>
    </div>
  );
}

/**
 * Comissão por hora do dia, 24 colunas.
 *
 * Todas as barras usam UMA cor. Pintar cada barra pelo próprio valor gastaria o canal de
 * cor repetindo o que o comprimento da barra já diz; a cor cheia aqui marca só a janela
 * recomendada — é destaque da resposta, não codificação do dado.
 */
export function BarrasPorHora({
  horas,
  janela,
  currency,
  height = 220,
}: {
  horas: HoraBucket[];
  janela?: Janela;
  currency: string;
  height?: number;
}) {
  const destaque = useMemo(() => new Set(janela ? horasDaJanela(janela) : []), [janela]);
  const temDestaque = destaque.size > 0;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={horas} margin={{ top: 8, right: 8, left: 0, bottom: 0 }} barCategoryGap={2}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
        <XAxis
          dataKey="hora"
          tickFormatter={(h) => rotuloHora(Number(h))}
          tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
          stroke="hsl(var(--border))"
          interval={2}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
          tickFormatter={(v) => abbreviateNumber(Number(v))}
          stroke="hsl(var(--border))"
          width={52}
        />
        <Tooltip
          cursor={{ fill: "hsl(var(--muted) / 0.4)" }}
          content={(props) => <BarraTooltip {...props} currency={currency} />}
        />
        <Bar dataKey="comissao" radius={[4, 4, 0, 0]} isAnimationActive={false}>
          {horas.map((h) => (
            <Cell
              key={h.hora}
              // Sem janela recomendada (amostra insuficiente) nada é destacado: todas as
              // barras ficam cheias, para a tela não sugerir uma resposta que não temos.
              fill={!temDestaque || destaque.has(h.hora) ? "hsl(var(--primary))" : "hsl(var(--primary) / 0.28)"}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// =============== Grade dia × hora (secundária) ===============

/** Nível 0 = sem venda. `bg-muted/40` fica MAIS CLARO que o passo 1 nos dois temas —
 *  se virasse `bg-muted` cheio, a célula vazia leria como mais quente que a mais fria. */
const HEAT_BG = [
  "bg-muted/40",
  "bg-heat-1",
  "bg-heat-2",
  "bg-heat-3",
  "bg-heat-4",
  "bg-heat-5",
] as const;

function LegendaHeat() {
  return (
    <div className="flex items-center gap-1.5 text-[11px] text-faint">
      <span>menos</span>
      {Array.from({ length: NIVEIS_GRADE + 1 }, (_, n) => (
        <span key={n} className={cn("h-3 w-3 rounded-[3px]", HEAT_BG[n])} />
      ))}
      <span>mais</span>
    </div>
  );
}

/**
 * Heatmap 7×24. Aqui a cor É o canal de magnitude (não há comprimento para usar), então
 * usa a rampa sequencial de um tom só do DS (`--heat-1..5`).
 *
 * Nenhum número dentro das células: 168 rótulos seriam ilegíveis. A leitura exata mora no
 * readout ao passar o mouse, no `title` de cada célula e na tabela.
 */
export function GradeSemanal({ grade, currency }: { grade: CelulaGrade[]; currency: string }) {
  const [hover, setHover] = useState<CelulaGrade | null>(null);

  // O readout nunca fica vazio: sem mouse em cima, mostra a célula mais quente.
  const pico = useMemo(
    () => grade.reduce<CelulaGrade | null>((max, c) => (!max || c.comissao > max.comissao ? c : max), null),
    [grade]
  );
  const foco = hover ?? pico;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        {foco && foco.pedidos > 0 ? (
          <p className="text-[13px]">
            <span className="font-semibold">
              {DIAS_CURTOS[foco.dia]} · {rotuloHora(foco.hora)}
            </span>
            <span className="text-muted-foreground">
              {" — "}
              {money(foco.comissao, currency)} · {formatNumber(foco.pedidos)}{" "}
              {foco.pedidos === 1 ? "pedido" : "pedidos"}
            </span>
            {!hover && <span className="ml-1.5 text-faint">(pico)</span>}
          </p>
        ) : (
          <p className="text-[13px] text-muted-foreground">Passe o mouse nas células para ver o detalhe.</p>
        )}
        <LegendaHeat />
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[620px]" onMouseLeave={() => setHover(null)}>
          {/* régua de horas — de 3 em 3 para não colidir. O spacer repete a calha do
              rótulo do dia (w-9 + pr-1) para as colunas baterem com as células. */}
          <div className="mb-1 flex gap-[2px]">
            <span className="w-9 shrink-0 pr-1" />
            {Array.from({ length: 24 }, (_, h) => (
              <span key={h} className="flex-1 text-center text-[10px] leading-none text-faint">
                {h % 3 === 0 ? rotuloHora(h) : ""}
              </span>
            ))}
          </div>

          {DIAS_CURTOS.map((rotulo, dia) => (
            <div key={dia} className="mb-[2px] flex items-center gap-[2px]">
              <span className="w-9 shrink-0 pr-1 text-right text-[11px] font-medium text-muted-foreground">
                {rotulo}
              </span>
              {Array.from({ length: 24 }, (_, hora) => {
                const c = grade[dia * 24 + hora];
                return (
                  <span
                    key={hora}
                    className={cn(
                      "h-[19px] flex-1 rounded-[3px] transition-opacity hover:opacity-70",
                      HEAT_BG[c.nivel]
                    )}
                    title={`${rotulo} ${rotuloHora(hora)} — ${money(c.comissao, currency)} · ${formatNumber(
                      c.pedidos
                    )} pedido(s)`}
                    onMouseEnter={() => setHover(c)}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// =============== Tabela (mesma informação em texto) ===============

/** Equivalente textual do gráfico — conferência e acessibilidade. */
export function TabelaHorarios({
  horas,
  currency,
  total,
}: {
  horas: HoraBucket[];
  currency: string;
  total: number;
}) {
  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-sm">
        <thead className="bg-muted/40 text-left text-xs text-muted-foreground">
          <tr>
            <th className="px-3 py-2 font-medium">Hora</th>
            <th className="px-3 py-2 text-right font-medium">Pedidos</th>
            <th className="px-3 py-2 text-right font-medium">Comissão</th>
            <th className="px-3 py-2 text-right font-medium">Fatia</th>
          </tr>
        </thead>
        <tbody>
          {horas.map((h) => (
            <tr key={h.hora} className="border-t">
              <td className="px-3 py-1.5 font-medium">{rotuloHora(h.hora)}</td>
              <td className="num px-3 py-1.5 text-right">{formatNumber(h.pedidos)}</td>
              <td className="num px-3 py-1.5 text-right">{money(h.comissao, currency)}</td>
              <td className="num px-3 py-1.5 text-right text-muted-foreground">
                {total > 0 ? formatPercent(h.comissao / total) : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
