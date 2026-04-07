import { test, expect } from '../../fixtures/test-fixtures.js';
import { summarizeTransactions } from '../../utils/transaction-metrics.js';

test.describe('API | Reporting and statement', () => {
  test('should return seeded summary and statement totals', async ({ financeApi, testData }) => {
    await financeApi.login(testData.users.financeManager.email, testData.users.financeManager.password);

    const summaryResponse = await financeApi.getReportSummary();
    const statementResponse = await financeApi.getStatement();
    const pendingOnlyResponse = await financeApi.getStatement('pendente');
    const expectedSummary = summarizeTransactions(Object.values(testData.seedTransactions));

    expect(summaryResponse.summary.totalVolume).toBe(expectedSummary.totalVolume);
    expect(summaryResponse.summary.pendingAmount).toBe(expectedSummary.pendingAmount);
    expect(summaryResponse.summary.approvedAmount).toBe(expectedSummary.approvedAmount);
    expect(summaryResponse.summary.paidAmount).toBe(expectedSummary.paidAmount);

    expect(statementResponse.statement.totals.totalVolume).toBe(expectedSummary.totalVolume);
    expect(statementResponse.statement.totals.totalEntries).toBe(3);
    expect(pendingOnlyResponse.statement.entries).toHaveLength(1);
    expect(pendingOnlyResponse.statement.entries[0]?.description).toBe(testData.seedTransactions.pendingOfficeSupply.description);
  });
});
