-- ============================================================================
-- Motor de preço: settings, plans, prices
-- ============================================================================
-- Portado do app seller (20260730000001_pricing_plans_settings.sql). Mesmos
-- nomes de tabela e coluna de propósito: é o que permite deployar os gateways
-- `bo-coupons` e `bo-leads` no projeto do creator SEM ALTERAR uma linha do
-- código deles.
--
-- Valores em CENTAVOS. O ciclo mantém o vocabulário do app
-- ('semiannually' | 'yearly').
--
-- RLS deny-by-default: tabelas de configuração são só service_role (edge
-- functions). O admin edita pelo gateway `bo-coupons`, nunca pelo cliente.
-- ============================================================================

BEGIN;

-- ----------------------------------------------------------------------------
-- settings: percentuais e regras globais (key-value JSONB)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.settings (
  key         TEXT PRIMARY KEY,
  value       JSONB NOT NULL,
  description TEXT,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by  UUID REFERENCES auth.users (id)
);
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

INSERT INTO public.settings (key, value, description) VALUES
  ('coupon_discount_percent', '20'::jsonb,               'Desconto padrão do cupom de afiliado (%).'),
  ('pix_discount_percent',    '5'::jsonb,                'Desconto adicional PIX à vista (%).'),
  ('discount_stacking',       '"multiplicative"'::jsonb, 'Empilhamento cupom+PIX: multiplicative = ×0,80×0,95.'),
  ('commission_hold_days',    '7'::jsonb,                'Dias de carência até a comissão ficar elegível (janela de refund).'),
  ('commission_pool_percent', '30'::jsonb,               'Percentual total repartido entre desconto do cupom e comissão.'),
  ('test_plan_enabled',       'true'::jsonb,             'Liga o plano interno de teste. Desligar aqui é o freio de emergência.')
ON CONFLICT (key) DO NOTHING;

-- ----------------------------------------------------------------------------
-- plans: catálogo
-- ----------------------------------------------------------------------------
-- `key` é UNIQUE porque `subscriptions.plan` e `billings.plan` têm FK pra ela
-- (ver 0005). No app seller isso era uma CHECK com a lista literal de planos,
-- repetida em mais dois lugares no código — e as três cópias saíram de
-- sincronia: a migration que renomeou `erp` para `plus` foi desfeita sem querer
-- por uma migration posterior que recriou a CHECK com o valor antigo. Aqui o
-- catálogo é DADO: criar plano é inserir linha, não migrar.
CREATE TABLE IF NOT EXISTS public.plans (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key         TEXT NOT NULL UNIQUE,
  name        TEXT NOT NULL,
  description TEXT,
  status      TEXT NOT NULL DEFAULT 'active',  -- 'active' | 'inactive' | 'test'
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;

-- ATENÇÃO — catálogo INICIAL, não definitivo.
-- Nome, descrição e quantidade de planos do creator ainda não foram decididos.
-- Isto existe para o console subir com algo coerente e pode ser trocado pela
-- tela de Planos & Preços ou por um INSERT — sem migration, porque é dado.
INSERT INTO public.plans (key, name, description, status, sort_order) VALUES
  ('pro',  'Creator Pro',    'Ganhos, analytics e melhor horário para o creator afiliado.', 'active', 1),
  ('test', 'Teste interno',  'Plano de R$10 para validar o fluxo de cobrança de ponta a ponta.', 'test', 99)
ON CONFLICT (key) DO NOTHING;

-- ----------------------------------------------------------------------------
-- prices: preço vigente por plano × ciclo
--   installments/installment_amount = cartão parcelado (sem juros)
--   total_amount = total do ciclo (base do PIX à vista)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.prices (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id                  UUID NOT NULL REFERENCES public.plans (id) ON DELETE CASCADE,
  cycle                    TEXT NOT NULL,     -- 'semiannually' | 'yearly'
  installments             INTEGER NOT NULL,
  installment_amount_cents INTEGER NOT NULL,
  total_amount_cents       INTEGER NOT NULL,
  active                   BOOLEAN NOT NULL DEFAULT true,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Um preço ATIVO por (plano, ciclo). Preço antigo fica active=false como
-- histórico: mudar de preço não pode reescrever o que já foi cobrado.
CREATE UNIQUE INDEX IF NOT EXISTS idx_prices_active_plan_cycle
  ON public.prices (plan_id, cycle) WHERE active;
CREATE INDEX IF NOT EXISTS idx_prices_plan ON public.prices (plan_id);
ALTER TABLE public.prices ENABLE ROW LEVEL SECURITY;

-- ATENÇÃO — preços PROVISÓRIOS.
-- Os valores do plano `pro` abaixo são os do TikTally Pro (seller), usados só
-- como ponto de partida para a tela ter linha editável: a tela de Planos &
-- Preços altera preço, mas não cria. Ajuste pela tela antes de abrir o
-- checkout — não precisa de migration.
INSERT INTO public.prices (plan_id, cycle, installments, installment_amount_cents, total_amount_cents)
SELECT p.id, v.cycle, v.installments, v.installment_amount_cents, v.total_amount_cents
FROM (VALUES
  ('pro',  'yearly',       12, 49900, 598800),
  ('pro',  'semiannually',  6, 59900, 359400),
  ('test', 'yearly',        1,  1000,   1000),
  ('test', 'semiannually',  1,  1000,   1000)
) AS v(plan_key, cycle, installments, installment_amount_cents, total_amount_cents)
JOIN public.plans p ON p.key = v.plan_key
WHERE NOT EXISTS (
  SELECT 1 FROM public.prices x
  WHERE x.plan_id = p.id AND x.cycle = v.cycle AND x.active
);

DROP TRIGGER IF EXISTS plans_set_updated_at ON public.plans;
CREATE TRIGGER plans_set_updated_at
  BEFORE UPDATE ON public.plans
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS prices_set_updated_at ON public.prices;
CREATE TRIGGER prices_set_updated_at
  BEFORE UPDATE ON public.prices
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

COMMENT ON TABLE public.settings IS 'Config global de cupons/comissões e do motor de preço. Só service_role.';
COMMENT ON TABLE public.plans    IS 'Catálogo de planos do creator. `key` é referenciada por subscriptions.plan — criar plano é inserir linha, não migrar.';
COMMENT ON TABLE public.prices   IS 'Preço vigente por plano×ciclo, em centavos. Parcelas = cartão; total = PIX à vista.';

COMMIT;
