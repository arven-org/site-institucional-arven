-- =====================================================================
-- Triggers de contratos
-- =====================================================================
-- 1. Carimba canceled_at/ended_at conforme o status, antes de qualquer
--    UPDATE/INSERT. Garante que a CHECK contracts_status_dates_consistent
--    nunca seja a primeira linha de defesa: o trigger pre-arruma.
-- 2. Loga toda transicao de status em contract_status_log, em SECURITY
--    DEFINER, depois do commit do contrato.
-- =====================================================================

create or replace function public.tg_stamp_contract_status_dates()
returns trigger
language plpgsql
as $$
begin
  if new.status = 'canceled' then
    if new.canceled_at is null then
      new.canceled_at := current_date;
    end if;
    new.ended_at := null;
  elsif new.status = 'ended' then
    if new.ended_at is null then
      new.ended_at := current_date;
    end if;
    new.canceled_at := null;
  else
    -- draft ou active, nenhuma das duas datas faz sentido
    new.canceled_at := null;
    new.ended_at := null;
  end if;
  return new;
end;
$$;

create trigger contracts_stamp_status_dates
  before insert or update of status on public.contracts
  for each row execute function public.tg_stamp_contract_status_dates();

-- Cuidado: o trigger acima dispara em "update of status". Se voce setar
-- canceled_at sem mudar status, ele NAO roda. Isso e proposital pra permitir
-- backdate via script de migracao (service-role). A CHECK constraint na
-- tabela continua segurando consistencia em qualquer caminho.

create or replace function public.tg_log_contract_status_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  actor uuid := auth.uid();
begin
  if tg_op = 'INSERT' then
    insert into public.contract_status_log (contract_id, from_status, to_status, changed_by)
    values (new.id, null, new.status, actor);
    return new;
  end if;

  if tg_op = 'UPDATE' and old.status is distinct from new.status then
    insert into public.contract_status_log (contract_id, from_status, to_status, changed_by)
    values (new.id, old.status, new.status, actor);
  end if;

  return new;
end;
$$;

create trigger contracts_log_status_change
  after insert or update of status on public.contracts
  for each row execute function public.tg_log_contract_status_change();

-- =====================================================================
-- Trigger pra alerts: carimba acknowledged_at/resolved_at conforme status
-- e quem mexeu. Mesmo padrao dos contratos.
-- =====================================================================
create or replace function public.tg_stamp_alert_status_dates()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'UPDATE' and old.status is distinct from new.status then
    if new.status = 'acknowledged' then
      if new.acknowledged_at is null then
        new.acknowledged_at := now();
        new.acknowledged_by := auth.uid();
      end if;
      new.resolved_at := null;
      new.resolved_by := null;
    elsif new.status = 'resolved' then
      if new.acknowledged_at is null then
        new.acknowledged_at := now();
        new.acknowledged_by := auth.uid();
      end if;
      if new.resolved_at is null then
        new.resolved_at := now();
        new.resolved_by := auth.uid();
      end if;
    elsif new.status = 'pending' then
      new.acknowledged_at := null;
      new.acknowledged_by := null;
      new.resolved_at := null;
      new.resolved_by := null;
    end if;
  end if;
  return new;
end;
$$;

create trigger alerts_stamp_status_dates
  before update of status on public.alerts
  for each row execute function public.tg_stamp_alert_status_dates();
