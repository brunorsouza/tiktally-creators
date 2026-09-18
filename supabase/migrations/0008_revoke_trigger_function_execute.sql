-- ============================================================================
-- Fecha os gatilhos de signup à API REST
-- ============================================================================
-- Por padrão o Supabase concede EXECUTE em funções de `public` para anon e
-- authenticated, e isso vale também para função de GATILHO: as duas abaixo
-- ficavam chamáveis como RPC (`/rest/v1/rpc/handle_new_user_profile`) sendo
-- SECURITY DEFINER. Chamadas assim elas quebram (não existe NEW fora do
-- gatilho), mas função SECURITY DEFINER exposta sem motivo é superfície de
-- ataque à espera de um refactor que a torne perigosa.
--
-- Revogar NÃO afeta o gatilho: o Postgres não checa EXECUTE ao disparar um
-- trigger — a checagem é só para chamada direta.
--
-- `is_admin_user()` fica EXPOSTA de propósito: ela é avaliada dentro das
-- policies de RLS de `profiles` e `subscriptions`, e a expressão da policy roda
-- com o papel de quem consulta. Revogar dali transformaria "nenhuma linha" em
-- erro de permissão na leitura do próprio perfil. E o que ela devolve é só se
-- QUEM CHAMA é admin — não vaza nada de terceiro.
-- ============================================================================

BEGIN;

REVOKE EXECUTE ON FUNCTION public.handle_new_user_profile() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.handle_new_user_subscription() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.guard_profiles_is_admin() FROM anon, authenticated, public;

COMMIT;
