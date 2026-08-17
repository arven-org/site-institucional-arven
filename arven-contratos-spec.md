# Sistema de Gestao de Contratos — Arven

**Spec tecnica v1.** Documento de arquitetura para execucao pelo agente. Validar antes de construir.

Este sistema nasce como substituto do ArvenOS. A v1 entrega o modulo de contratos e a camada de metas/forecast. Os demais modulos do ArvenOS (pipeline de leads, dashboards operacionais) migram em versoes futuras. Por isso a fundacao e desenhada como plataforma modular extensivel, nao como app de contratos isolado.

---

## 1. Principios de arquitetura

A fundacao precisa aguentar o que vem depois sem refatoracao. Decisoes que valem para todos os modulos:

A fonte da verdade dos contratos passa a ser este sistema. Nenhum dado de contrato vive fora dele. O MRR e sempre derivado dos contratos ativos, nunca digitado.

Contrato nunca e apagado. Encerramento e cancelamento sao mudancas de status, nao delecoes. O historico completo e imutavel e auditavel, porque churn, growth rate e a serie historica de MRR dependem dele.

O numero historico de cada dia e congelado em snapshot. O MRR de uma data passada nao muda quando um contrato e editado retroativamente. A serie temporal e gravada, nao recalculada ao vivo.

Seguranca desde o primeiro commit: RLS habilitado em todas as tabelas, nenhuma tabela exposta sem policy. Performance como restricao de design, nao fase posterior.

Modularidade: cada modulo (contratos, metas, futuramente leads) vive em seu proprio dominio de codigo e schema, conectados por contratos de dados estaveis (views), nao por acoplamento direto de tabelas.

---

## 2. Stack

Frontend e backend: Next.js (App Router) com Server Components e Server Actions. TypeScript estrito.

Banco e auth: projeto Supabase novo e limpo. Postgres com RLS. Supabase Auth para login. Supabase Storage para os PDFs.

Graficos: Recharts.

Deploy: Vercel.

Estilo: dark-first, tipografia editorial, sensibilidade cinematografica. Tokens de design desde o inicio. Referencias Linear, Stripe, Vercel.

Validacao: Zod em toda entrada (form, webhook, server action).

---

## 3. Modelo de dados

### 3.1 Tabela `clients`

O cliente. Um cliente tem N contratos (1:N).

| coluna     | tipo                      | nota                                              |
| ---------- | ------------------------- | ------------------------------------------------- |
| id         | uuid pk                   | gen_random_uuid()                                 |
| name       | text not null             | razao social ou nome                              |
| trade_name | text                      | nome fantasia                                     |
| document   | text                      | CNPJ/CPF, unico                                   |
| email      | text                      | contato principal                                 |
| phone      | text                      |                                                   |
| status     | text not null             | active / inactive (derivado: tem contrato ativo?) |
| notes      | text                      |                                                   |
| created_at | timestamptz default now() |                                                   |
| updated_at | timestamptz default now() |                                                   |

### 3.2 Tabela `contracts`

O coracao do sistema. Cada contrato pertence a um cliente.

| coluna      | tipo                           | nota                                                                                    |
| ----------- | ------------------------------ | --------------------------------------------------------------------------------------- |
| id          | uuid pk                        |                                                                                         |
| client_id   | uuid fk -> clients.id not null |                                                                                         |
| status      | text not null                  | draft / active / ended / canceled                                                       |
| mrr_cents   | bigint not null                | MRR em centavos. FONTE DA VERDADE do valor. Nunca centavos e reais em campos separados. |
| start_date  | date not null                  | inicio da vigencia                                                                      |
| end_date    | date                           | fim previsto da vigencia (null = indeterminado)                                         |
| canceled_at | date                           | preenchido so quando status vira canceled                                               |
| ended_at    | date                           | preenchido so quando status vira ended                                                  |
| renewal_of  | uuid fk -> contracts.id        | aponta para o contrato anterior, se for renovacao                                       |
| pdf_path    | text                           | caminho no Storage do PDF assinado                                                      |
| source      | text                           | manual / google_form / migration                                                        |
| source_ref  | text                           | id da resposta do form, se aplicavel                                                    |
| created_at  | timestamptz default now()      |                                                                                         |
| updated_at  | timestamptz default now()      |                                                                                         |

Decisao sobre valor monetario: existe apenas `mrr_cents` (bigint, centavos). Em nenhum lugar do banco ha um segundo campo de valor em reais. A conversao para reais acontece so na camada de exibicao (`mrr_cents / 100`). Isso elimina por design o bug de dois campos que divergem (origem de toda esta conversa).

Estados do contrato:

