import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';
import { formatCurrency } from '../utils/formatters.js';

export class StatementPage {
  constructor(private readonly page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto('/statement');
  }

  private rowByDescription(description: string) {
    return this.page.getByTestId('statement-row').filter({ hasText: description });
  }

  async filterByStatus(status: '' | 'pendente' | 'aprovado' | 'pago'): Promise<void> {
    await this.page.getByTestId('statement-status-filter').selectOption(status);
  }

  async expectTotals(totals: {
    totalVolume: number;
    pendingAmount: number;
    approvedAmount: number;
    paidAmount: number;
  }): Promise<void> {
    await expect(this.page.getByTestId('statement-total-volume')).toHaveText(formatCurrency(totals.totalVolume));
    await expect(this.page.getByTestId('statement-pending-total')).toHaveText(formatCurrency(totals.pendingAmount));
    await expect(this.page.getByTestId('statement-approved-total')).toHaveText(formatCurrency(totals.approvedAmount));
    await expect(this.page.getByTestId('statement-paid-total')).toHaveText(formatCurrency(totals.paidAmount));
  }

  async expectEntry(description: string, status: string, amount: number): Promise<void> {
    const row = this.rowByDescription(description);
    await expect(row.getByTestId('statement-status')).toContainText(status);
    await expect(row.getByTestId('statement-amount')).toHaveText(formatCurrency(amount));
  }
}
