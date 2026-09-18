import { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceArea,
  ReferenceLine,
  LabelList,
} from "recharts";
import { formatCurrency, formatNumber, formatPercent, abbreviateNumber } from "@/lib/formatters";
import {
  BLOCOS,
  DIAS_CURTOS,
  DIAS_ORDEM,
  NIVEIS_GRADE,
  celulaBloco,
  horasDaJanela,
  rotuloHora,
  type CelulaBloco,
  type CelulaGrade,
  type HoraBucket,
  type Janela,
} from "@/lib/horarios";
import { cn } from "@/lib/utils";

/**
 * Visuais da aba Horários. Ver docs/SPEC_MELHOR_HORARIO.md §7.
 *
 * Três formas, três papéis:
 * - `BarrasPorHora` (24 colunas) — visão primária: a forma do dia.
 * - `GradeBlocos` (7 × 4 = 28 células) — a semana no recorte que a amostra sustenta.
 * - `GradeSemanal` (7 × 24 = 168) — a grade cheia, só para quem tem volume de verdade.
 */

function money(valor: number, currency: string): string {
  try {
    return formatCurrency(valor, currency || "BRL");
  } catch {
    return `${valor.toFixed(2)} ${currency ?? ""}`.trim();
  }
}

/** A métrica que as barras desenham — comissão em R$ ou contagem de pedidos. */
export type MetricaHora = "comissao" | "pedidos";

// =============== Barras por hora (visão primária) ===============

interface PontoHora extends HoraBucket {
  /** Valor plotado, conforme a métrica escolhida. */
  valor: number;
  /**
   * Altura mínima desenhada nas horas SEM pedido. Vai numa série empilhada própria para
   * a hora vazia virar um traço na linha de base em vez de um buraco: ausência de venda
   * e ausência de dado não podem ler igual num gráfico que o creator usa para decidir.
   */
  traco: number;
}

function TooltipHora({
  active,
  payload,
  currency,
}: {
  active?: boolean;
  payload?: readonly { payload?: unknown }[];
  currency: string;
}) {
  const p = active ? (payload?.[0]?.payload as PontoHora | undefined) : undefined;
  if (!p) return null;
  const ticket = p.pedidos > 0 ? p.comissao / p.pedidos : 0;
  return (
    <div className="rounded-lg border bg-card px-3 py-2 text-xs shadow-sm">
      <p className="font-semibold">{rotuloHora(p.hora)}</p>
      {p.pedidos === 0 ? (
        <p className="mt-0.5 text-muted-foreground">Nenhum pedido nesta hora.</p>
      ) : (
        <p className="mt-0.5 text-muted-foreground">
          {money(p.comissao, currency)} · {formatNumber(p.pedidos)}{" "}
          {p.pedidos === 1 ? "pedido" : "pedidos"} · {money(ticket, currency)}/pedido
        </p>
      )}
    </div>
  );
}

/**
 * Comissão (ou pedidos) por hora do dia.
 *
 * Todas as barras usam UMA cor; a cor cheia marca só a janela recomendada. Pintar cada
 * barra pelo próprio valor gastaria o canal de cor repetindo o que a altura já diz.
 *
 * O eixo X é numérico (e não de categoria) para a faixa da janela poder cair exatamente
 * nas bordas das barras — num eixo de categoria ela cortaria a primeira e a última ao
 * meio.
 */
