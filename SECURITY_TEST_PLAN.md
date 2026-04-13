# Security Test Plan

## Scope

- Local Express finance SaaS and API routes under `src/app`
- Authentication, session cookie handling and brute-force protections
- Authorization around manager-only user provisioning
- Input tampering on transactions and role assignment
- Security headers, error handling and UI-safe rendering
- Dedicated CI lane for deterministic AppSec regression

## Risks Covered

- OWASP Top 10 2025: broken access control, identification and authentication failures, injection, security misconfiguration, vulnerable session handling
- OWASP ASVS: V2 authentication, V3 session management, V4 access control, V5 input validation, V8 data protection, V14 config
- OWASP WSTG: auth, authorization, rate limiting, error handling, headers, stored XSS checks

## Approach

- Security coverage runs only against the bundled local demo app
- Separate Playwright projects isolate `tests/security/api` and `tests/security/e2e`
- Helpers centralize malicious payloads and low-noise security assertions
- All scenarios use seeded data and non-destructive requests

## Automated Scenarios

- Invalid authentication returns controlled `401` messages without stack traces
- Repeated invalid logins return `429` plus `Retry-After`
- Session cookie is `HttpOnly`, `SameSite=Strict` and excludes password data
- Anonymous requests are denied with hardened browser/API headers
- Non-manager users cannot create accounts
- Role tampering is downgraded to `finance_viewer` instead of privilege escalation
- Invalid transaction payloads and status tampering are rejected
- Logout invalidates the session before protected navigation
- Script-like transaction descriptions are rendered safely in the UI

## Recommended Manual Scenarios

- Validate `Secure` cookies and TLS behavior behind HTTPS ingress
- Add DAST against a preview environment with auth-safe credentials
- Add dependency, secret and container scanning to upstream platform controls
- Review CSP after adding third-party assets or analytics

## Limitations And Assumptions

- Rate limiting is in-memory and intended for deterministic test/dev coverage
- The suite avoids destructive finance operations and production dependencies
- The repository already contains seeded demo credentials; controls focus on test-only scope and session behavior
