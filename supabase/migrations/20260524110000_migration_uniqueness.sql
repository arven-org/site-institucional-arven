-- =====================================================================
-- Indice unique parcial pra source_ref quando source = 'migration'.
-- Garante idempotencia do script scripts/migrate-arvenos.ts: re-rodar
-- nao cria contratos duplicados pro mesmo seed_ref.
--
-- Nao aplica a outras fontes (google_form, manual) porque la o source_ref
-- pode aparecer mais de uma vez por desenho (mesmo formulario disparado
-- mais de uma vez antes da aprovacao).
-- =====================================================================

create unique index contracts_migration_source_ref_unique
  on public.contracts (source_ref)
  where source = 'migration' and source_ref is not null;
