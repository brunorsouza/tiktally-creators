-- ============================================================================
-- Trava real da coluna profiles.is_admin
-- ============================================================================
-- Conserta um furo de escalação de privilégio aberto pela 0003.
--
-- A 0003 fez `REVOKE UPDATE (is_admin) ON public.profiles FROM authenticated`,
-- o que NÃO FUNCIONA: no Postgres, revogar um privilégio de COLUNA não tem
-- efeito enquanto o papel mantém o privilégio de TABELA — e o Supabase concede
-- `ALL` em tabelas de `public` para anon e authenticated por padrão. O privilégio
-- de tabela cobre todas as colunas, inclusive a revogada.
--
-- Combinado com a policy "own profile - update" (que corretamente deixa a pessoa
-- editar a própria linha), o resultado era: qualquer usuário autenticado podia se
-- tornar administrador do backoffice com um UPDATE na própria linha. Como
-- `is_admin` é o portão ÚNICO deste console, isso valia acesso total.
--
-- Conserto em duas camadas, porque uma só já falhou:
--
--  1. Privilégio: revoga UPDATE de tabela e reconcede apenas nas colunas que a
--     pessoa realmente edita. É o mecanismo correto e o que o Postgres impõe.
--  2. Gatilho: recusa qualquer mudança de `is_admin` que não venha do
--     service_role. Redundante hoje, de propósito — se um `GRANT ALL` futuro
--     (migration, script, template do Supabase) devolver o privilégio de tabela,
--     a camada 1 cai em silêncio e só esta faz barulho.
-- ============================================================================

BEGIN;

-- ── Camada 1: privilégio por coluna, com o de tabela removido ───────────────
REVOKE UPDATE ON public.profiles FROM authenticated, anon;

-- As colunas que o dono do perfil edita. `is_admin`, `id`, `last_login`,
-- `created_at` e `updated_at` ficam de fora: são do servidor.
GRANT UPDATE (shop_name, cnpj, legal_name, legal_cpf, company_name)
  ON public.profiles TO authenticated;

-- anon não edita perfil nenhum.
-- (a policy de UPDATE já exige auth.uid() = id, mas sem privilégio nem chega lá)

-- ── Camada 2: gatilho que recusa a mudança ─────────────────────────────────
CREATE OR REPLACE FUNCTION public.guard_profiles_is_admin()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  IF NEW.is_admin IS DISTINCT FROM OLD.is_admin
     AND current_setting('request.jwt.claim.role', true) IS DISTINCT FROM 'service_role'
     AND current_user <> 'service_role'
     AND NOT pg_catalog.pg_has_role(current_user, 'service_role', 'MEMBER')
  THEN
    RAISE EXCEPTION
      'profiles.is_admin só muda pelo backoffice (service_role). Use a tela Sistema → Administradores.'
      USING ERRCODE = '42501';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_guard_is_admin ON public.profiles;
CREATE TRIGGER profiles_guard_is_admin
  BEFORE UPDATE OF is_admin ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.guard_profiles_is_admin();

COMMENT ON FUNCTION public.guard_profiles_is_admin() IS
  'Recusa mudança de profiles.is_admin fora do service_role. Segunda camada: a primeira é o privilégio por coluna, que um GRANT ALL futuro desfaria em silêncio.';

COMMIT;
