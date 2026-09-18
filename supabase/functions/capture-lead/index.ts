// POST capture-lead — grava o contato deixado na página pública de lead.
//
// Portada do app seller, com o mesmo contrato, porque o console que lê esses
// registros é o mesmo código nos dois produtos: a `bo-leads` do backoffice
// creator espera as colunas de `pricing_leads` exatamente como o seller as
// escreve. Mudar o formato aqui quebraria a tela lá sem aviso.
//
// Duas ações:
//   action 'capture'  → grava o lead e devolve { id }. O front guarda esse id.
//   action 'proceed'  → marca proceeded_at quando a pessoa avança depois de
//                       deixar o contato (lead quente).
//
// Escreve com SERVICE ROLE. `pricing_leads` não tem policy de INSERT para anon
// (ver migration 0010): toda escrita passa por aqui, senão o formulário público
// seria um INSERT aberto na tabela. Pública, com verify_jwt = false.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.79.0";
import { corsHeaders } from "../_shared/tiktokSign.ts";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const onlyDigits = (s: string) => (s || "").replace(/\D/g, "");
const isEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((s || "").trim());

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Método não suportado" }, 405);

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } },
    );

    const payload = await req.json().catch(() => ({}));
    const action = payload?.action ?? "capture";

    // ------------------------------------------------------------------------
    // proceed — o lead avançou depois de deixar o contato
    // ------------------------------------------------------------------------
    if (action === "proceed") {
      const id = String(payload?.id ?? "").trim();
      if (!id) return json({ error: "id é obrigatório" }, 400);

      const { error } = await supabase
        .from("pricing_leads")
        .update({
          proceeded_at: new Date().toISOString(),
          proceeded_plan: payload?.plan ? String(payload.plan).slice(0, 40) : null,
          plan_cycle: payload?.cycle ? String(payload.cycle).slice(0, 40) : null,
        })
        .eq("id", id)
        // Só "esquenta" uma vez: preserva o primeiro proceeded_at.
        .is("proceeded_at", null);

      if (error) {
        console.error("[capture-lead] proceed error:", error);
        return json({ error: "Falha ao atualizar lead" }, 500);
      }
      return json({ success: true });
    }

    // ------------------------------------------------------------------------
    // capture — grava o lead (padrão)
    // ------------------------------------------------------------------------
    const name = String(payload?.name ?? "").trim();
    const email = String(payload?.email ?? "").trim().toLowerCase();
    const whatsappDigits = onlyDigits(String(payload?.whatsapp ?? ""));

    if (name.length < 2) return json({ error: "Nome inválido" }, 400);
    if (!isEmail(email)) return json({ error: "Email inválido" }, 400);
    if (whatsappDigits.length < 10) return json({ error: "WhatsApp inválido" }, 400);

    const { data, error } = await supabase
      .from("pricing_leads")
      .insert({
        name: name.slice(0, 120),
        email: email.slice(0, 160),
        whatsapp: String(payload?.whatsapp ?? "").slice(0, 32),
        source: payload?.source ? String(payload.source).slice(0, 60) : "landing_pricing",
        referrer: payload?.referrer ? String(payload.referrer).slice(0, 500) : null,
        user_agent: req.headers.get("user-agent")?.slice(0, 500) ?? null,
        metadata: typeof payload?.metadata === "object" && payload.metadata ? payload.metadata : {},
      })
      .select("id")
      .single();

    if (error) {
      console.error("[capture-lead] capture error:", error);
      return json({ error: "Falha ao gravar lead" }, 500);
    }

    return json({ success: true, id: data.id });
  } catch (err) {
    console.error("[capture-lead] unexpected error:", err);
    return json({ error: (err as Error)?.message || "Erro interno" }, 500);
  }
});