- `draft`: veio do Google Form, aguardando aprovacao. NAO conta no MRR.
- `active`: contrato vigente, conta no MRR.
- `ended`: chegou ao fim natural da vigencia. Sai do MRR a partir de `ended_at`.
- `canceled`: churn. Cliente cancelou antes do fim. Sai do MRR a partir de `canceled_at`.

A distincao entre `ended` e `canceled` importa: churn so conta cancelamento, nao termino natural. Misturar os dois infla o churn.

### 3.3 Tabela `contract_status_log`

Auditoria de toda mudanca de status. Imutavel, append-only.

| coluna      | tipo                      | nota                              |
| ----------- | ------------------------- | --------------------------------- |
| id          | uuid pk                   |                                   |
| contract_id | uuid fk not null          |                                   |
| from_status | text                      |                                   |
| to_status   | text not null             |                                   |
| changed_at  | timestamptz default now() |                                   |
| changed_by  | uuid                      | usuario que mudou                 |
| reason      | text                      | motivo do cancelamento, se houver |

Preenchida por trigger em todo UPDATE de `contracts.status`. Da rastreabilidade total: quando cada contrato mudou de estado e por quem.

### 3.4 Tabela `mrr_snapshots`

A serie historica congelada. Gravada por job diario. Esta tabela e o que torna o historico confiavel.

| coluna            | tipo                      | nota                                         |
| ----------------- | ------------------------- | -------------------------------------------- |
| id                | uuid pk                   |                                              |
| snapshot_date     | date not null unique      | uma linha por dia                            |
| mrr_cents         | bigint not null           | soma do MRR dos contratos ativos naquele dia |
| active_clients    | int not null              | contagem de clientes com contrato ativo      |
| active_contracts  | int not null              | contagem de contratos ativos                 |
| new_mrr_cents     | bigint not null           | MRR de contratos que viraram ativos no dia   |
| churned_mrr_cents | bigint not null           | MRR de contratos cancelados no dia           |
| created_at        | timestamptz default now() |                                              |

Com `new_mrr_cents` e `churned_mrr_cents` separados, voce calcula quick ratio, NRR e churn real direto da serie, sem decompor nada depois.

### 3.5 Tabela `alerts`

Alertas de vencimento e renovacao.

| coluna       | tipo                      | nota                              |
| ------------ | ------------------------- | --------------------------------- |
| id           | uuid pk                   |                                   |
| contract_id  | uuid fk not null          |                                   |
| type         | text not null             | expiring / renewal_due            |
| trigger_date | date not null             | quando o alerta deve disparar     |
| status       | text not null             | pending / acknowledged / resolved |
| created_at   | timestamptz default now() |                                   |

### 3.6 Tabelas de metas e forecast

`growth_scenarios`: cabecalho do cenario (nome, tipo meta/forecast, churn assumido, criado_em).

`growth_monthly`: linha por mes de cada cenario, com os inputs que voce edita (clientes alvo OU contratos novos, crescimento de ticket, capacidade) e espaco para os derivados. Espelha exatamente as duas planilhas ja construidas (meta dirigida por alvo, forecast dirigido por capacidade).

---

## 4. Modulo de Contratos

### 4.1 Ingestao via Google Form (com portao de aprovacao)

Fluxo: cliente preenche o Google Form -> Apps Script no form dispara um POST para um endpoint webhook do sistema -> o sistema valida (Zod) e grava um contrato com `status = draft` e `source = google_form` -> aparece numa fila de aprovacao na UI -> voce revisa (dado correto, nao e duplicado, nao e teste) -> promove para `active`.

Por que portao de aprovacao: um formulario externo nunca escreve direto na fonte da verdade financeira. Preenchimento errado, duplicado ou de teste contaminaria o MRR na hora. O estado `draft` e a barreira. So contrato aprovado entra no MRR.

Seguranca do webhook: o endpoint valida um segredo compartilhado (header secreto configurado no Apps Script e no env do sistema). Requisicao sem o segredo correto e rejeitada. Rate limit no endpoint. O payload e tratado como dado nao confiavel: nada do que vem no form e executado, so persistido apos validacao de schema.

### 4.2 Upload do PDF do contrato

PDF do contrato assinado vai para o Supabase Storage, em bucket privado (`contracts`), caminho `client_id/contract_id.pdf`. A tabela `contracts` guarda so o `pdf_path`. Acesso ao arquivo sempre via URL assinada de curta duracao, gerada server-side. Bucket nunca publico. PDF e dado sensivel (contrato de cliente), entao nunca exposto por URL direta.

### 4.3 Status por data e motor de transicao

Um job diario avalia cada contrato ativo e cuida das transicoes baseadas em data:

