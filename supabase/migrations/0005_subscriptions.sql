-- ============================================================================
-- subscriptions — plano e janela de acesso por conta
-- ============================================================================
-- Portado do app seller (20260314000001 + as colunas de gateway que
-- 20260614000001 acrescentou), com dois desvios deliberados:
--
--  1. `plan` é NULLABLE com FK pra `plans.key`, em vez de NOT NULL com CHECK e
--     um valor neutro ('tiktally') significando "sem plano". Sem plano é
--     ausência de plano: NULL diz isso, e um valor de fábrica que precisa ser
--     lembrado em cada comparação já produziu bug no app seller (todo lugar que
--     lê plano tem de saber que 'tiktally' não conta).
--  2. Sem as colunas de NF-e (`spedy_enabled`, `spedy_cnpj`): o creator não
--     emite nota.
--
-- `last_billing_id` e `coupon_id` entram junto com `billings`/`coupons`, na
-- etapa do schema comercial — FK não pode apontar pra tabela que ainda não
-- existe.
-- ============================================================================

BEGIN;

CREATE TABLE IF NOT EXISTS public.subscriptions (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                   UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  -- NULL = sem plano. FK garante que só entra chave que existe no catálogo.
  plan                      TEXT REFERENCES public.plans (key),
  status                    TEXT NOT NULL DEFAULT 'cancelled'
                              CHECK (status IN ('active', 'trial', 'expired', 'cancelled', 'pending')),
  trial_ends_at             TIMESTAMPTZ,
  current_period_start      TIMESTAMPTZ DEFAULT now(),
  current_period_end        TIMESTAMPTZ,
  cycle                     TEXT DEFAULT 'semiannually',
  cancel_at_period_end      BOOLEAN NOT NULL DEFAULT FALSE,
  cancelled_at              TIMESTAMPTZ,
  cancellation_reason       TEXT,
  past_due_since            TIMESTAMPTZ,
  last_notification_sent_at TIMESTAMPTZ,
  -- Gateway de cobrança (Asaas). `gateway_subscription_id` OU
  -- `renewal_card_token` preenchido = assinatura dirigida pelo gateway, e o
  -- backoffice avisa antes de mexer na data à mão.
  gateway                   TEXT,
  gateway_customer_id       TEXT,
  gateway_subscription_id   TEXT,
  renewal_card_token        TEXT,
  renewal_installments      INTEGER,
  metadata                  JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- Uma assinatura por conta. Todos os upserts das functions de cobrança usam
  -- `onConflict: 'user_id'` e dependem disto.
  CONSTRAINT subscriptions_user_id_key UNIQUE (user_id)
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions (user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_plan    ON public.subscriptions (plan);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status  ON public.subscriptions (status);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- O cliente LÊ a própria assinatura e não escreve nada: quem muda plano é a
-- edge function de cobrança (service-role) ou o admin pelo backoffice. No app
-- seller a policy de UPDATE pelo cliente existiu e teve de ser revogada depois
-- — um UPDATE livre aqui é acesso pago de graça.
DROP POLICY IF EXISTS "own subscription - select" ON public.subscriptions;
CREATE POLICY "own subscription - select" ON public.subscriptions
  FOR SELECT USING (auth.uid() = user_id OR public.is_admin_user());

DROP TRIGGER IF EXISTS subscriptions_set_updated_at ON public.subscriptions;
CREATE TRIGGER subscriptions_set_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ----------------------------------------------------------------------------
-- Gatilho de signup: nasce SEM plano e cancelada
-- ----------------------------------------------------------------------------
-- É o paywall de pé. A pessoa loga e não tem acesso ao produto até pagar (ou
-- até um admin conceder pela tela de Contas).
CREATE OR REPLACE FUNCTION public.handle_new_user_subscription()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.subscriptions (user_id, plan, status)
  VALUES (NEW.id, NULL, 'cancelled')
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_subscription ON auth.users;
CREATE TRIGGER on_auth_user_created_subscription
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_subscription();

-- Backfill: as contas que já existem também precisam da linha, senão o
-- backoffice recusa definir plano ("conta sem assinatura").
INSERT INTO public.subscriptions (user_id, plan, status)
SELECT u.id, NULL, 'cancelled'
FROM auth.users u
ON CONFLICT (user_id) DO NOTHING;

COMMENT ON TABLE public.subscriptions IS
  'Plano e janela de acesso por conta. plan NULL = sem plano (paywall de pé). Uma linha por usuário.';
COMMENT ON COLUMN public.subscriptions.plan IS
  'FK para plans.key. NULL = sem plano — não existe valor neutro de fábrica.';

COMMIT;
