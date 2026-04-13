# SaaS Finance QA Portfolio

End-to-end QA automation portfolio for a financial SaaS using Playwright `1.59.1`, TypeScript, API coverage and K6 performance scenarios.

## Overview

This repository is intentionally runnable from scratch. Instead of depending on a third-party system, it ships with a lightweight financial SaaS demo application that includes:

- authentication and session handling
- user creation via API
- financial transaction creation
- statement consultation
- management reporting
- transaction lifecycle status: `pendente`, `aprovado`, `pago`

## Why this project exists

The goal is to demonstrate senior-level QA maturity through a realistic stack and workflow:

- E2E coverage with Playwright and Page Objects
- API validation using Playwright request context
- performance checks with K6
- deterministic test data and reset strategy
- CI pipeline with artifacts, traces, screenshots and videos
- Git branching model close to real delivery teams

## Stack

- Playwright `1.59.1`
- TypeScript
- Node.js `24`
- Express for the local demo SaaS
- K6 for non-functional validation
- GitHub Actions for CI

## Architecture

### Test layers

- `tests/e2e`: browser-based business flows
- `tests/api`: service validation and data-level assertions
- `performance`: smoke and load scenarios for critical endpoints

### Design patterns

- Page Objects for UI abstraction
- reusable fixtures for auth, API client and test data
- test data catalog separated from the test files
- utility layer for currency formatting and financial metric calculation
- deterministic app reset through `/api/test/reset` in test mode

### Playwright configuration highlights

- multiple browsers: Chromium, Firefox and WebKit
- `baseURL` from environment
- retries enabled for CI
- trace, screenshot and video retained on failure
- HTML, JSON and JUnit reporters enabled

## Functional vs non-functional coverage

### Functional coverage

- positive login flow
- negative login flow
- transaction creation
- statement validation
- complete financial flow from creation to payment
- API coverage for auth, users, transactions and reports

### Non-functional coverage

- K6 smoke scenario for critical transaction creation and reporting
- K6 load scenario for transaction creation plus statement consultation
- thresholds focused on `p95` latency and failure rate

## Repository structure

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

## Local execution

### 1. Install dependencies

```bash
npm install
```

### 2. Install Playwright browsers

```bash
npm run pw:install
```

### 3. Start the financial SaaS locally

```bash
npm run app:start
```

Application URL:

- `http://127.0.0.1:3000`

Seed credentials:

- `finance.manager@sentinel.local`
- `Playwright@123`

### 4. Run E2E tests

```bash
npm run test:e2e
```

### 5. Run API tests

```bash
npm run test:api
```

### 6. Run security tests

```bash
npm run test:security
```

### 7. Run all Playwright suites

```bash
npm test
```

### 8. Open the Playwright HTML report

```bash
npm run report:open
```

## K6 execution

Install K6 locally before running the performance layer.

### Smoke scenario

```bash
npm run perf:smoke
```

### Load scenario

```bash
npm run perf:load
```

Environment variables available for K6:

- `K6_BASE_URL`
- `K6_USER_EMAIL`
- `K6_USER_PASSWORD`

## CI pipeline

The workflow is defined in `.github/workflows/quality-pipeline.yml`.

It performs:

- dependency installation with npm cache
- Playwright browser installation
- TypeScript validation
- E2E execution
- API execution
- artifact upload for reports, logs, traces and screenshots
- optional K6 smoke execution on `main` or manual dispatch

A dedicated security gate is also available in `.github/workflows/security.yml` so authentication, authorization, session, header and payload-tampering checks can run independently in CI/CD.

## Security regression suite

The security lane is intentionally pragmatic and low-noise. It covers the controls that are observable in the local demo application and keeps its evidence traceable for shift-left usage in pull requests and pipelines.

### Covered scope

- invalid authentication and basic brute-force rate limiting
- broken authorization around manager-only user creation
- payload tampering on transaction creation and status changes
- session cookie hardening and logout invalidation
- security headers and non-permissive CORS defaults
- error responses without stack traces or password leakage
- safe rendering of script-like transaction descriptions

### Limitations

- checks run only against local dev/test data and never against production
- HTTPS-only validations such as `Secure` cookies remain manual checks for real ingress layers
- DAST, SAST, dependency scanning, secret scanning and container scanning are recommended complementary layers

See [SECURITY_TEST_PLAN.md](./SECURITY_TEST_PLAN.md) for the full plan and OWASP mapping.

## Branching and professional Git flow

The repository is structured around:

- `main`
- `develop`

Detailed feature, docs and refactor branches are documented in `docs/git-branching-strategy.md`.

## Recommended scripts

- `npm run app:dev`: run the local SaaS in watch mode
- `npm run app:start:test`: run the SaaS with `TEST_MODE=true`
- `npm run typecheck`: validate TypeScript across app and tests
- `npm run test:e2e:headed`: open Chromium headed for debugging

## Portfolio value

This project is designed to look and behave like a real QA delivery repository, not only a test skeleton. The suite is executable, the application under test is bundled, the test data is deterministic, and the CI pipeline is ready to operate as a quality gate in a professional Git workflow.
