import { test as base } from '@playwright/test';
import { transactionScenarios, seedTransactionCatalog } from './data/transactions.js';
import { users } from './data/users.js';
import { LoginPage } from '../pages/login.page.js';

type AppFixtures = {
  testData: {
    users: typeof users;
    transactions: typeof transactionScenarios;
    seedTransactions: typeof seedTransactionCatalog;
  };
  authenticatedPage: import('@playwright/test').Page;
};

export const test = base.extend<AppFixtures>({
  testData: async ({}, use) => {
    await use({
      users,
      transactions: transactionScenarios,
      seedTransactions: seedTransactionCatalog,
    });
  },

  authenticatedPage: async ({ page, request, testData }, use) => {
    const response = await request.post('/api/test/reset');

    if (response.status() !== 204) {
      throw new Error(`Expected reset endpoint to return 204, received ${response.status()}.`);
    }

    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(testData.users.financeManager.email, testData.users.financeManager.password);
    await use(page);
  },
});

export { expect } from '@playwright/test';
