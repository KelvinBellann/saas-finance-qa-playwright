import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';

export class DashboardPage {
  constructor(private readonly page: Page) {}

  async expectLoaded(): Promise<void> {
    await expect(this.page.getByTestId('dashboard-page-title')).toHaveText('Painel financeiro');
  }

  async expectUser(name: string): Promise<void> {
    await expect(this.page.getByTestId('app-user-name')).toHaveText(name);
  }

  async expectMetric(testId: string, value: string): Promise<void> {
    await expect(this.page.getByTestId(testId)).toHaveText(value);
  }

  async expectRecentTransaction(description: string): Promise<void> {
    await expect(this.page.getByTestId('recent-transactions-list')).toContainText(description);
  }
}
