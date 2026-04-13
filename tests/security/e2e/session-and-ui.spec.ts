import { test, expect } from '../../../fixtures/test-fixtures.js';
import { maliciousPayloads } from '../helpers/payloads.js';
import { expectLoginPage } from '../helpers/assertions.js';

test.describe('Security | E2E session and UI controls @security', () => {
  test('redirects anonymous access to the login page and keeps credentials inputs blank', async ({ page }) => {
    await page.goto('/dashboard');
    await expectLoginPage(page);
    await expect(page.getByTestId('login-email-input')).toHaveValue('');
    await expect(page.getByTestId('login-password-input')).toHaveValue('');
  });

  test('invalidates session after logout and blocks stale route access', async ({ authenticatedPage: page }) => {
    await expect(page).toHaveURL(/\/dashboard$/);

    await page.getByTestId('logout-button').click();
    await expectLoginPage(page);

    await page.goto('/transactions');
    await expectLoginPage(page);
  });

  test('renders transaction descriptions safely when they contain script markup', async ({ authenticatedPage: page }) => {
    let dialogCount = 0;
    page.on('dialog', async (dialog) => {
      dialogCount += 1;
      await dialog.dismiss();
    });

    await page.goto('/transactions');
    await page.getByTestId('transaction-description-input').fill(maliciousPayloads.xss);
    await page.getByTestId('transaction-beneficiary-input').fill('Fornecedor Seguro');
    await page.getByTestId('transaction-category-select').selectOption('software');
    await page.getByTestId('transaction-amount-input').fill('123.45');
    await page.getByTestId('transaction-submit-button').click();

    await expect(page.getByTestId('transaction-feedback')).toContainText('Transacao criada com sucesso');
    await expect(page.getByTestId('transactions-table-body')).toContainText(maliciousPayloads.xss);
    expect(dialogCount).toBe(0);
  });
});
