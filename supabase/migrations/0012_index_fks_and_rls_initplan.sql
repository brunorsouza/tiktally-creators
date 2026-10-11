-- ============================================================================
-- Índices nas FKs que faltavam + RLS avaliada uma vez por consulta
-- ============================================================================
-- Dois achados do linter de performance do Supabase, ambos de conserto mecânico.
--
-- 1. FK sem índice de cobertura. O custo não aparece na leitura: aparece quando
--    a linha REFERENCIADA é apagada ou atualizada, porque o Postgres varre a
--    tabela filha inteira para checar a restrição. Apagar um plano varreria
--    `billings`; apagar uma assinatura varreria `coupon_redemptions`.
--
-- 2. `auth.uid()` (e `is_admin_user()`) chamadas soltas numa policy são
--    reavaliadas PARA CADA LINHA examinada. Envolver em `(select ...)` faz o
--    Postgres tratar o valor como constante da consulta (InitPlan) e chamar uma
--    vez só. É o mesmo predicado, mesma semântica — só deixa de ser O(n).
--    Ver https://supabase.com/docs/guides/database/postgres/row-level-security
--
-- As policies de `creator_tokens` e `creator_profiles` vêm da 0001 e entram no
-- mesmo conserto: hoje são inertes (o front nunca consulta o banco direto, tudo
-- passa por edge function com service-role), mas deixá-las de fora criaria duas
-- classes de policy no mesmo schema, e a próxima pessoa não saberia qual seguir.
-- ============================================================================

BEGIN;

-- ── 1. Índices de cobertura das FKs ─────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_billings_plan                  ON public.billings (plan);
CREATE INDEX IF NOT EXISTS idx_commissions_paid_by            ON public.commissions (paid_by);
CREATE INDEX IF NOT EXISTS idx_coupon_redemptions_subscription ON public.coupon_redemptions (subscription_id);
CREATE INDEX IF NOT EXISTS idx_settings_updated_by            ON public.settings (updated_by);
CREATE INDEX IF NOT EXISTS idx_subscriptions_coupon           ON public.subscriptions (coupon_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_last_billing     ON public.subscriptions (last_billing_id);

-- ── 2. RLS: uma avaliação por consulta, não por linha ───────────────────────

-- profiles
DROP POLICY IF EXISTS "own profile - select" ON public.profiles;
CREATE POLICY "own profile - select" ON public.profiles
  FOR SELECT USING ((select auth.uid()) = id OR (select public.is_admin_user()));

DROP POLICY IF EXISTS "own profile - update" ON public.profiles;
CREATE POLICY "own profile - update" ON public.profiles
  FOR UPDATE USING ((select auth.uid()) = id) WITH CHECK ((select auth.uid()) = id);

-- subscriptions
DROP POLICY IF EXISTS "own subscription - select" ON public.subscriptions;
CREATE POLICY "own subscription - select" ON public.subscriptions
  FOR SELECT USING ((select auth.uid()) = user_id OR (select public.is_admin_user()));

-- billings
DROP POLICY IF EXISTS "own billings - select" ON public.billings;
CREATE POLICY "own billings - select" ON public.billings
  FOR SELECT USING ((select auth.uid()) = user_id);

-- pricing_leads
DROP POLICY IF EXISTS "admins_read_pricing_leads" ON public.pricing_leads;
CREATE POLICY "admins_read_pricing_leads" ON public.pricing_leads
  FOR SELECT TO authenticated USING ((select public.is_admin_user()));

DROP POLICY IF EXISTS "admins_update_pricing_leads" ON public.pricing_leads;
CREATE POLICY "admins_update_pricing_leads" ON public.pricing_leads
  FOR UPDATE TO authenticated
  USING ((select public.is_admin_user())) WITH CHECK ((select public.is_admin_user()));

DROP POLICY IF EXISTS "admins_delete_pricing_leads" ON public.pricing_leads;
CREATE POLICY "admins_delete_pricing_leads" ON public.pricing_leads
  FOR DELETE TO authenticated USING ((select public.is_admin_user()));

-- creator_tokens (da 0001)
DROP POLICY IF EXISTS "own tokens - select" ON public.creator_tokens;
CREATE POLICY "own tokens - select" ON public.creator_tokens
  FOR SELECT USING ((select auth.uid()) = user_id);
DROP POLICY IF EXISTS "own tokens - insert" ON public.creator_tokens;
CREATE POLICY "own tokens - insert" ON public.creator_tokens
  FOR INSERT WITH CHECK ((select auth.uid()) = user_id);
DROP POLICY IF EXISTS "own tokens - update" ON public.creator_tokens;
CREATE POLICY "own tokens - update" ON public.creator_tokens
  FOR UPDATE USING ((select auth.uid()) = user_id);
DROP POLICY IF EXISTS "own tokens - delete" ON public.creator_tokens;
CREATE POLICY "own tokens - delete" ON public.creator_tokens
  FOR DELETE USING ((select auth.uid()) = user_id);

-- creator_profiles (da 0001)
DROP POLICY IF EXISTS "own profile - select" ON public.creator_profiles;
CREATE POLICY "own profile - select" ON public.creator_profiles
  FOR SELECT USING ((select auth.uid()) = user_id);
DROP POLICY IF EXISTS "own profile - insert" ON public.creator_profiles;
CREATE POLICY "own profile - insert" ON public.creator_profiles
  FOR INSERT WITH CHECK ((select auth.uid()) = user_id);
DROP POLICY IF EXISTS "own profile - update" ON public.creator_profiles;
CREATE POLICY "own profile - update" ON public.creator_profiles
  FOR UPDATE USING ((select auth.uid()) = user_id);

COMMIT;
