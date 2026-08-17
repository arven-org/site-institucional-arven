-- =====================================================================
-- Storage: bucket `contracts` ja existe (config.toml). RLS de
-- storage.objects ja vem habilitada por padrao pelo Supabase, e sem
-- policy permissiva, ninguem acessa via JWT publico.
--
-- Decisao: nao criar policy nenhuma pra bucket 'contracts'. Todo
-- acesso (upload, download, signed URL) passa pelo server via
-- service-role. Isso da auditoria centralizada e zero risco de drift
-- de policy de storage.
--
-- Esta migration existe como documentacao executavel: re-confirma a
-- regra ao re-aplicar o schema do zero, e quebra explicito se alguem
-- adicionar policy aberta pro bucket no futuro.
-- =====================================================================

-- Sanity check em tempo de migration: nenhuma policy concedida ao
-- bucket 'contracts'. Falha alto se alguem tentar enxertar.
-- (Nao tentamos `alter table storage.objects enable rls` porque a tabela
-- pertence a supabase_storage_admin e ja vem com RLS habilitada.)
do $$
declare
  open_policy_count integer;
begin
  select count(*)
    into open_policy_count
  from pg_policies
  where schemaname = 'storage'
    and tablename = 'objects'
    and qual ilike '%contracts%';

  if open_policy_count > 0 then
    raise exception
      'Bucket `contracts` deve ficar sem policy permissiva. % policy(s) encontrada(s).',
      open_policy_count;
  end if;
end$$;
