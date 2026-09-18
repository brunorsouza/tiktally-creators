-- ============================================================================
-- audit_logs + bo_user_id_by_email
-- ============================================================================
-- Os dois pré-requisitos que faltavam para os gateways do backoffice rodarem:
-- toda ação sensível deles (mudar preço, criar cupom, conceder admin, definir
-- plano) grava em `audit_logs`, e conceder acesso a uma conta que já existe
-- passa pela RPC.
-- ============================================================================

BEGIN;

-- ----------------------------------------------------------------------------
-- audit_logs
-- ----------------------------------------------------------------------------
-- `entity_id` é TEXT, não UUID: parte das entidades auditadas é identificada
-- por chave e não por id (settings.key, plans.key).
--
-- `actor_user_id` com ON DELETE SET NULL: apagar a conta de quem operou não
-- pode apagar o registro do que foi feito.
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id UUID REFERENCES auth.users (id) ON DELETE SET NULL,
  action        TEXT NOT NULL,
  entity        TEXT NOT NULL,
  entity_id     TEXT,
  payload       JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_entity  ON public.audit_logs (entity, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor   ON public.audit_logs (actor_user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON public.audit_logs (created_at DESC);

-- Deny-by-default: nem o dono da ação lê a trilha pelo cliente. Só service_role
-- (as edge functions) escreve e lê.
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- bo_user_id_by_email(text) -> uuid
-- ----------------------------------------------------------------------------
-- Resolve o id de um usuário existente pelo e-mail (case-insensitive). Usada
-- pelos gateways para VINCULAR uma conta que já existe em vez de criar uma
-- segunda pra mesma pessoa — é como se acumula login órfão.
--
-- SECURITY DEFINER pra alcançar o schema `auth`, e execução SÓ por service_role:
-- exposta a anon/authenticated, viraria um endpoint de enumeração de e-mails.
CREATE OR REPLACE FUNCTION public.bo_user_id_by_email(p_email text)
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT id
  FROM auth.users
  WHERE lower(email) = lower(trim(p_email))
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.bo_user_id_by_email(text) FROM public;
REVOKE ALL ON FUNCTION public.bo_user_id_by_email(text) FROM anon;
REVOKE ALL ON FUNCTION public.bo_user_id_by_email(text) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.bo_user_id_by_email(text) TO service_role;

COMMENT ON TABLE public.audit_logs IS
  'Trilha de auditoria das ações sensíveis do backoffice (preço, cupom, plano, acesso).';

COMMIT;
