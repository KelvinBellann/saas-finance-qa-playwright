import { test, expect } from '../../fixtures/test-fixtures.js';
import { StatementPage } from '../../pages/statement.page.js';
import { summarizeTransactions } from '../../utils/transaction-metrics.js';

test.describe('E2E | Statement validation', () => {
  test('should validate seeded statement totals and filters', async ({ authenticatedPage, testData }) => {
    const statementPage = new StatementPage(authenticatedPage);
    const summary = summarizeTransactions(Object.values(testData.seedTransactions));

    await statementPage.goto();
    await statementPage.expectTotals(summary);
    await statementPage.expectEntry(
      testData.seedTransactions.paidInvoice.description,
      'pago',
      testData.seedTransactions.paidInvoice.amount,
    );

    await statementPage.filterByStatus('pago');
    await expect(authenticatedPage.getByTestId('statement-row')).toHaveCount(1);
    await statementPage.expectEntry(
      testData.seedTransactions.paidInvoice.description,
      'pago',
      testData.seedTransactions.paidInvoice.amount,
    );
  });
});
