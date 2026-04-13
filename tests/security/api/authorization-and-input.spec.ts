import { test, expect } from '../../../fixtures/test-fixtures.js';

test.describe('Security | API authorization and payload tampering @security', () => {
  test('blocks user creation for non-manager profiles', async ({ request, baseURL, testData }) => {
    const loginResponse = await request.post(`${baseURL}/api/auth/login`, {
      data: {
        email: testData.users.financeAnalyst.email,
        password: testData.users.financeAnalyst.password,
      },
    });

    const loginPayload = await loginResponse.json();
    const response = await request.post(`${baseURL}/api/users`, {
      headers: {
        Authorization: `Bearer ${loginPayload.token}`,
      },
      data: testData.users.newViewer,
    });

    const payload = await response.json();
    expect(response.status()).toBe(403);
    expect(payload.message).toContain('Apenas gestores financeiros');
  });

  test('downgrades unexpected role tampering instead of escalating privileges', async ({ financeApi }) => {
    await financeApi.login('finance.manager@sentinel.local', 'Playwright@123');

    const created = await financeApi.createUser({
      name: 'Operador Tamper',
      email: 'operador.tamper@sentinel.local',
      password: 'Playwright@123',
      role: 'finance_manager<script>',
    });

    expect(created.user.role).toBe('finance_viewer');
  });

  test('rejects transaction tampering with invalid amount and invalid status transitions', async ({ request, baseURL, testData }) => {
    const loginResponse = await request.post(`${baseURL}/api/auth/login`, {
      data: {
        email: testData.users.financeManager.email,
        password: testData.users.financeManager.password,
      },
    });
    const { token } = await loginResponse.json();

    const invalidAmountResponse = await request.post(`${baseURL}/api/transactions`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      data: {
        description: 'tampered transaction',
        beneficiary: 'beneficiary',
        category: 'operations',
        amount: -1,
      },
    });

    const invalidStatusResponse = await request.patch(`${baseURL}/api/transactions/txn-paid-001/status`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      data: {
        status: 'pendente',
      },
    });

    expect(invalidAmountResponse.status()).toBe(400);
    expect((await invalidAmountResponse.json()).message).toContain('maior que zero');
    expect(invalidStatusResponse.status()).toBe(400);
    expect((await invalidStatusResponse.json()).message).toContain('Transicao de status invalida');
  });
});
