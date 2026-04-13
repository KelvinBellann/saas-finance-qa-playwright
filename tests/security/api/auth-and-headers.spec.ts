import { test, expect } from '../../../fixtures/test-fixtures.js';
import { maliciousPayloads } from '../helpers/payloads.js';
import { expectJsonError, expectSecurityHeaders } from '../helpers/assertions.js';

test.describe('Security | API auth and hardening @security', () => {
  test('rejects anonymous access with hardened headers and no permissive CORS', async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}/api/me`, {
      headers: {
        Origin: 'https://attacker.example',
      },
    });

    expectSecurityHeaders(response.headers());
    await expectJsonError(response, 401, /Sessao invalida ou expirada\./);
    expect(response.headers()['access-control-allow-origin']).toBeUndefined();
  });

  test('rate limits repeated invalid logins and returns retry guidance', async ({ request, baseURL }) => {
    let lastResponse;

    for (let attempt = 0; attempt < 6; attempt += 1) {
      lastResponse = await request.post(`${baseURL}/api/auth/login`, {
        data: {
          email: 'finance.manager@sentinel.local',
          password: `wrong-${attempt}`,
        },
      });
    }

    expect(lastResponse).toBeDefined();
    await expectJsonError(lastResponse!, 429, /Muitas tentativas invalidas/);
    expect(Number(lastResponse!.headers()['retry-after'])).toBeGreaterThan(0);
  });

  test('does not leak secrets or stack traces for injection-like login payloads', async ({ request, baseURL }) => {
    const response = await request.post(`${baseURL}/api/auth/login`, {
      data: {
        email: maliciousPayloads.sqlInjection,
        password: maliciousPayloads.headerInjection,
      },
    });

    await expectJsonError(response, 401, /Credenciais invalidas/);
    const payloadText = await response.text();
    expect(payloadText).not.toContain('Playwright@123');
    expect(payloadText).not.toContain('password');
  });

  test('issues a hardened session cookie and sanitized user payload', async ({ request, baseURL, testData }) => {
    const response = await request.post(`${baseURL}/api/auth/login`, {
      data: {
        email: testData.users.financeManager.email,
        password: testData.users.financeManager.password,
      },
    });

    const payload = await response.json();
    const setCookie = response.headers()['set-cookie'] ?? '';

    expect(response.status()).toBe(200);
    expect(setCookie).toContain('HttpOnly');
    expect(setCookie).toContain('SameSite=Strict');
    expect(setCookie).toContain('Path=/');
    expect(payload.user.password).toBeUndefined();
  });
});
