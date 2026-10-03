/**
 * Status de pedido afiliado — rótulo e tom, num lugar só.
 *
 * Existia duplicado: `GanhosPage` traduzia os enums da API e o `DashboardPage`
 * imprimia o valor cru, então a mesma venda aparecia como "Aguardando
 * pagamento" numa tela e "AWAITING PAYMENT" na outra. As duas também
 * discordavam do tom (o painel pintava de âmbar o que Ganhos deixava neutro).
 *
 * Os valores vêm da Affiliate Creator API — ver docs/TIKTOK_AFFILIATE_CREATOR_API.md,
 * campo `status` de Search Creator Affiliate Orders. A grafia esquisita de
 * "To-SETTLE" e o espaço em "AWAITING PAYMENT" são da API, não erro de digitação.
 */

export const ORDER_STATUS_LABELS: Record<string, string> = {
  SETTLED: "Pago",
  REFUNDED: "Reembolsado",
  FROZEN: "Congelado",
  ORDERED: "Pedido",
  DEDUCTED: "Deduzido",
  "AWAITING PAYMENT": "Aguardando pagamento",
  "To-SETTLE": "A liquidar",
  UNSPECIFIED: "Indefinido",
};

export type OrderStatusTone = "success" | "warning" | "destructive" | "secondary";

/**
 * Tom do chip. Verde só para o que já é dinheiro do creator; vermelho para o
 * que não vai mais virar comissão; âmbar para o que ainda está em trânsito.
 */
export function orderStatusTone(status?: string): OrderStatusTone {
  if (status === "SETTLED") return "success";
  if (status === "REFUNDED" || status === "FROZEN") return "destructive";
  if (status === "To-SETTLE" || status === "AWAITING PAYMENT") return "warning";
  return "secondary"; // ORDERED, DEDUCTED, UNSPECIFIED…
}

/** Rótulo em português; cai no valor cru se a API inventar um status novo. */
export function orderStatusLabel(status?: string): string {
  if (!status) return "—";
  return ORDER_STATUS_LABELS[status] ?? status;
}