export function BarrasPorHora({
  horas,
  janela,
  currency,
  metrica = "comissao",
  media,
  height = 260,
}: {
  horas: HoraBucket[];
  janela?: Janela;
  currency: string;
  metrica?: MetricaHora;
  /** Linha de referência: comissão média das horas ativas. Só faz sentido em R$. */
  media?: number;
  height?: number;
}) {
  const destaque = useMemo(() => new Set(janela ? horasDaJanela(janela) : []), [janela]);
  const temDestaque = destaque.size > 0;

  const { dados, rotulados } = useMemo(() => {
    const max = Math.max(...horas.map((h) => (metrica === "comissao" ? h.comissao : h.pedidos)), 0);
    const dados: PontoHora[] = horas.map((h) => ({
      ...h,
      valor: metrica === "comissao" ? h.comissao : h.pedidos,
      traco: h.pedidos === 0 && max > 0 ? max * 0.012 : 0,
    }));
    // Rótulo só nas duas maiores — um número em cima de toda barra vira ruído.
    const rotulados = new Set(
      [...dados]
        .filter((d) => d.valor > 0)
        .sort((a, b) => b.valor - a.valor)
        .slice(0, 2)
        .map((d) => d.hora)
    );
    return { dados, rotulados };
  }, [horas, metrica]);

  const fmt = (v: number) => (metrica === "comissao" ? money(v, currency) : formatNumber(v));

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[620px]">
        <ResponsiveContainer width="100%" height={height}>
          <BarChart data={dados} margin={{ top: 28, right: 12, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />

            {/* faixa da janela recomendada — meia casa para cada lado cobre as barras inteiras */}
            {janela && temDestaque && (
              <ReferenceArea
                x1={janela.inicio - 0.5}
                x2={janela.inicio - 0.5 + destaque.size}
                fill="hsl(var(--primary))"
                fillOpacity={0.08}
                stroke="hsl(var(--primary))"
                strokeOpacity={0.35}
                label={{
                  value: `Janela de pico · ${fmt(metrica === "comissao" ? janela.comissao : janela.pedidos)}`,
                  position: "top",
                  fill: "hsl(var(--foreground))",
                  fontSize: 11,
                  fontWeight: 700,
                }}
              />
            )}

            <XAxis
              dataKey="hora"
              type="number"
              domain={[-0.5, 23.5]}
              ticks={Array.from({ length: 24 }, (_, i) => i)}
              tick={(props: { x: number; y: number; payload: { value: number } }) => {
                const h = props.payload.value;
                const forte = destaque.has(h);
                return (
                  <text
                    x={props.x}
                    y={props.y + 12}
                    textAnchor="middle"
                    fontSize={10}
                    fontWeight={forte ? 700 : 400}
                    fill={forte ? "hsl(var(--foreground))" : "hsl(var(--muted-foreground))"}
                  >
                    {String(h).padStart(2, "0")}
                  </text>
                );
              }}
              stroke="hsl(var(--border))"
            />
            <YAxis
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              tickFormatter={(v) => abbreviateNumber(Number(v))}
              stroke="hsl(var(--border))"
              width={52}
            />

            {media != null && metrica === "comissao" && media > 0 && (
              <ReferenceLine
                y={media}
                stroke="hsl(var(--muted-foreground))"
                strokeDasharray="4 4"
                strokeOpacity={0.7}
                label={{
                  value: `média das horas ativas · ${money(media, currency)}`,
                  position: "insideTopLeft",
                  fill: "hsl(var(--muted-foreground))",
                  fontSize: 10,
                }}
              />
            )}

            <Tooltip
              cursor={{ fill: "hsl(var(--muted) / 0.4)" }}
              content={(props) => <TooltipHora {...props} currency={currency} />}
            />

            <Bar dataKey="valor" stackId="h" isAnimationActive={false} radius={[4, 4, 0, 0]}>
              {dados.map((d) => (
                <Cell
                  key={d.hora}
                  // Sem janela recomendada (amostra insuficiente) nada é destacado: a tela
                  // não sugere uma resposta que não temos.
                  fill={
                    !temDestaque || destaque.has(d.hora)
                      ? "hsl(var(--primary))"
                      : "hsl(var(--primary) / 0.45)"
                  }
                />
              ))}
              <LabelList
                dataKey="valor"
                content={(props: { x?: number; y?: number; width?: number; index?: number }) => {
                  const d = dados[props.index ?? -1];
                  if (!d || !rotulados.has(d.hora)) return null;
                  return (
                    <text
                      x={(props.x ?? 0) + (props.width ?? 0) / 2}
                      y={(props.y ?? 0) - 6}
                      textAnchor="middle"
                      fontSize={11}
                      fontWeight={700}
                      fill="hsl(var(--foreground))"
                    >
                      {metrica === "comissao" ? d.valor.toFixed(2).replace(".", ",") : formatNumber(d.valor)}
                    </text>
                  );
                }}
              />
            </Bar>

            {/* traço das horas vazias, empilhado na base */}
            <Bar
              dataKey="traco"
              stackId="h"
              isAnimationActive={false}
              fill="hsl(var(--muted-foreground) / 0.45)"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// =============== Rampa compartilhada ===============

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

/** Nos dois passos extremos da rampa o texto precisa inverter — e a inversão é por TEMA,
 *  não fixa: no claro os passos 4-5 são escuros (tinta branca), no escuro são os mais
 *  claros (tinta escura). Quem resolve isso é o token `--heat-ink`, que troca junto. */
function textoDoNivel(nivel: number): string {
  return nivel >= 4 ? "text-heat-ink" : "text-foreground";
}

export function LegendaHeat({ max, currency }: { max?: number; currency?: string }) {
  return (
    <div className="flex items-center gap-1.5 text-[11px] text-faint">
      <span>{max != null && currency ? money(0, currency) : "menos"}</span>
      {Array.from({ length: NIVEIS_GRADE + 1 }, (_, n) => (
        <span key={n} className={cn("h-3 w-3 rounded-[3px]", HEAT_BG[n])} />
      ))}
      <span>{max != null && currency ? money(max, currency) : "mais"}</span>
    </div>
  );
}

// =============== Grade dia × bloco (7 × 4) ===============

/**
 * A semana em 28 células em vez de 168.
 *
 * Diferente do heatmap de 24h, aqui o VALOR aparece dentro da célula: com 28 células cabe
 * o número, e ler R$ direto é muito mais útil do que inferir pela cor. A cor vira reforço.
 */
export function GradeBlocos({
  blocos,
  currency,
  destaque,
}: {
  blocos: CelulaBloco[];
  currency: string;
  /** Célula a contornar (a mais quente da semana). */
  destaque?: CelulaBloco;
}) {
  const max = useMemo(() => Math.max(...blocos.map((b) => b.comissao), 0), [blocos]);

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <LegendaHeat max={max} currency={currency} />
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[580px]">
          {/* cabeçalho dos dias */}
          <div className="mb-1.5 flex gap-1.5">
            <span className="w-[74px] shrink-0" />
            {DIAS_ORDEM.map((dia) => (
              <span key={dia} className="flex-1 text-center text-[12px] font-semibold text-muted-foreground">
                {DIAS_CURTOS[dia]}
              </span>
            ))}
          </div>

          {BLOCOS.map((bloco, i) => (
            <div key={bloco.key} className="mb-1.5 flex items-stretch gap-1.5">
              <span className="w-[74px] shrink-0 self-center">
                <span className="block text-[12px] font-semibold">{bloco.label}</span>
                <span className="block text-[10.5px] leading-tight text-faint">{bloco.faixa}</span>
              </span>
              {DIAS_ORDEM.map((dia) => {
                const c = celulaBloco(blocos, dia, i);
                const marcada = destaque && destaque.dia === c.dia && destaque.bloco === c.bloco;
                const vazia = c.pedidos === 0;
                return (
                  <div
                    key={dia}
                    className={cn(
                      "flex h-[46px] flex-1 items-center justify-center rounded-lg text-[13.5px] font-bold tabular-nums transition-opacity",
                      HEAT_BG[c.nivel],
                      vazia ? "text-faint" : textoDoNivel(c.nivel),
                      marcada && "ring-2 ring-primary ring-offset-2 ring-offset-card"
                    )}
                    title={
                      vazia
                        ? `${DIAS_CURTOS[dia]} · ${bloco.label} (${bloco.faixa}) — sem pedido`
                        : `${DIAS_CURTOS[dia]} · ${bloco.label} (${bloco.faixa}) — ${money(
                            c.comissao,
                            currency
                          )} em ${formatNumber(c.pedidos)} pedido(s)`
                    }
                  >
                    {vazia ? "—" : c.comissao.toFixed(2).replace(".", ",")}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// =============== Top horas ===============

/** As 5 horas que mais renderam, com volume e ticket ao lado — é o par que revela que
 *  "hora que vende muito" e "hora de ticket alto" nem sempre são a mesma. */
export function TopHoras({ horas, currency }: { horas: HoraBucket[]; currency: string }) {
  const max = horas[0]?.comissao ?? 0;
  if (!horas.length) {
    return <p className="py-6 text-center text-sm text-muted-foreground">Sem horas com venda no período.</p>;
  }
  return (
    <ol className="space-y-2.5">
      {horas.map((h, i) => (
        <li key={h.hora} className="flex items-center gap-3">
          <span className="w-3 shrink-0 text-[11px] text-faint">{i + 1}</span>
          <span className="w-9 shrink-0 text-[13px] font-bold">{rotuloHora(h.hora)}</span>
          <span className="h-[7px] min-w-[36px] flex-1 overflow-hidden rounded-full bg-secondary">
            <span
              className="block h-full rounded-full bg-primary"
              style={{ width: `${max > 0 ? Math.max(6, (h.comissao / max) * 100) : 0}%` }}
            />
          </span>
          <span className="num shrink-0 text-[13px] font-bold">{money(h.comissao, currency)}</span>
          <span className="w-[86px] shrink-0 text-right text-[11.5px] text-faint">
            {formatNumber(h.pedidos)} · {money(h.comissao / h.pedidos, currency)}
          </span>
        </li>
      ))}
    </ol>
  );
}

// =============== Grade cheia 7 × 24 (secundária) ===============

/**
 * Heatmap 7×24. Aqui a cor É o canal de magnitude (não há comprimento nem espaço para o
 * número), então usa a rampa sequencial de um tom só do DS (`--heat-1..5`).
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

          {DIAS_ORDEM.map((dia) => (
            <div key={dia} className="mb-[2px] flex items-center gap-[2px]">
              <span className="w-9 shrink-0 pr-1 text-right text-[11px] font-medium text-muted-foreground">
                {DIAS_CURTOS[dia]}
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
                    title={`${DIAS_CURTOS[dia]} ${rotuloHora(hora)} — ${money(
                      c.comissao,
                      currency
                    )} · ${formatNumber(c.pedidos)} pedido(s)`}
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
            <th className="px-3 py-2 text-right font-medium">Por pedido</th>
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
                {h.pedidos > 0 ? money(h.comissao / h.pedidos, currency) : "—"}
              </td>
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
