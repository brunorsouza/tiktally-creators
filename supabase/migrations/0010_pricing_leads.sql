-- ============================================================================
-- pricing_leads — o contato cru, antes de existir cliente
-- ============================================================================
-- Portado do app seller (20260615000001). Quem grava é a edge `capture-lead`
-- (service-role, `verify_jwt = false`): o visitante anônimo nunca toca a tabela
-- direto, senão o formulário público viraria um INSERT aberto.
--
-- Tabela própria e não `profiles`: lead não é conta. A maioria nunca se cadastra,
-- e misturar os dois faria toda consulta de conta carregar gente que só viu preço.
--
-- ⚠️ Esta tabela fica VAZIA até o app creator ter um gate de preço — hoje não
-- existe landing no repo (`marketing/` é arte promocional). A tela de Leads do
-- backoffice funciona, mas não há o que listar. Ver a etapa 3 do plano.
-- ============================================================================

BEGIN;

CREATE TABLE IF NOT EXISTS public.pricing_leads (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name           TEXT NOT NULL,
  email          TEXT NOT NULL,
  whatsapp       TEXT NOT NULL,
  source         TEXT NOT NULL DEFAULT 'landing_pricing',
  -- NULL = liberou o preço e não avançou. É o que separa curioso de interessado,
  -- e a tela chama isso de frio vs. quente.
  proceeded_at   TIMESTAMPTZ,
  proceeded_plan TEXT,
  plan_cycle     TEXT,
  referrer       TEXT,
  user_agent     TEXT,
  -- A triagem do backoffice (situação + anotação) vive em metadata.followup.
  -- Sem coluna nova: o console opera a tabela do app, não estende o schema dele.
  metadata       JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pricing_leads_created_at   ON public.pricing_leads (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pricing_leads_proceeded_at ON public.pricing_leads (proceeded_at);
CREATE INDEX IF NOT EXISTS idx_pricing_leads_email        ON public.pricing_leads (lower(email));

ALTER TABLE public.pricing_leads ENABLE ROW LEVEL SECURITY;

-- Admin lê, edita a triagem e apaga (spam e duplicado). Sem INSERT para ninguém
-- além do service-role: a captura é da edge function.
--
-- Nota de porte: no seller estas policies chamam `is_admin_user(auth.uid())`.
-- Aqui a função não recebe argumento — ela lê `auth.uid()` por dentro, que é o
-- único valor que faz sentido: uma versão que aceita um id convidaria a perguntar
-- "esse OUTRO usuário é admin?", e essa pergunta não é do cliente.
DROP POLICY IF EXISTS "admins_read_pricing_leads" ON public.pricing_leads;
CREATE POLICY "admins_read_pricing_leads"
  ON public.pricing_leads FOR SELECT TO authenticated
  USING (public.is_admin_user());

DROP POLICY IF EXISTS "admins_update_pricing_leads" ON public.pricing_leads;
CREATE POLICY "admins_update_pricing_leads"
  ON public.pricing_leads FOR UPDATE TO authenticated
  USING (public.is_admin_user())
  WITH CHECK (public.is_admin_user());

DROP POLICY IF EXISTS "admins_delete_pricing_leads" ON public.pricing_leads;
CREATE POLICY "admins_delete_pricing_leads"
  ON public.pricing_leads FOR DELETE TO authenticated
  USING (public.is_admin_user());

GRANT SELECT, UPDATE, DELETE ON public.pricing_leads TO authenticated;

DROP TRIGGER IF EXISTS pricing_leads_set_updated_at ON public.pricing_leads;
CREATE TRIGGER pricing_leads_set_updated_at
  BEFORE UPDATE ON public.pricing_leads
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

COMMENT ON TABLE public.pricing_leads IS
  'Leads capturados no gate de preço. proceeded_at NULL = liberou o preço mas não avançou. A triagem do backoffice fica em metadata.followup.';

COMMIT;
