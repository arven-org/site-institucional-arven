-- =====================================================================
-- Arven, schema v1
-- =====================================================================
-- Tabelas de negocio + RLS + indexes. Triggers e views vivem em
-- migrations separadas (mesmo timestamp, sufixos diferentes) pra deixar
-- claro o que e estrutura vs comportamento.
--
-- Princípios:
--  - Toda tabela tem RLS habilitada e force, sem excecao.
--  - Leitura aberta a authenticated; escrita a owner/admin (RBAC via helper).
--  - Snapshots e log sao append-only do ponto de vista de cliente.
--  - Centavos sempre em bigint. mrr_cents e a fonte da verdade financeira.
-- =====================================================================

-- ---------- Helper de role com poder de escrita ----------------------
create or replace function public.has_write_access()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_user_role() in ('owner', 'admin');
$$;

revoke all on function public.has_write_access() from public;
grant execute on function public.has_write_access() to authenticated;

-- ---------- Enums -----------------------------------------------------
create type public.contract_status as enum ('draft', 'active', 'ended', 'canceled');
create type public.contract_source as enum ('manual', 'google_form', 'migration');
create type public.alert_type as enum ('expiring', 'renewal_due');
create type public.alert_status as enum ('pending', 'acknowledged', 'resolved');
create type public.growth_scenario_kind as enum ('meta', 'forecast');

-- =====================================================================
-- clients
-- =====================================================================
create table public.clients (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  trade_name    text,
  document      text unique,
  email         text,
  phone         text,
  notes         text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index clients_name_idx on public.clients (lower(name));
create index clients_document_idx on public.clients (document) where document is not null;

create trigger clients_set_updated_at
  before update on public.clients
  for each row execute function public.tg_set_updated_at();

alter table public.clients enable row level security;
alter table public.clients force row level security;

create policy "clients_select_authenticated"
  on public.clients for select
  to authenticated using (true);

create policy "clients_insert_admins"
  on public.clients for insert
  to authenticated with check (public.has_write_access());

create policy "clients_update_admins"
  on public.clients for update
  to authenticated using (public.has_write_access()) with check (public.has_write_access());

-- Sem policy de DELETE. Cliente nao se apaga (mesma logica de contrato).
-- Em casos extremos, service-role faz no banco.

-- =====================================================================
-- contracts
-- =====================================================================
create table public.contracts (
  id            uuid primary key default gen_random_uuid(),
  client_id     uuid not null references public.clients(id) on delete restrict,
  status        public.contract_status not null default 'draft',
  mrr_cents     bigint not null,
  start_date    date not null,
  end_date      date,
  canceled_at   date,
  ended_at      date,
  renewal_of    uuid references public.contracts(id) on delete set null,
  pdf_path      text,
  source        public.contract_source not null default 'manual',
  source_ref    text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),

  constraint contracts_mrr_nonneg
    check (mrr_cents >= 0),

  constraint contracts_dates_order
    check (end_date is null or end_date >= start_date),

  constraint contracts_no_self_renewal
    check (renewal_of is null or renewal_of <> id),

  -- canceled exige canceled_at; ended exige ended_at; demais estados, ambos null.
  -- O trigger BEFORE em contract_dates_trigger.sql garante isso, mas
  -- a constraint amarra como invariante do dado.
  constraint contracts_status_dates_consistent
    check (
      case status
        when 'canceled' then canceled_at is not null and ended_at is null
        when 'ended'    then ended_at is not null and canceled_at is null
        else canceled_at is null and ended_at is null
      end
    )
);

create index contracts_client_idx on public.contracts (client_id);
create index contracts_status_idx on public.contracts (status);
-- ativos vencendo: usado pelo cron de alertas, indice parcial
create index contracts_active_end_date_idx
  on public.contracts (end_date)
  where status = 'active' and end_date is not null;
create index contracts_renewal_of_idx on public.contracts (renewal_of) where renewal_of is not null;
create index contracts_source_ref_idx
  on public.contracts (source, source_ref)
  where source_ref is not null;

create trigger contracts_set_updated_at
  before update on public.contracts
  for each row execute function public.tg_set_updated_at();

alter table public.contracts enable row level security;
alter table public.contracts force row level security;

create policy "contracts_select_authenticated"
  on public.contracts for select
  to authenticated using (true);

create policy "contracts_insert_admins"
  on public.contracts for insert
  to authenticated with check (public.has_write_access());

create policy "contracts_update_admins"
  on public.contracts for update
  to authenticated using (public.has_write_access()) with check (public.has_write_access());

-- Sem policy de DELETE. Contrato nunca e apagado (spec sec 1).

-- =====================================================================
-- contract_status_log, append-only do ponto de vista de cliente.
-- =====================================================================
create table public.contract_status_log (
  id            uuid primary key default gen_random_uuid(),
  contract_id   uuid not null references public.contracts(id) on delete cascade,
  from_status   public.contract_status,
  to_status     public.contract_status not null,
  changed_at    timestamptz not null default now(),
  changed_by    uuid references auth.users(id) on delete set null,
  reason        text
);

create index contract_status_log_contract_idx
  on public.contract_status_log (contract_id, changed_at desc);

alter table public.contract_status_log enable row level security;
alter table public.contract_status_log force row level security;

create policy "log_select_authenticated"
  on public.contract_status_log for select
  to authenticated using (true);

-- Sem INSERT/UPDATE/DELETE policies. So o trigger (SECURITY DEFINER)
-- escreve, e os caminhos administrativos (service-role) bypassam RLS.

