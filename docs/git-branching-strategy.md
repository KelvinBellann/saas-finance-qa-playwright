# Git branching strategy

## Core branches

| Branch | Purpose |
| --- | --- |
| `main` | Production-ready baseline of the QA portfolio. Only validated code arrives here after merge from `develop`. |
| `develop` | Integration branch for features, refactors, docs and CI evolution before release. |

## Working branches

| Branch | Objective | Main files created or changed | Example commits |
| --- | --- | --- | --- |
| `feature/project-bootstrap` | Start the repository, install Playwright `1.59.1`, configure TypeScript, base scripts and app bootstrap. | `package.json`, `tsconfig.json`, `.env.example`, `.gitignore`, `playwright.config.ts`, `src/app/server.ts` | `chore: bootstrap senior qa portfolio with playwright 1.59.1`<br>`build: add typescript and runtime scripts for local finance app` |
| `feature/test-architecture` | Introduce reusable architecture with Page Objects, fixtures, API client and utilities. | `pages/*.ts`, `fixtures/test-fixtures.ts`, `fixtures/clients/finance-api-client.ts`, `utils/*.ts` | `feat: introduce reusable playwright fixtures and api client`<br>`refactor: isolate page objects and transaction summary helpers` |
| `feature/e2e-authentication` | Cover login positive and negative flows with stable selectors and resilient assertions. | `tests/e2e/login.spec.ts`, `pages/login.page.ts`, `pages/dashboard.page.ts`, `src/app/public/login.html`, `src/app/public/js/login.js` | `test: add positive and negative authentication journeys`<br>`feat: expose dashboard assertions for auth smoke flow` |
| `feature/e2e-financial-transactions` | Validate transaction creation, statement consistency and full financial lifecycle from UI. | `tests/e2e/transaction-creation.spec.ts`, `tests/e2e/statement.spec.ts`, `tests/e2e/financial-flow.spec.ts`, `pages/transactions.page.ts`, `pages/statement.page.ts`, `pages/reports.page.ts` | `test: automate transaction creation and statement coverage`<br>`test: validate full pending to paid financial lifecycle` |
| `feature/api-testing` | Cover authentication, user creation, transaction lifecycle and reporting endpoints. | `tests/api/auth-and-users.spec.ts`, `tests/api/transactions.spec.ts`, `tests/api/reporting.spec.ts`, `src/app/routes/api.ts` | `test: add api coverage for auth and user onboarding`<br>`test: validate transaction status transitions over api` |
| `feature/performance-k6` | Add smoke and load scenarios for critical endpoints with thresholds and shared auth helpers. | `performance/shared/finance.js`, `performance/smoke/transactions-smoke.js`, `performance/load/transactions-load.js` | `perf: add k6 smoke scenario for transaction creation`<br>`perf: add load scenario and thresholds for statement retrieval` |
| `feature/test-data-fixtures` | Centralize seed users, financial data and scenario payloads for deterministic execution. | `src/app/data/seeds.ts`, `fixtures/data/users.ts`, `fixtures/data/transactions.ts` | `testdata: centralize seeded finance users and transactions`<br>`testdata: add reusable scenario payloads for e2e and api suites` |
| `feature/reporting-and-trace` | Improve Playwright reporting, traces, screenshots, videos and artifact folders. | `playwright.config.ts`, `artifacts/`, `README.md` | `chore: enable html junit and json reporting`<br>`chore: retain traces screenshots and videos on failure` |
| `feature/ci-pipeline` | Build GitHub Actions workflow for quality gate and optional K6 smoke execution. | `.github/workflows/quality-pipeline.yml`, `package.json` | `ci: add playwright quality gate workflow`<br>`ci: publish k6 smoke artifacts from github actions` |
| `docs/readme-portfolio` | Write the professional portfolio narrative, execution guide, architecture and strategy. | `README.md`, `docs/git-branching-strategy.md` | `docs: write portfolio readme for finance qa project`<br>`docs: document real branching workflow and commit conventions` |
| `refactor/test-maintainability` | Improve maintainability, reduce duplication and keep selectors plus helpers stable. | `pages/*.ts`, `fixtures/*.ts`, `utils/*.ts`, `tests/**/*.ts` | `refactor: remove duplicated assertions across financial suites`<br>`refactor: simplify fixtures and page object responsibilities` |

## Recommended delivery flow

1. Branch from `develop`.
2. Keep commits small and intention-revealing.
3. Open a pull request into `develop`.
4. Let Playwright E2E, API and optional K6 smoke run in CI.
5. Merge `develop` into `main` only after the quality gate is green.
