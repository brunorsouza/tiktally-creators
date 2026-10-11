import { supabase } from "@/integrations/supabase/client";

/**
 * Captura de lead da página pública.
 *
 * Mesmo contrato do app seller de propósito: a tabela `pricing_leads` e o
 * console que a lê (`bo-leads`, no backoffice creator) são o mesmo código nos
 * dois produtos. O que muda é só o projeto Supabase de destino, que aqui é o do
 * creator.
 */
export interface LeadInput {
  name: string;
  email: string;
  whatsapp: string;
  /** De onde veio. 'feira' separa quem escaneou o QR do estande. */
  source?: string;
}

/** Grava o lead via edge `capture-lead` (service role) e devolve o id. */
export async function captureLead(input: LeadInput): Promise<string> {
  const { data, error } = await supabase.functions.invoke("capture-lead", {
    body: {
      action: "capture",
      name: input.name,
      email: input.email,
      whatsapp: input.whatsapp,
      source: input.source ?? "landing_pricing",
      referrer: typeof document !== "undefined" ? document.referrer || null : null,
    },
  });

  if (error) throw error;
  if (!data?.id) throw new Error(data?.error || "Falha ao gravar lead");
  return data.id as string;
}

/**
 * Marca que o lead avançou depois de deixar o contato.
 * Best-effort: rastreio nunca bloqueia a navegação de quem está usando a tela.
 */
export async function markLeadProceeded(id: string, plan: string, cycle?: string): Promise<void> {
  if (!id) return;
  try {
    await supabase.functions.invoke("capture-lead", {
      body: { action: "proceed", id, plan, cycle },
    });
  } catch (err) {
    console.warn("[leads] markLeadProceeded falhou (ignorado):", err);
  }
}
