-- =====================================================================
-- Views publicas: contratos de dados estaveis entre modulos.
-- Os modulos consomem estas views, nao as tabelas brutas. Quando o
-- modelo interno mudar, a view permanece estavel ate o ponto que
-- decidirmos quebrar conscientemente.
-- =====================================================================

-- ---------- contracts_active_today -----------------------------------
-- Contratos cujo "status efetivo hoje" e active. Considera que mesmo
-- registros marcados como active podem ja ter ended_at no passado se a
-- aplicacao nao tiver rodado o motor de transicao do dia ainda.
-- Isso evita que um snapshot atrase por causa de cron pausado.
create or replace view public.contracts_active_today as
select
  c.*
from public.contracts c
where c.status = 'active'
  and (c.end_date is null or c.end_date >= current_date)
  and (c.canceled_at is null or c.canceled_at > current_date)
  and (c.ended_at is null or c.ended_at > current_date);

comment on view public.contracts_active_today is
  'Contratos que contam no MRR de hoje. Source of truth pra metricas em tempo real.';

-- ---------- clients_with_status --------------------------------------
-- Cliente + status derivado: tem contrato active hoje?
create or replace view public.clients_with_status as
select
  cl.*,
  case
    when exists (
      select 1 from public.contracts_active_today cat
      where cat.client_id = cl.id
    ) then 'active'
    else 'inactive'
  end::text as status
from public.clients cl;

comment on view public.clients_with_status is
  'Clients com status derivado a partir dos contratos. Modulos sempre leem daqui, nao da tabela clients.';

-- ---------- mrr_current -----------------------------------------------
-- MRR live: soma do mrr_cents dos contratos ativos hoje. Single row.
create or replace view public.mrr_current as
select
  coalesce(sum(mrr_cents), 0)::bigint as mrr_cents,
  count(distinct client_id)::integer  as active_clients,
  count(*)::integer                   as active_contracts
from public.contracts_active_today;

comment on view public.mrr_current is
  'MRR em tempo real (nao snapshot). Usado pra dashboard e pra alimentar o snapshot diario.';

-- =====================================================================
-- RLS nas views: heranca da tabela base com algumas precaucoes.
-- Views em PG nao tem RLS propria; herdam do owner da view + tabelas
-- base. Como sao security_invoker = true (default em PG 15+), os
-- usuarios so veem o que as policies das tabelas base permitem.
-- Confirmamos abaixo, defensivo.
-- =====================================================================
alter view public.contracts_active_today set (security_invoker = true);
alter view public.clients_with_status set (security_invoker = true);
alter view public.mrr_current set (security_invoker = true);
