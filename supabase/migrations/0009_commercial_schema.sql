-- ============================================================================
-- Schema comercial: parceiros, cupons, cobranças, resgates e comissões
-- ============================================================================
-- Portado do app seller, mas escrito no ESTADO FINAL em vez de replicar a
-- cadeia de 10 migrations que o produziu lá. A cadeia do seller carrega
-- contradições (a migration que renomeou `erp` para `plus` foi desfeita por uma
-- posterior que recriou a CHECK com o valor antigo) e colunas escritas pelo
-- código sem migration nenhuma. Replicar o histórico importaria os dois
-- problemas; replicar o resultado, não.
--
-- Nomes de tabela e coluna são IDÊNTICOS aos do seller de propósito: é o que
-- permite deployar o gateway `bo-coupons` no projeto do creator sem alterar uma
-- linha do código dele.
--
-- RLS deny-by-default em tudo, exceto a leitura da própria cobrança: quem opera
-- é o gateway (service-role), que valida profiles.is_admin antes.
-- ============================================================================

BEGIN;

-- ----------------------------------------------------------------------------
-- businesses: parceiro/agência que gere uma carteira de afiliados
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.businesses (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id UUID REFERENCES auth.users (id) ON DELETE SET NULL,
  name          TEXT NOT NULL,
  email         TEXT,
  status        TEXT NOT NULL DEFAULT 'active',
  notes         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT businesses_status_chk CHECK (status IN ('active', 'suspended'))
);
CREATE INDEX IF NOT EXISTS idx_businesses_owner ON public.businesses (owner_user_id);
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- affiliates: afiliado, com ou sem carteira
-- ----------------------------------------------------------------------------
-- `user_id` é NULLABLE porque o admin cadastra o afiliado ANTES de ele ter
-- login: sem isso, criar afiliado exigiria criar conta, e o parceiro que só
-- recebe comissão não precisa entrar em lugar nenhum.
CREATE TABLE IF NOT EXISTS public.affiliates (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                  UUID REFERENCES auth.users (id) ON DELETE SET NULL,
  business_id              UUID REFERENCES public.businesses (id) ON DELETE SET NULL,
  name                     TEXT NOT NULL,
  email                    TEXT,
  pix_key                  TEXT,
  status                   TEXT NOT NULL DEFAULT 'active',
  default_commission_type  TEXT NOT NULL DEFAULT 'percent',
  default_commission_value NUMERIC NOT NULL DEFAULT 0,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT affiliates_status_chk CHECK (status IN ('active', 'suspended')),
  CONSTRAINT affiliates_commission_type_chk CHECK (default_commission_type IN ('fixed', 'percent'))
);
CREATE INDEX IF NOT EXISTS idx_affiliates_business ON public.affiliates (business_id);
-- Um usuário é no máximo um afiliado. Parcial porque afiliado sem login é normal.
CREATE UNIQUE INDEX IF NOT EXISTS idx_affiliates_user_unique
  ON public.affiliates (user_id) WHERE user_id IS NOT NULL;