- contrato com `end_date` passada e sem renovacao -> candidato a `ended`.
- gera os registros em `alerts` conforme as regras abaixo.

Cancelamento (`canceled`) e sempre acao manual sua (churn e decisao de negocio, nao automatica por data). Termino (`ended`) pode ser automatico pela data de fim.

### 4.4 Alertas (v1: vencimento e renovacao)

`expiring`: dispara X dias antes de `end_date` (configuravel, default 30). Avisa que um contrato vai vencer.

`renewal_due`: dispara quando um contrato vence e nao ha contrato de renovacao apontando para ele (`renewal_of`). Avisa que precisa renovar ou o cliente vira churn.

Inadimplencia fica fora da v1 (depende de dado de pagamento que vive noutro lugar; entra quando o financeiro for integrado). Os dois alertas da v1 se calculam so com as datas que ja estao no contrato.

Entrega da v1: alertas aparecem como fila/badge dentro da aplicacao. Notificacao por email/Slack e refinamento de v2.

---

## 5. Camada de Metas e Forecast

Replica a logica das duas planilhas, agora alimentada pelos contratos reais.

O realizado vem dos `mrr_snapshots` (serie real, congelada). A meta e o forecast vivem em `growth_scenarios` / `growth_monthly` como projecoes.

Meta (dirigida por alvo): voce define a base de clientes alvo por mes; o sistema calcula quantos contratos novos sao necessarios, descontando o churn assumido. Espelha a planilha de meta.

Forecast (dirigido por capacidade): voce define contratos novos por mes (capacidade real); o sistema calcula onde a base e o MRR chegam. Espelha a planilha de forecast.

A tela principal sobrepoe os tres: realizado (linha solida, dos snapshots), meta (linha alvo) e forecast (linha projetada). E a leitura diaria que voce queria: estou acima ou abaixo da meta hoje, e onde a capacidade atual me leva.

Metricas derivadas exibidas: MRR atual, growth rate mes a mes, churn real (de `churned_mrr_cents`), quick ratio, clientes ativos. Tudo da serie de snapshots, nada digitado.

---

## 6. Migracao dos 21 clientes

Seed versionado e documentado, nao recadastro manual. Passos:

1. Levantar os 21 clientes ativos e seus contratos a partir da fonte atual (ArvenOS), usando `mrr_cents` como valor correto e ignorando o campo bugado.
2. Para cada um, criar registro em `clients` e o contrato correspondente em `contracts` com `source = migration`, `status = active`, `start_date` real, e `mrr_cents` validado.
3. Validar a soma: o MRR total migrado precisa bater com o MRR atual conhecido (R$ 64.100 na ultima leitura). Se nao bater, parar e investigar antes de seguir.
4. Gerar o primeiro `mrr_snapshots` do dia da migracao como marco zero da serie.

Esta e a oportunidade de entrar no sistema novo com dado correto desde o primeiro registro. O bug do valor morre aqui, na origem.

---

## 7. Seguranca (transversal)

RLS habilitado em todas as tabelas, sem excecao. Policies escritas no mesmo commit que cria a tabela.

Acesso restrito a poucos usuarios (voce e socios/gestores) via Supabase Auth. MRR e churn nao sao dados para qualquer membro do time.

Webhook do Google Form protegido por segredo compartilhado e rate limit. Payload tratado como nao confiavel.

PDFs em bucket privado, acesso so por URL assinada de curta duracao gerada server-side.

Nenhum dado financeiro sensivel em URL ou query string. Validacao Zod em toda fronteira de entrada.

---

## 8. Sequencia de construcao sugerida

1. Setup: projeto Supabase novo, Next.js, tokens de design, auth.
2. Schema completo + RLS + triggers de log. Recalcular e testar com dados de exemplo.
3. Modulo de contratos: CRUD, estados, upload de PDF.
4. Seed de migracao dos 21 clientes. Validar a soma do MRR.
5. Job diario de snapshot + motor de status + alertas.
6. Camada de metas/forecast + tela principal sobreposta.
7. Ingestao Google Form com portao de aprovacao.

Cada etapa entregue com testes. Nunca deixar teste para depois.

---

## 9. Pontos em aberto para decidir antes ou durante a construcao

Definicao de ARR: run-rate (MRR x 12) ou soma dos 12 meses. Cravar qual o board usa, e usar o mesmo nas planilhas e no sistema.

Origem do crescimento de ticket (os 2% ao mes): reajuste contratual, upsell ou migracao de plano. Define se a projecao de ticket e por contrato ou agregada.

Fuso/horario do job diario de snapshot (sugestao: 23h59 BRT, para fechar o dia).

Politica de retencao do PDF e LGPD: por quanto tempo guardar contrato de cliente que saiu.
