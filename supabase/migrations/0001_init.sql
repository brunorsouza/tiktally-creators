-- TikTally Creator — schema inicial (MVP fase 1)
-- Tabelas: creator_tokens (OAuth do creator TikTok) e creator_profiles (cache do perfil).
-- Todas com RLS: cada usuário só enxerga o que é seu.

-- ── updated_at trigger helper ────────────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''  -- hardening: evita search_path mutável (advisor 0011)
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ── creator_tokens ───────────────────────────────────────────────────────────
create table if not exists public.creator_tokens (
  id                    uuid primary key default gen_random_uuid(),
  user_id               uuid not null references auth.users (id) on delete cascade,
  creator_user_open_id  text,
  access_token          text not null,
  refresh_token         text,
  scopes                text,
  region                text default 'BR',
  expires_at            timestamptz,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),
  unique (user_id)  -- 1 conta de creator por usuário do app (MVP)
);

create index if not exists creator_tokens_user_id_idx on public.creator_tokens (user_id);

alter table public.creator_tokens enable row level security;

create policy "own tokens - select" on public.creator_tokens
  for select using (auth.uid() = user_id);
create policy "own tokens - insert" on public.creator_tokens
  for insert with check (auth.uid() = user_id);
create policy "own tokens - update" on public.creator_tokens
  for update using (auth.uid() = user_id);
create policy "own tokens - delete" on public.creator_tokens
  for delete using (auth.uid() = user_id);

create trigger creator_tokens_set_updated_at
  before update on public.creator_tokens
  for each row execute function public.set_updated_at();

-- ── creator_profiles (cache do Get Creator Profile) ──────────────────────────
create table if not exists public.creator_profiles (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references auth.users (id) on delete cascade,
  username          text,
  avatar_url        text,
  selection_region  text,
  register_region   text,
  permissions       jsonb,
  updated_at        timestamptz not null default now(),
  unique (user_id)
);

alter table public.creator_profiles enable row level security;

create policy "own profile - select" on public.creator_profiles
  for select using (auth.uid() = user_id);
create policy "own profile - insert" on public.creator_profiles
  for insert with check (auth.uid() = user_id);
create policy "own profile - update" on public.creator_profiles
  for update using (auth.uid() = user_id);

create trigger creator_profiles_set_updated_at
  before update on public.creator_profiles
  for each row execute function public.set_updated_at();

-- NOTA: creator_tokens.access_token é sensível. As edge functions acessam via
-- service-role (bypassa RLS no servidor). O anon/frontend nunca lê a coluna
-- porque as policies exigem auth.uid() = user_id E o token só é usado server-side.
-- Fase 1.1: avaliar Vault/pgsodium pra cifrar access_token/refresh_token em repouso.
