-- =====================================================================
-- Arven, migration inicial
-- =====================================================================
-- Tabela `profiles`: perfil 1:1 com auth.users, carrega o papel do usuario.
-- RLS ativado no mesmo commit. Nenhuma policy permissiva por default;
-- cada operacao tem policy explicita.
--
-- Decisoes:
--  - PK = id da auth.users, FK on delete cascade. Apagar usuario apaga perfil.
--  - Coluna `role` como enum app_role pra ser estendida com sintaxe segura
--    (`alter type ... add value`) sem migration destrutiva.
--  - `display_name` mantido aqui (nao em auth.users) pra ficar editavel sem
--    tocar no objeto de auth, que tem semantica mais sensivel.
--  - `updated_at` mantido por trigger generica reusavel.
-- =====================================================================

create extension if not exists "pgcrypto";

create type public.app_role as enum ('owner', 'admin', 'member');

create table public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  email         text not null,
  display_name  text,
  role          public.app_role not null default 'member',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index profiles_email_idx on public.profiles (email);
create index profiles_role_idx  on public.profiles (role);

-- Trigger generica de updated_at, reusavel pelas proximas tabelas.
create or replace function public.tg_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.tg_set_updated_at();

-- =====================================================================
-- Auto-provisionamento do profile quando um usuario e criado na auth.
-- Como o signup esta desabilitado, o disparo so acontece via convite/admin.
-- =====================================================================
create or replace function public.tg_create_profile_on_signup()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.tg_create_profile_on_signup();

-- =====================================================================
-- Helper de papel, em SECURITY DEFINER, pra usar em policies sem causar
-- recursao RLS quando a policy precisa consultar profiles do proprio caller.
-- =====================================================================
create or replace function public.current_user_role()
returns public.app_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

revoke all on function public.current_user_role() from public;
grant execute on function public.current_user_role() to authenticated;

-- =====================================================================
-- RLS
-- =====================================================================
alter table public.profiles enable row level security;
alter table public.profiles force row level security;

-- SELECT: usuario ve o proprio perfil. Owners/admins veem todos.
create policy "profiles_select_self_or_admin"
  on public.profiles
  for select
  to authenticated
  using (
    id = auth.uid()
    or public.current_user_role() in ('owner', 'admin')
  );

-- UPDATE: usuario edita o proprio perfil (sem trocar role).
-- Trocas de role sao operacao de owner/admin, abaixo.
create policy "profiles_update_self_no_role_change"
  on public.profiles
  for update
  to authenticated
  using (id = auth.uid())
  with check (
    id = auth.uid()
    and role = public.current_user_role()
  );

-- UPDATE: owner/admin podem mudar qualquer perfil, incluindo role.
create policy "profiles_update_admin"
  on public.profiles
  for update
  to authenticated
  using (public.current_user_role() in ('owner', 'admin'))
  with check (public.current_user_role() in ('owner', 'admin'));

-- INSERT direto via authenticated: bloqueado. Profiles nascem pelo trigger
-- da auth.users. Nada de cliente criar profile a mao.
-- (Sem policy = negado por padrao com RLS ativo.)

-- DELETE: idem. Cascade da auth.users e o caminho.