-- =====================================================================
-- mrr_snapshots, serie historica congelada.
-- =====================================================================
create table public.mrr_snapshots (
  id                uuid primary key default gen_random_uuid(),
  snapshot_date     date not null unique,
  mrr_cents         bigint not null check (mrr_cents >= 0),
  active_clients    integer not null check (active_clients >= 0),
  active_contracts  integer not null check (active_contracts >= 0),
  new_mrr_cents     bigint not null check (new_mrr_cents >= 0),
  churned_mrr_cents bigint not null check (churned_mrr_cents >= 0),
  created_at        timestamptz not null default now()
);

create index mrr_snapshots_date_idx on public.mrr_snapshots (snapshot_date desc);

alter table public.mrr_snapshots enable row level security;
alter table public.mrr_snapshots force row level security;

create policy "snapshots_select_authenticated"
  on public.mrr_snapshots for select
  to authenticated using (true);

-- Sem INSERT/UPDATE/DELETE. So o cron (service-role) escreve.

-- =====================================================================
-- alerts
-- =====================================================================
create table public.alerts (
  id            uuid primary key default gen_random_uuid(),
  contract_id   uuid not null references public.contracts(id) on delete cascade,
  type          public.alert_type not null,
  trigger_date  date not null,
  status        public.alert_status not null default 'pending',
  acknowledged_at timestamptz,
  acknowledged_by uuid references auth.users(id) on delete set null,
  resolved_at   timestamptz,
  resolved_by   uuid references auth.users(id) on delete set null,
  created_at    timestamptz not null default now(),

  constraint alerts_ack_consistent
    check (
      (status = 'pending' and acknowledged_at is null)
      or (status in ('acknowledged', 'resolved') and acknowledged_at is not null)
    ),

  constraint alerts_resolved_consistent
    check (
      (status <> 'resolved' and resolved_at is null)
      or (status = 'resolved' and resolved_at is not null)
    ),

  -- evita duplicacao do mesmo alerta no mesmo dia pro mesmo contrato.
  constraint alerts_unique_per_day
    unique (contract_id, type, trigger_date)
);

create index alerts_status_trigger_idx
  on public.alerts (status, trigger_date)
  where status = 'pending';
create index alerts_contract_idx on public.alerts (contract_id);

alter table public.alerts enable row level security;
alter table public.alerts force row level security;

create policy "alerts_select_authenticated"
  on public.alerts for select
  to authenticated using (true);

-- Update: qualquer authenticated pode acknowledge/resolve (fila operacional).
-- A consistencia de status+timestamps fica nas CHECK constraints e em trigger.
create policy "alerts_update_authenticated"
  on public.alerts for update
  to authenticated using (true) with check (true);

-- Insert/delete: so o cron (service-role).

-- =====================================================================
-- growth_scenarios + growth_monthly
-- =====================================================================
create table public.growth_scenarios (
  id                      uuid primary key default gen_random_uuid(),
  name                    text not null,
  kind                    public.growth_scenario_kind not null,
  churn_assumption_bps    integer not null check (churn_assumption_bps between 0 and 10000),
  -- bps = basis points; 250 = 2.5%. Inteiro evita float no banco.
  archived_at             timestamptz,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);

create unique index growth_scenarios_name_active_idx
  on public.growth_scenarios (lower(name))
  where archived_at is null;

create trigger growth_scenarios_set_updated_at
  before update on public.growth_scenarios
  for each row execute function public.tg_set_updated_at();

alter table public.growth_scenarios enable row level security;
alter table public.growth_scenarios force row level security;

create policy "scenarios_select_authenticated"
  on public.growth_scenarios for select to authenticated using (true);

create policy "scenarios_insert_admins"
  on public.growth_scenarios for insert
  to authenticated with check (public.has_write_access());

create policy "scenarios_update_admins"
  on public.growth_scenarios for update
  to authenticated using (public.has_write_access()) with check (public.has_write_access());

create table public.growth_monthly (
  id                          uuid primary key default gen_random_uuid(),
  scenario_id                 uuid not null references public.growth_scenarios(id) on delete cascade,
  month_start                 date not null,
  target_active_clients       integer check (target_active_clients is null or target_active_clients >= 0),
  planned_new_contracts       integer check (planned_new_contracts is null or planned_new_contracts >= 0),
  ticket_growth_bps           integer check (ticket_growth_bps is null or ticket_growth_bps between -10000 and 10000),
  capacity_new_contracts      integer check (capacity_new_contracts is null or capacity_new_contracts >= 0),
  created_at                  timestamptz not null default now(),
  updated_at                  timestamptz not null default now(),

  -- mes sempre representado pelo primeiro dia: 2026-01-01, 2026-02-01, etc.
  constraint growth_monthly_first_of_month
    check (extract(day from month_start) = 1),

  unique (scenario_id, month_start)
);

create index growth_monthly_scenario_month_idx
  on public.growth_monthly (scenario_id, month_start);

create trigger growth_monthly_set_updated_at
  before update on public.growth_monthly
  for each row execute function public.tg_set_updated_at();

alter table public.growth_monthly enable row level security;
alter table public.growth_monthly force row level security;

create policy "growth_monthly_select_authenticated"
  on public.growth_monthly for select to authenticated using (true);

create policy "growth_monthly_insert_admins"
  on public.growth_monthly for insert
  to authenticated with check (public.has_write_access());

create policy "growth_monthly_update_admins"
  on public.growth_monthly for update
  to authenticated using (public.has_write_access()) with check (public.has_write_access());

create policy "growth_monthly_delete_admins"
  on public.growth_monthly for delete
  to authenticated using (public.has_write_access());
