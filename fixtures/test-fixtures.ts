import { expect, test as base } from '@playwright/test';
import { FinanceApiClient } from './clients/finance-api-client.js';
import { transactionScenarios, seedTransactionCatalog } from './data/transactions.js';
import { users } from './data/users.js';
import { LoginPage } from '../pages/login.page.js';

type AppFixtures = {
  testData: {
    users: typeof users;
    transactions: typeof transactionScenarios;
    seedTransactions: typeof seedTransactionCatalog;
  };
  financeApi: FinanceApiClient;
  authenticatedPage: import('@playwright/test').Page;
};

type FullFixtures = AppFixtures & {
  resetState: void;
};

export const test = base.extend<FullFixtures>({
  testData: async ({}, use) => {
    await use({
      users,
      transactions: transactionScenarios,
      seedTransactions: seedTransactionCatalog,
    });
  },

  resetState: [
    async ({ request }, use) => {
      const response = await request.post('/api/test/reset');

      if (response.status() !== 204) {
        throw new Error(`Expected reset endpoint to return 204, received ${response.status()}.`);
      }

      await use();
    },
    { auto: true },
  ],

  financeApi: async ({ request }, use) => {
    await use(new FinanceApiClient(request));
  },

  authenticatedPage: async ({ page, testData }, use) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(testData.users.financeManager.email, testData.users.financeManager.password);
    await use(page);
  },
});

export { expect };
