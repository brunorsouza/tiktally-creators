-- ============================================================================
-- profiles + acesso ao backoffice
-- ============================================================================
-- O app creator nasceu sem `profiles`: só `auth.users`, `creator_tokens` e
-- `creator_profiles` (este último é cache do perfil da TikTok, não da conta).
-- Falta a linha por conta que guarda nome e dados do pagador, e é ela que o
-- checkout e o backoffice leem.
--
-- `is_admin` mora aqui, como no app seller: é dessa coluna que sai TODA a
-- proteção do backoffice do creator — os gateways `bo-accounts`, `bo-coupons` e
-- `bo-leads` validam esta flag com service-role antes de qualquer leitura
-- cross-tenant.
--
-- Idempotente (IF NOT EXISTS / ON CONFLICT): roda uma vez em prod e vira no-op.
-- ============================================================================

BEGIN;

CREATE TABLE IF NOT EXISTS public.profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  -- Nome do creator. A coluna se chama shop_name por herança do app seller, e
  -- o nome é mantido de propósito: os gateways `bo-coupons`/`bo-leads` são
  -- deployados SEM ALTERAÇÃO a partir do backoffice do seller, e renomear aqui
  -- obrigaria a divergir o código deles do original.
  shop_name     TEXT,
  -- Dados do pagador, usados pela Asaas no checkout. Opcionais: o creator é
  -- pessoa física na maioria dos casos, e conta de cortesia nunca cobra.
  cnpj          TEXT,
  legal_name    TEXT,
  legal_cpf     TEXT,
  company_name  TEXT,
  is_admin      BOOLEAN NOT NULL DEFAULT FALSE,
  last_login    TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON public.profiles (is_admin) WHERE is_admin;
CREATE INDEX IF NOT EXISTS idx_profiles_cnpj ON public.profiles (cnpj) WHERE cnpj IS NOT NULL;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS profiles_set_updated_at ON public.profiles;
CREATE TRIGGER profiles_set_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ----------------------------------------------------------------------------
-- is_admin_user(): "quem está chamando é admin?"
-- ----------------------------------------------------------------------------
-- SECURITY DEFINER de propósito. Uma policy em `profiles` que consultasse
-- `profiles` para descobrir se o chamador é admin entraria em recursão infinita
-- de RLS. A função lê a tabela por fora da RLS e devolve só um booleano.
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
SET search_path = ''
STABLE
AS $$
  SELECT COALESCE(
    (SELECT p.is_admin FROM public.profiles p WHERE p.id = auth.uid()),
    FALSE
  );
$$;

-- ----------------------------------------------------------------------------
-- Policies
-- ----------------------------------------------------------------------------
-- O cliente lê e edita o próprio perfil, e nunca a flag de admin: a policy de
-- UPDATE não pode impedir a escrita de UMA coluna, então `is_admin` é protegido
-- pelo REVOKE abaixo. Sem ele, qualquer usuário autenticado se promoveria a
-- administrador do backoffice com um único UPDATE.
DROP POLICY IF EXISTS "own profile - select" ON public.profiles;
CREATE POLICY "own profile - select" ON public.profiles
  FOR SELECT USING (auth.uid() = id OR public.is_admin_user());

DROP POLICY IF EXISTS "own profile - update" ON public.profiles;
CREATE POLICY "own profile - update" ON public.profiles
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- ⚠️ ESTA LINHA NÃO FUNCIONA — corrigida em 0007_profiles_is_admin_lock.sql.
-- Mantida porque migration aplicada não se reescreve. No Postgres, revogar
-- privilégio de COLUNA não tem efeito enquanto o papel mantém o de TABELA, e o
-- Supabase concede ALL em `public` para authenticated por padrão. O conserto é
-- revogar o UPDATE de tabela e reconceder só nas colunas do usuário. Não copie
-- este padrão.
REVOKE UPDATE (is_admin) ON public.profiles FROM authenticated, anon;

-- ----------------------------------------------------------------------------
-- Gatilho de signup
-- ----------------------------------------------------------------------------
-- Lê do `raw_user_meta_data` em vez de depender de um UPDATE pós-signup: com
-- confirmação de e-mail ligada o signup não cria session, então sem JWT a RLS
-- bloqueia o UPDATE em silêncio e a conta fica sem perfil. Passando os dados
-- como `data` no signUp, o perfil nasce atômico com o usuário.
--
-- `name` é o campo que o app creator JÁ manda no cadastro
-- (src/contexts/AuthContext.tsx, signUp com `data: { name }`) — ele cai em
-- shop_name. Os demais chegam pelo cadastro feito no backoffice.
CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, shop_name, cnpj, legal_name, legal_cpf, company_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'shop_name'),
    NEW.raw_user_meta_data->>'cnpj',
    NEW.raw_user_meta_data->>'legal_name',
    NEW.raw_user_meta_data->>'legal_cpf',
    NEW.raw_user_meta_data->>'company_name'
  )
  ON CONFLICT (id) DO UPDATE SET
    shop_name    = COALESCE(EXCLUDED.shop_name,    public.profiles.shop_name),
    cnpj         = COALESCE(EXCLUDED.cnpj,         public.profiles.cnpj),
    legal_name   = COALESCE(EXCLUDED.legal_name,   public.profiles.legal_name),
    legal_cpf    = COALESCE(EXCLUDED.legal_cpf,    public.profiles.legal_cpf),
    company_name = COALESCE(EXCLUDED.company_name, public.profiles.company_name);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_profile ON auth.users;
CREATE TRIGGER on_auth_user_created_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_profile();

-- ----------------------------------------------------------------------------
-- Backfill das contas que já existem
-- ----------------------------------------------------------------------------
INSERT INTO public.profiles (id, shop_name)
SELECT u.id, u.raw_user_meta_data->>'name'
FROM auth.users u
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- Primeiro administrador
-- ----------------------------------------------------------------------------
-- Sem este seed NINGUÉM entra no backoffice: a tela de Administradores é o
-- único jeito de conceder acesso, e ela mesma exige um admin logado. É o
-- problema do ovo e da galinha, resolvido aqui uma vez.
--
-- Depois disso, conceder e revogar acesso é pela tela — não por migration.
UPDATE public.profiles
SET is_admin = TRUE
WHERE id IN (
  SELECT id FROM auth.users
  WHERE lower(email) IN ('gabrieljoliveira95@gmail.com', 'bruno.riguess@gmail.com')
);

COMMENT ON TABLE public.profiles IS
  'Perfil por conta do app creator. is_admin é o portão do backoffice; shop_name guarda o nome do creator (nome de coluna herdado do app seller, mantido para os gateways bo-* rodarem sem alteração).';

COMMIT;
