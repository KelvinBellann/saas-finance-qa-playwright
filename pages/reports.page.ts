import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';

export class ReportsPage {
  constructor(private readonly page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto('/reports');
  }

  async expectMetric(testId: string, value: string): Promise<void> {
    await expect(this.page.getByTestId(testId)).toHaveText(value);
  }
}
