import { test } from '../../fixtures/test-fixtures.js';
import { ReportsPage } from '../../pages/reports.page.js';
import { StatementPage } from '../../pages/statement.page.js';
import { TransactionsPage } from '../../pages/transactions.page.js';
import { formatCurrency, formatPercent } from '../../utils/formatters.js';
import { summarizeTransactions } from '../../utils/transaction-metrics.js';

test.describe('E2E | Full financial flow', () => {
  test('should create, approve, pay and reflect the transaction across statement and reports', async ({
    authenticatedPage,
    testData,
  }) => {
    const transactionsPage = new TransactionsPage(authenticatedPage);
    const statementPage = new StatementPage(authenticatedPage);
    const reportsPage = new ReportsPage(authenticatedPage);

    await transactionsPage.goto();
    await transactionsPage.createTransaction(testData.transactions.endToEndSettlement);
    await transactionsPage.expectTransactionStatus(testData.transactions.endToEndSettlement.description, 'pendente');

    await transactionsPage.approveTransaction(testData.transactions.endToEndSettlement.description);
    await transactionsPage.expectTransactionStatus(testData.transactions.endToEndSettlement.description, 'aprovado');

    await transactionsPage.markAsPaid(testData.transactions.endToEndSettlement.description);
    await transactionsPage.expectTransactionStatus(testData.transactions.endToEndSettlement.description, 'pago');

    const expectedSummary = summarizeTransactions([
      ...Object.values(testData.seedTransactions),
      {
        amount: testData.transactions.endToEndSettlement.amount,
        status: 'pago',
      },
    ]);

    await statementPage.goto();
    await statementPage.expectTotals(expectedSummary);
    await statementPage.expectEntry(
      testData.transactions.endToEndSettlement.description,
      'pago',
      testData.transactions.endToEndSettlement.amount,
    );

    await reportsPage.goto();
    await reportsPage.expectMetric('report-total-volume', formatCurrency(expectedSummary.totalVolume));
    await reportsPage.expectMetric('report-paid-total', formatCurrency(expectedSummary.paidAmount));
    await reportsPage.expectMetric('report-approval-rate', formatPercent(expectedSummary.approvalRate));
    await reportsPage.expectMetric('report-pending-count', String(expectedSummary.pendingCount));
    await reportsPage.expectMetric('report-approved-count', String(expectedSummary.approvedCount));
    await reportsPage.expectMetric('report-paid-count', String(expectedSummary.paidCount));
  });
});
