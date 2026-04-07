# Portfolio QA para SaaS Financeiro

Portfolio de automacao QA ponta a ponta para um SaaS financeiro usando Playwright `1.59.1`, TypeScript, cobertura de API e cenarios de performance com K6.

## Visao geral

Este repositorio foi desenhado para rodar do zero. Em vez de depender de um sistema externo, ele inclui uma aplicacao demo de SaaS financeiro com:

- autenticacao e controle de sessao
- cadastro de usuarios via API
- criacao de transacoes financeiras
- consulta de extrato
- geracao de relatorios
- ciclo de status: `pendente`, `aprovado`, `pago`

## Por que este projeto existe

O objetivo e demonstrar maturidade senior em QA com uma stack e um fluxo de trabalho realistas:

- cobertura E2E com Playwright e Page Objects
- validacao de API com `request context` do Playwright
- testes de performance com K6
- dados deterministicos e estrategia de reset
- pipeline de CI com artefatos, traces, screenshots e videos
- modelo de branching proximo de times reais de entrega

## Stack

- Playwright `1.59.1`
- TypeScript
- Node.js `24`
- Express para o SaaS demo local
- K6 para validacao nao funcional
- GitHub Actions para CI

## Arquitetura

### Camadas de teste

- `tests/e2e`: fluxos de negocio via browser
- `tests/api`: validacao de servicos e regras em nivel de API
- `performance`: cenarios de smoke e carga para endpoints criticos

### Padroes utilizados

- Page Objects para abstracao da UI
- fixtures reutilizaveis para autenticacao, client de API e dados de teste
- catalogo de dados separado dos arquivos de teste
- camada utilitaria para formatacao monetaria e calculo de metricas financeiras
- reset deterministico da aplicacao via `/api/test/reset` em modo de teste

### Destaques da configuracao Playwright

- multiplos browsers: Chromium, Firefox e WebKit
- `baseURL` via ambiente
- retries habilitados para CI
- trace, screenshot e video retidos em falha
- reporters HTML, JSON e JUnit configurados

## Cobertura funcional vs nao funcional

### Cobertura funcional

- login positivo
- login negativo
- criacao de transacao
- validacao de extrato
- fluxo financeiro completo da criacao ao pagamento
- cobertura de API para autenticacao, usuarios, transacoes e relatorios

### Cobertura nao funcional

- cenario smoke com K6 para criacao de transacao e relatorio
- cenario de carga com criacao de transacao e consulta de extrato
- thresholds focados em `p95` e taxa de erro

## Estrutura do repositorio

```text
.
|-- .github/workflows/
|-- docs/
|-- fixtures/
|   |-- clients/
|   |-- data/
|   `-- test-fixtures.ts
|-- pages/
|-- performance/
|   |-- load/
|   |-- shared/
|   `-- smoke/
|-- src/app/
|   |-- data/
|   |-- public/
|   |-- routes/
|   `-- server.ts
|-- tests/
|   |-- api/
|   `-- e2e/
`-- utils/
```

## Execucao local

### 1. Instalar dependencias

```bash
npm install
```

### 2. Instalar browsers do Playwright

```bash
npm run pw:install
```

### 3. Subir o SaaS financeiro localmente

```bash
npm run app:start
```

URL da aplicacao:

- `http://127.0.0.1:3000`

Credenciais seed:

- `finance.manager@sentinel.local`
- `Playwright@123`

### 4. Rodar os testes E2E

```bash
npm run test:e2e
```

### 5. Rodar os testes de API

```bash
npm run test:api
```

### 6. Rodar toda a suite Playwright

```bash
npm test
```

### 7. Abrir o relatorio HTML do Playwright

```bash
npm run report:open
```

## Execucao do K6

Instale o K6 localmente antes de rodar a camada de performance.

### Cenario smoke

```bash
npm run perf:smoke
```

### Cenario de carga

```bash
npm run perf:load
```

Variaveis de ambiente disponiveis para o K6:

- `K6_BASE_URL`
- `K6_USER_EMAIL`
- `K6_USER_PASSWORD`

## Pipeline de CI

O workflow esta definido em `.github/workflows/quality-pipeline.yml`.

Ele executa:

- instalacao de dependencias com cache npm
- instalacao dos browsers Playwright
- validacao TypeScript
- execucao E2E
- execucao de API
- upload de artefatos com relatorios, logs, traces e screenshots
- execucao opcional do smoke de K6 em `main` ou via disparo manual

## Branching e fluxo profissional de Git

O repositorio foi estruturado em torno de:

- `main`
- `develop`

As branches de feature, docs e refactor estao documentadas em `docs/git-branching-strategy.md`.

## Scripts recomendados

- `npm run app:dev`: sobe o SaaS local em watch mode
- `npm run app:start:test`: sobe o SaaS com `TEST_MODE=true`
- `npm run typecheck`: valida TypeScript em app e testes
- `npm run test:e2e:headed`: abre Chromium em modo headed para debug

## Valor de portfolio

Este projeto foi desenhado para parecer e se comportar como um repositorio real de entrega QA, e nao apenas como uma estrutura de testes. A suite e executavel, a aplicacao testada esta incluida, os dados sao deterministicos e a pipeline de CI ja funciona como porta de qualidade em um fluxo profissional de Git.
