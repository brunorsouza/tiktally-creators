import { useMemo } from "react";
import { parseAmount } from "@/lib/formatters";
import { useAllAffiliateOrders, type GanhosFilters } from "@/hooks/useGanhos";
import {
  fusoDoDispositivo,
  resumirBlocos,
  resumirHorarios,
  type CelulaBloco,
  type ContentFilter,
  type ResumoHorarios,
  type Venda,
} from "@/lib/horarios";
import {
  acoesDe,
  calcularEstatisticas,
  notaDoVale,
  type Acao,
  type EstatisticasHorarios,
} from "@/lib/horariosInsights";

/**
 * Melhor Horário — aba "Horários" de Analytics. Ver docs/SPEC_MELHOR_HORARIO.md.
 *
 * Nenhuma chamada nova à API: deriva tudo de `useAllAffiliateOrders`, o MESMO hook (e a
 * mesma `queryKey`) que a aba Ranking já usa — ou seja, trocar de aba não refaz a busca.
 *
 * Escopo: `creator.affiliate_collaboration.read`, 🟢 ativo no app. Diferente do Agendador
 * (travado em `creator.video.write`), esta feature roda em produção hoje.
 */
export function useHorarios(range: GanhosFilters, filtro: ContentFilter, timeZone?: string) {
  const orders = useAllAffiliateOrders(range);
  const tz = timeZone ?? fusoDoDispositivo();

  /**
   * Achata pedido → SKU. A unidade de análise é a SKU, não o pedido: `content_type` e
   * `content_id` vivem na SKU (um pedido pode misturar origens), e é a comissão por SKU
   * que soma o retorno do creator.
   */
  const { vendas, currency } = useMemo(() => {
    const out: Venda[] = [];
    let currency = "BRL";
    for (const o of orders.data?.orders ?? []) {
      const isSettled = o.status === "SETTLED";
      for (const s of o.skus ?? []) {
        // Mesma regra de resolução de comissão usada em Ganhos, Painel e Ranking:
        // `actual` só é confiável em pedido liquidado; fora disso vale a estimativa.
        const actual = parseAmount(s.actual_commission?.amount);
        const estimate = parseAmount(s.estimated_commission?.amount);
        out.push({
          timestamp: o.create_time ?? 0,
          comissao: isSettled ? actual || estimate : estimate,
          contentType: s.content_type,
        });
        if (s.price?.currency) currency = s.price.currency;
      }
    }
    return { vendas: out, currency };
  }, [orders.data]);

  const resumo: ResumoHorarios = useMemo(
    () => resumirHorarios(vendas, { timeZone: tz, filtro }),
    [vendas, tz, filtro]
  );

  /** Grade de 28 células (7 dias × 4 blocos) — o recorte que amostras reais sustentam. */
  const blocos: CelulaBloco[] = useMemo(() => resumirBlocos(resumo.grade), [resumo.grade]);

  const stats: EstatisticasHorarios = useMemo(
    () => calcularEstatisticas(resumo, blocos),
    [resumo, blocos]
  );

  /** Ações e a nota do vale — cada uma com o próprio piso de evidência (horariosInsights). */
  const acoes: Acao[] = useMemo(() => acoesDe(resumo, stats, filtro), [resumo, stats, filtro]);
  const vale = useMemo(() => notaDoVale(resumo, stats), [resumo, stats]);

  // Mesma cautela de "sem resposta != zero" usada em Ganhos/Painel: enquanto a query não
  // resolveu, a tela mostra carregando em vez de afirmar que não há venda nenhuma.
  const semResposta = orders.isPending && !orders.isError;

  return {
    resumo,
    blocos,
    stats,
    acoes,
    vale,
    currency,
    isLoading: orders.isLoading || semResposta,
    error: orders.error,
    /** O teto de 2000 pedidos foi atingido — o período está incompleto. */
    truncated: !!orders.data?.truncated,
  };
}
