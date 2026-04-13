# SaaS Finance QA Portfolio

Choose your language:

- [English](./README.en.md)
- [Portugues (Brasil)](./README.pt-BR.md)

---

Escolha o idioma:

- [English](./README.en.md)
- [Portugues (Brasil)](./README.pt-BR.md)

## What this repository is

A runnable senior QA automation portfolio for a financial SaaS, built with:

- Playwright `1.59.1`
- TypeScript
- API testing
- K6 performance scenarios
- GitHub Actions CI

The project includes its own demo financial SaaS so the full QA stack can run end to end.

## Security Layer

This repository now includes a dedicated AppSec regression layer designed for local and CI execution with controlled data. The suite is mapped to OWASP Top 10 2025, references OWASP ASVS and OWASP WSTG, and focuses on deterministic checks for authentication, authorization, session behavior, input tampering, response hardening and stored XSS-safe rendering.

Security automation lives under `tests/security`, with reusable helpers in `tests/security/helpers`, a dedicated execution command `npm run test:security`, and an isolated GitHub Actions workflow in `.github/workflows/security.yml`.

See [SECURITY_TEST_PLAN.md](./SECURITY_TEST_PLAN.md) for scope, covered risks, manual follow-ups and explicit limitations.

## O que este repositorio e

Um portfolio senior de automacao QA para um SaaS financeiro, pronto para execucao, com:

- Playwright `1.59.1`
- TypeScript
- testes de API
- cenarios de performance com K6
- CI com GitHub Actions

O projeto inclui um SaaS financeiro demo para que toda a estrategia de QA rode ponta a ponta.
