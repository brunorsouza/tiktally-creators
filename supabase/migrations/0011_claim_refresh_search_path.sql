-- ============================================================================
-- Fecha o `search_path` mutável de claim_creator_token_refresh (advisor 0011)
-- ============================================================================
-- A função vem da 0002 e faz um UPDATE. Sem `search_path` fixo, quem puder
-- controlar o path da sessão decide qual `creator_tokens` é atualizada. Aqui o
-- risco era baixo (a função é revogada de public/anon/authenticated e só o
-- service_role chama), mas fechar é de uma linha.
--
-- Seguro porque o corpo já era todo qualificado: `public.creator_tokens`, e
-- `now()`/`make_interval` vivem em pg_catalog, que está sempre no path.
--
-- Segue NÃO sendo SECURITY DEFINER, de propósito: quem chama já bypassa RLS, e
-- torná-la definer abriria um caminho para um cliente mexer no lock de outro
-- usuário.
-- ============================================================================

BEGIN;

CREATE OR REPLACE FUNCTION public.claim_creator_token_refresh(
  p_user_id       uuid,
  p_stale_seconds integer DEFAULT 30
)
RETURNS TABLE(refresh_token text, refresh_expires_at timestamptz)
LANGUAGE sql
SET search_path = ''
AS $function$
  update public.creator_tokens t
     set refresh_lock_at = now()
   where t.user_id = p_user_id
     and (
       t.refresh_lock_at is null
       or t.refresh_lock_at < now() - make_interval(secs => p_stale_seconds)
     )
  returning t.refresh_token, t.refresh_expires_at;
$function$;

REVOKE ALL ON FUNCTION public.claim_creator_token_refresh(uuid, integer) FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.claim_creator_token_refresh(uuid, integer) TO service_role;

COMMIT;
