import { test } from '../../fixtures/test-fixtures.js';
import { TransactionsPage } from '../../pages/transactions.page.js';

test.describe('E2E | Financial transactions', () => {
  test('should create a new pending transaction', async ({ authenticatedPage, testData }) => {
    const transactionsPage = new TransactionsPage(authenticatedPage);

    await transactionsPage.goto();
    await transactionsPage.createTransaction(testData.transactions.newPendingTransaction);

    await transactionsPage.expectFeedback('Transacao criada com sucesso.');
    await transactionsPage.expectTransactionStatus(testData.transactions.newPendingTransaction.description, 'pendente');
    await transactionsPage.expectTransactionAmount(
      testData.transactions.newPendingTransaction.description,
      testData.transactions.newPendingTransaction.amount,
    );
  });
});
