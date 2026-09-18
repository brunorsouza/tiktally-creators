-- Suporte a refresh automático do creator access_token.
--
-- O access_token da TikTok dura ~7 dias; o refresh_token dura ~365. Sem isto o
-- token vencia e TODA chamada de dados passava a falhar com "Expired
-- credentials", só voltando se o creator reconectasse a conta na mão.

-- ── colunas ──────────────────────────────────────────────────────────────────
alter table public.creator_tokens
  add column if not exists refresh_expires_at timestamptz,
  add column if not exists refresh_lock_at    timestamptz;

comment on column public.creator_tokens.refresh_expires_at is
  'Quando o refresh_token expira. Passou disso, só nova autorização OAuth resolve.';
comment on column public.creator_tokens.refresh_lock_at is
  'Lock de exclusão mútua do refresh (ver claim_creator_token_refresh).';

-- ── claim do refresh ─────────────────────────────────────────────────────────
-- A TikTok ROTACIONA o refresh_token a cada uso: se as várias chamadas que uma
-- tela dispara em paralelo renovassem ao mesmo tempo, cada uma invalidaria o
-- token da outra e a conta caía de vez. Este UPDATE..RETURNING é a exclusão
-- mútua: exatamente uma chamada leva a linha, as outras recebem zero linhas e
-- aproveitam o resultado de quem ganhou.
--
-- Um lock mais velho que p_stale_seconds é tido como abandonado (a edge function
-- morreu no meio do refresh) e pode ser retomado.
create or replace function public.claim_creator_token_refresh(
  p_user_id       uuid,
  p_stale_seconds int default 30
)
returns table (refresh_token text, refresh_expires_at timestamptz)
language sql
as $$
  update public.creator_tokens t
     set refresh_lock_at = now()
   where t.user_id = p_user_id
     and (
       t.refresh_lock_at is null
       or t.refresh_lock_at < now() - make_interval(secs => p_stale_seconds)
     )
  returning t.refresh_token, t.refresh_expires_at;
$$;

-- Só o service-role (edge functions) chama isso. Não é security definer de
-- propósito: quem chama já bypassa RLS, e assim a função não vira um caminho
-- para um cliente mexer no lock de outro usuário.
revoke all on function public.claim_creator_token_refresh(uuid, int) from public;
revoke all on function public.claim_creator_token_refresh(uuid, int) from anon;
revoke all on function public.claim_creator_token_refresh(uuid, int) from authenticated;
