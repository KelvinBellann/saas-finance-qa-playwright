import { test, expect } from '../../fixtures/test-fixtures.js';
import { DashboardPage } from '../../pages/dashboard.page.js';
import { LoginPage } from '../../pages/login.page.js';
import { formatCurrency } from '../../utils/formatters.js';
import { summarizeTransactions } from '../../utils/transaction-metrics.js';

test.describe('E2E | Authentication', () => {
  test('should login with seeded manager credentials', async ({ page, testData }) => {
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);
    const summary = summarizeTransactions(Object.values(testData.seedTransactions));

    await loginPage.goto();
    await loginPage.login(testData.users.financeManager.email, testData.users.financeManager.password);

    await dashboardPage.expectLoaded();
    await dashboardPage.expectUser(testData.users.financeManager.name);
    await dashboardPage.expectMetric('summary-total-volume', formatCurrency(summary.totalVolume));
    await dashboardPage.expectMetric('summary-pending-amount', formatCurrency(summary.pendingAmount));
    await dashboardPage.expectMetric('summary-approved-count', String(summary.approvedCount));
    await dashboardPage.expectMetric('summary-paid-amount', formatCurrency(summary.paidAmount));
    await dashboardPage.expectRecentTransaction(testData.seedTransactions.paidInvoice.description);
  });

  test('should block login with invalid credentials', async ({ page, testData }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.submitInvalidCredentials(testData.users.invalidCredentials.email, testData.users.invalidCredentials.password);

    await loginPage.expectError('Credenciais invalidas');
    await expect(page).toHaveURL(/\/login$/);
  });
});
