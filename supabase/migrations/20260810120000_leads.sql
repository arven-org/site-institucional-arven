-- =====================================================================
-- Arven, captura de leads do site institucional
-- =====================================================================
-- Tabela `leads`: alimentada pelo pop-up de qualificacao (CTA de agendar
-- reuniao ou de comprar o ebook). Fonte publica, escrita por visitante sem
-- sessao, portanto INSERT liberado para `anon` com `with check` estrito.
-- Leitura restrita a owner/admin. Sem UPDATE/DELETE via API.
--
-- Regra de qualificacao mora na app (lib/site/lead-gate.ts). Aqui guardamos as
-- respostas cruas + o flag `qualified` ja calculado, para o comercial priorizar.
-- =====================================================================

create table public.leads (
  id                  uuid primary key default gen_random_uuid(),
  created_at          timestamptz not null default now(),
  name                text not null,
  whatsapp            text not null,
  intent              text not null check (intent in ('schedule', 'ebook')),
  traffic_investment  text not null,
  commercial_team     text not null,
  qualified           boolean not null,
  source_path         text,
  user_agent          text
);

create index leads_created_at_idx on public.leads (created_at desc);
create index leads_qualified_idx  on public.leads (qualified);

-- =====================================================================
-- RLS
-- =====================================================================
alter table public.leads enable row level security;
alter table public.leads force row level security;

-- INSERT: publico (visitante anonimo do site + usuario logado). O `with check`
-- e a ultima linha de defesa contra payload lixo: limita tamanhos e restringe o
-- intent. A validacao rica (Zod) acontece na server action antes disto.
create policy "leads_insert_public"
  on public.leads
  for insert
  to anon, authenticated
  with check (
    char_length(name) between 1 and 120
    and char_length(whatsapp) between 8 and 40
    and intent in ('schedule', 'ebook')
    and char_length(traffic_investment) <= 40
    and char_length(commercial_team) <= 40
    and char_length(coalesce(source_path, '')) <= 200
    and char_length(coalesce(user_agent, '')) <= 400
  );

-- SELECT: apenas owner/admin leem os leads (mesmo padrao de current_user_role
-- usado nas demais tabelas). Membros comuns e anonimos nao leem nada.
create policy "leads_select_admin"
  on public.leads
  for select
  to authenticated
  using (public.current_user_role() in ('owner', 'admin'));

-- Sem policy de UPDATE/DELETE: negado por padrao com RLS ativo.

-- Grants coarse (a policy e o gate fino). anon/authenticated podem inserir;
-- so authenticated pode ler (e ainda filtrado pela policy de admin acima).
grant insert on public.leads to anon, authenticated;
grant select on public.leads to authenticated;