ALTER TABLE public.affiliates ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- coupons
-- ----------------------------------------------------------------------------
-- `discount` é polissêmico por tipo: % em PERCENTAGE, centavos em FIXED, dias em
-- TRIAL_DAYS. Herdado do seller e mantido — é o que o `billing-validate-coupon`
-- espera.
--
-- Dono do cupom: `affiliate_id` OU `business_id`, os dois nulos = cupom da casa.
CREATE TABLE IF NOT EXISTS public.coupons (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code                TEXT NOT NULL,
  description         TEXT,
  discount_kind       TEXT NOT NULL,
  discount            INTEGER NOT NULL,
  status              TEXT NOT NULL DEFAULT 'ACTIVE',
  max_redeems         INTEGER NOT NULL DEFAULT -1,  -- -1 = ilimitado
  redeems_count       INTEGER NOT NULL DEFAULT 0,
  valid_from          TIMESTAMPTZ DEFAULT now(),
  valid_until         TIMESTAMPTZ,
  applicable_plans    TEXT[],
  applicable_cycles   TEXT[],
  affiliate_id        UUID REFERENCES public.affiliates (id) ON DELETE SET NULL,
  business_id         UUID REFERENCES public.businesses (id) ON DELETE SET NULL,
  applies_to_renewals BOOLEAN NOT NULL DEFAULT true,
  metadata            JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT coupons_discount_kind_chk CHECK (discount_kind IN ('PERCENTAGE', 'FIXED', 'TRIAL_DAYS')),
  CONSTRAINT coupons_status_check CHECK (status IN ('ACTIVE', 'INACTIVE', 'EXPIRED', 'ARCHIVED'))
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_coupons_code ON public.coupons (code);
CREATE INDEX IF NOT EXISTS idx_coupons_affiliate ON public.coupons (affiliate_id);
CREATE INDEX IF NOT EXISTS idx_coupons_business  ON public.coupons (business_id);
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- billings: uma cobrança
-- ----------------------------------------------------------------------------
-- `plan` tem FK pra plans.key, e não a CHECK com lista literal do seller — mesma
-- razão de subscriptions.plan.
--
-- As seis colunas de gateway/desconto abaixo são escritas pelo
-- `billing-create-payment` do seller e NÃO TÊM migration lá: existem só porque
-- alguém as criou à mão em produção. Aqui elas nascem declaradas.
CREATE TABLE IF NOT EXISTS public.billings (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                 UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  plan                    TEXT NOT NULL REFERENCES public.plans (key),
  -- 'monthly' entra porque o código do seller o aceita; o creator só usa
  -- semestral e anual. CHECK apertada demais aqui recusaria um pagamento.
  cycle                   TEXT NOT NULL DEFAULT 'semiannually'
                            CHECK (cycle IN ('monthly', 'semiannually', 'yearly')),
  amount_cents            INTEGER NOT NULL CHECK (amount_cents > 0),
  original_amount_cents   INTEGER,
  discount_cents          INTEGER,
  coupon_code             TEXT,
  status                  TEXT NOT NULL DEFAULT 'pending'
                            CHECK (status IN ('pending', 'paid', 'expired', 'cancelled', 'refunded')),
  gateway                 TEXT,
  gateway_payment_id      TEXT,
  gateway_subscription_id TEXT,
  -- Id determinístico que mandamos ao gateway. UNIQUE é a trava de
  -- idempotência: é ela que impede duas cobranças do mesmo clique duplo.
  external_id             TEXT NOT NULL UNIQUE,
  checkout_url            TEXT,
  paid_at                 TIMESTAMPTZ,
  expires_at              TIMESTAMPTZ,
  metadata                JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_billings_user_id     ON public.billings (user_id);
CREATE INDEX IF NOT EXISTS idx_billings_status      ON public.billings (status);
CREATE INDEX IF NOT EXISTS idx_billings_external_id ON public.billings (external_id);
CREATE INDEX IF NOT EXISTS idx_billings_gateway_payment ON public.billings (gateway_payment_id);
CREATE INDEX IF NOT EXISTS idx_billings_expires_at  ON public.billings (expires_at) WHERE status = 'pending';
ALTER TABLE public.billings ENABLE ROW LEVEL SECURITY;

-- A única leitura de cliente deste arquivo: a tela de checkout precisa saber se
-- o PIX foi pago. Sem isto ela só descobriria pelo refresh da assinatura.
-- SELECT apenas — quem escreve cobrança é o gateway.
DROP POLICY IF EXISTS "own billings - select" ON public.billings;
CREATE POLICY "own billings - select" ON public.billings
  FOR SELECT USING (auth.uid() = user_id);
GRANT SELECT ON public.billings TO authenticated;

-- ----------------------------------------------------------------------------
-- coupon_redemptions: um resgate, com o snapshot do momento
-- ----------------------------------------------------------------------------
-- As colunas de snapshot (plan_key, cycle, percentuais, valores) existem porque
-- comissão é dinheiro: recalcular depois, com preço ou regra que mudaram no
-- meio, daria um número diferente do que foi combinado.
--
-- Os quatro FKs abaixo NÃO existem no seller (as colunas são uuid soltos lá).
-- Estando escrevendo do zero, entram: resgate apontando para cobrança que não
-- existe é justamente o estado que trava o cálculo de comissão.
CREATE TABLE IF NOT EXISTS public.coupon_redemptions (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id                UUID NOT NULL REFERENCES public.coupons (id) ON DELETE CASCADE,
  user_id                  UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  billing_id               UUID REFERENCES public.billings (id) ON DELETE SET NULL,
  subscription_id          UUID REFERENCES public.subscriptions (id) ON DELETE SET NULL,
  affiliate_id             UUID REFERENCES public.affiliates (id) ON DELETE SET NULL,
  business_id              UUID REFERENCES public.businesses (id) ON DELETE SET NULL,
  discount_cents           INTEGER NOT NULL,
  plan_key                 TEXT,
  cycle                    TEXT,
  discount_percent_applied NUMERIC,
  payment_method           TEXT,
  pix_discount_applied     BOOLEAN NOT NULL DEFAULT false,
  gross_amount_cents       INTEGER,
  net_amount_cents         INTEGER,
  status                   TEXT NOT NULL DEFAULT 'active',
  redeemed_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_coupon_redemptions_coupon    ON public.coupon_redemptions (coupon_id);
CREATE INDEX IF NOT EXISTS idx_coupon_redemptions_user      ON public.coupon_redemptions (user_id);
CREATE INDEX IF NOT EXISTS idx_coupon_redemptions_affiliate ON public.coupon_redemptions (affiliate_id);
CREATE INDEX IF NOT EXISTS idx_coupon_redemptions_business  ON public.coupon_redemptions (business_id);

-- Idempotência, não conveniência. No seller a proteção era só um SELECT antes do
-- INSERT (TOCTOU): numa corrida entre o caminho síncrono e o webhook o resgate
-- duplicava, e aí o `maybeSingle()` seguinte devolvia erro e a COMISSÃO não era
-- criada. O índice é o que fecha a janela.
CREATE UNIQUE INDEX IF NOT EXISTS idx_coupon_redemptions_billing_unique
  ON public.coupon_redemptions (billing_id) WHERE billing_id IS NOT NULL;
-- Anti-duplo-clique do trial (resgate sem cobrança).
CREATE UNIQUE INDEX IF NOT EXISTS idx_coupon_redemptions_trial_unique
  ON public.coupon_redemptions (coupon_id, user_id) WHERE billing_id IS NULL;
-- Um cupom de PARCEIRO por cliente, para sempre: senão a mesma indicação
-- geraria comissão a cada renovação disfarçada de venda nova.
CREATE UNIQUE INDEX IF NOT EXISTS idx_coupon_redemptions_partner_user_lifetime
  ON public.coupon_redemptions (user_id)
  WHERE affiliate_id IS NOT NULL OR business_id IS NOT NULL;

ALTER TABLE public.coupon_redemptions ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- commissions: uma comissão por resgate, do primeiro pagamento
-- ----------------------------------------------------------------------------
-- `affiliate_id` é NULLABLE porque a comissão pode ser do business direto
-- (cupom da carteira sem afiliado), mas a CHECK exige um destinatário: comissão
-- sem quem receber é dinheiro parado que ninguém encontra.
CREATE TABLE IF NOT EXISTS public.commissions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  redemption_id     UUID NOT NULL REFERENCES public.coupon_redemptions (id) ON DELETE CASCADE,
  affiliate_id      UUID REFERENCES public.affiliates (id) ON DELETE CASCADE,
  business_id       UUID REFERENCES public.businesses (id) ON DELETE SET NULL,
  amount_cents      INTEGER NOT NULL,
  commission_type   TEXT NOT NULL,
  commission_value  NUMERIC NOT NULL,
  status            TEXT NOT NULL DEFAULT 'pending',
  -- paid_at do 1º pagamento + settings.commission_hold_days. É a janela de
  -- refund: aprovar antes disso seria pagar comissão de venda que pode voltar.
  eligible_at       TIMESTAMPTZ,
  approved_at       TIMESTAMPTZ,
  paid_at           TIMESTAMPTZ,
  paid_by           UUID REFERENCES auth.users (id),
  payment_reference TEXT,
  notes             TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT commissions_status_chk CHECK (status IN ('pending', 'approved', 'paid', 'cancelled', 'reversed')),
  CONSTRAINT commissions_type_chk CHECK (commission_type IN ('fixed', 'percent')),
  CONSTRAINT commissions_has_payee_chk CHECK (affiliate_id IS NOT NULL OR business_id IS NOT NULL)
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_commissions_redemption  ON public.commissions (redemption_id);
CREATE INDEX IF NOT EXISTS idx_commissions_affiliate   ON public.commissions (affiliate_id);
CREATE INDEX IF NOT EXISTS idx_commissions_business    ON public.commissions (business_id);
CREATE INDEX IF NOT EXISTS idx_commissions_status      ON public.commissions (status);
CREATE INDEX IF NOT EXISTS idx_commissions_eligible_at ON public.commissions (eligible_at);
ALTER TABLE public.commissions ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- subscriptions: as colunas que dependiam de coupons e billings
-- ----------------------------------------------------------------------------
-- Ficaram de fora da 0005 porque FK não aponta pra tabela que ainda não existe.
ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS coupon_id                  UUID REFERENCES public.coupons (id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS last_billing_id            UUID REFERENCES public.billings (id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS recurring_discount_percent NUMERIC;

CREATE INDEX IF NOT EXISTS idx_subscriptions_gateway_subscription_id
  ON public.subscriptions (gateway_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_period_end
  ON public.subscriptions (current_period_end);

-- ----------------------------------------------------------------------------
-- increment_coupon_redeems: contador de resgates
-- ----------------------------------------------------------------------------
-- No seller as edge functions chamavam esta RPC antes de ela existir, e o
-- fallback no `.catch()` fazia `update({ redeems_count: undefined })` — um
-- no-op. Resultado: o contador ficava em zero para sempre e a validação
-- `redeems_count >= max_redeems` nunca disparava, então cupom com limite era
-- resgatável infinitamente. Aqui ela nasce junto da tabela.
--
-- O incremento é feito NO BANCO, não lido-e-escrito no cliente: dois resgates
-- simultâneos se sobrescreveriam e o limite voltaria a não valer.
CREATE OR REPLACE FUNCTION public.increment_coupon_redeems(coupon_id_arg uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  UPDATE public.coupons
  SET redeems_count = COALESCE(redeems_count, 0) + 1,
      updated_at = now()
  WHERE id = coupon_id_arg;
$$;

REVOKE ALL ON FUNCTION public.increment_coupon_redeems(uuid) FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.increment_coupon_redeems(uuid) TO service_role;

-- ----------------------------------------------------------------------------
-- updated_at
-- ----------------------------------------------------------------------------
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['businesses', 'affiliates', 'coupons', 'billings', 'commissions'] LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS %I_set_updated_at ON public.%I', t, t);
    EXECUTE format(
      'CREATE TRIGGER %I_set_updated_at BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.set_updated_at()',
      t, t
    );
  END LOOP;
END $$;

COMMENT ON TABLE public.businesses IS 'Parceiro/agência que gere uma carteira de afiliados. owner_user_id = login no backoffice.';
COMMENT ON TABLE public.affiliates IS 'Afiliado (independente se business_id null). user_id = login no backoffice; pix_key p/ comissão.';
COMMENT ON TABLE public.coupons IS 'Cupons de desconto e trial, validados server-side. Dono: affiliate_id OU business_id; ambos nulos = cupom da casa.';
COMMENT ON TABLE public.billings IS 'Uma cobrança. external_id UNIQUE é a trava de idempotência do checkout.';
COMMENT ON TABLE public.coupon_redemptions IS 'Um resgate, com snapshot imutável do preço e da regra do momento — comissão não se recalcula.';
COMMENT ON TABLE public.commissions IS 'Comissão por resgate (só 1º pagamento). pending->approved->paid|cancelled|reversed.';

COMMIT;
