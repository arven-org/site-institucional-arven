# Prompt inicial — Sistema de Gestao de Contratos da Arven

Cole isto como primeira mensagem no Claude Code, dentro de um diretorio vazio do projeto. A spec tecnica completa (`arven-contratos-spec.md`) deve estar no mesmo diretorio para consulta.

---

## Contexto

Voce vai construir do zero o novo sistema operacional de contratos da Arven. Ele substitui o ArvenOS na gestao de contratos e nasce como plataforma modular extensivel: a v1 entrega o modulo de contratos e a camada de metas/forecast, mas a fundacao precisa aguentar modulos futuros (pipeline de leads, dashboards) sem refatoracao.

A spec tecnica completa esta em `arven-contratos-spec.md`. Leia ela inteira antes de escrever qualquer linha. Ela e a fonte da verdade do escopo e da modelagem de dados. Este prompt define os padroes de execucao e a sequencia.

## Quem decide o que

Eu dirijo, arquiteto e tomo as decisoes. Voce implementa. Eu descrevo o que precisa ser construido em detalhe; voce executa com qualidade de um time de engenharia world-class. Nao peca confirmacao para decisoes obvias de implementacao, use julgamento e escolha a melhor opcao. Para decisoes de arquitetura ou de produto que tenham trade-off real, pare e me pergunte antes de seguir.

## Padroes inegociaveis

World-class em todas as camadas: seguranca, arquitetura, performance, qualidade, escala. Nunca shippe trabalho mediano. Quando em duvida, escolha o que um time de engenharia world-class escolheria.

Seguranca desde o primeiro commit. RLS habilitado em toda tabela, com a policy escrita no mesmo commit que cria a tabela. Nenhuma tabela exposta sem policy. Nada de dado financeiro sensivel em URL ou query string. Validacao de toda entrada (form, webhook, action) com Zod.

Performance e restricao de design, nao fase de otimizacao posterior. Pense em indices, em N+1, em payload, desde o desenho.

Testes nunca ficam para depois. Cada fatia entregue vem com seus testes passando. Sem teste, a fatia nao esta pronta.

Escolha ferramentas pela qualidade, nao pela popularidade.

Nunca construa para o passado. Modele para o que vem.

Regra de escrita universal, vale para tudo (codigo, comentarios, commits, copy de UI, documentacao): sem travessoes (em-dashes) em nenhum contexto. Use virgula, parenteses ou ponto.

## Stack (decidida, nao rediscutir sem motivo forte)

Next.js com App Router, Server Components e Server Actions. TypeScript estrito (`strict: true`, sem `any` solto).
Supabase: projeto novo e limpo. Postgres com RLS, Supabase Auth, Supabase Storage para PDFs.
Recharts para graficos.
Zod para validacao.
Deploy alvo: Vercel.
Gerenciador de pacotes: pnpm.

## Padrao de design (para quando chegarmos na UI)

Dark-first, tipografia editorial, sensibilidade cinematografica. Referencias: Linear, Stripe, Vercel, Mercury. Sistema de design baseado em tokens desde o inicio. Se parece template ou poderia pertencer a qualquer produto, reprovou. Simplista de verdade significa pouca coisa por tela e hierarquia visual forte, nao tela vazia.

## O que NAO fazer agora

Nao gere o sistema inteiro de uma vez. Nao crie telas antes do schema estar de pe e testado. Nao escreva a ingestao do Google Form antes do modulo de contratos existir. Vamos por fatias, na ordem abaixo, e eu valido cada uma antes de seguir.

## Sequencia de construcao

1. Fundacao: setup do projeto (Next.js, TypeScript estrito, pnpm, lint/format), conexao com Supabase, tokens de design, estrutura de pastas modular, Supabase Auth basico.
2. Schema completo + RLS + triggers de log (tabelas da spec: clients, contracts, contract_status_log, mrr_snapshots, alerts, growth_scenarios, growth_monthly). Migrations versionadas. Testes do schema e das policies.
3. Modulo de contratos: CRUD, os quatro estados (draft/active/ended/canceled), upload de PDF para Storage privado com URL assinada.
4. Seed de migracao dos 21 clientes, com MRR validado em centavos. A soma precisa bater com R$ 64.100. Se nao bater, pare e me avise.
5. Job diario de snapshot de MRR + motor de transicao de status por data + alertas de vencimento e renovacao.
6. Camada de metas/forecast plugada nos contratos reais + tela principal sobrepondo realizado, meta e forecast.
7. Ingestao do Google Form com portao de aprovacao (rascunho, revisao, promocao a ativo), webhook protegido por segredo e rate limit.

## Primeira tarefa (so a fatia 1)

Comece apenas pela fundacao. Antes de codar, me entregue:

1. Um plano curto da fatia 1: estrutura de pastas que voce vai criar e por que ela e modular e extensivel, escolhas de configuracao (ESLint, Prettier, tsconfig estrito), e como voce vai organizar a conexao com o Supabase de forma segura (variaveis de ambiente, separacao client/server).
2. As decisoes que precisam de mim antes de comecar, se houver alguma.

Nao escreva codigo ainda. Me mostre o plano da fundacao primeiro, eu aprovo, e ai voce executa a fatia 1 com seus testes. So depois passamos para a fatia 2.
