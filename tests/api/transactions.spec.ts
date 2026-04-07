import { test, expect } from '../../fixtures/test-fixtures.js';

test.describe('API | Financial transactions', () => {
  test('should create and progress a transaction through approved and paid states', async ({ financeApi, testData }) => {
    await financeApi.login(testData.users.financeManager.email, testData.users.financeManager.password);

    const created = await financeApi.createTransaction(testData.transactions.apiCriticalTransaction);
    const approved = await financeApi.updateTransactionStatus(created.transaction.id, 'aprovado');
    const paid = await financeApi.updateTransactionStatus(created.transaction.id, 'pago');
    const transactions = await financeApi.listTransactions();

    expect(created.transaction.status).toBe('pendente');
    expect(approved.transaction.status).toBe('aprovado');
    expect(paid.transaction.status).toBe('pago');
    expect(transactions.transactions.find((transaction) => transaction.id === created.transaction.id)?.status).toBe('pago');
  });
});
