import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';
import { formatCurrency } from '../utils/formatters.js';

interface TransactionInput {
  description: string;
  beneficiary: string;
  category: string;
  amount: number;
}

export class TransactionsPage {
  constructor(private readonly page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto('/transactions');
  }

  private rowByDescription(description: string) {
    return this.page.getByTestId('transaction-row').filter({ hasText: description });
  }

  async createTransaction(transaction: TransactionInput): Promise<void> {
    await this.page.getByTestId('transaction-description-input').fill(transaction.description);
    await this.page.getByTestId('transaction-beneficiary-input').fill(transaction.beneficiary);
    await this.page.getByTestId('transaction-category-select').selectOption(transaction.category);
    await this.page.getByTestId('transaction-amount-input').fill(String(transaction.amount));
    await this.page.getByTestId('transaction-submit-button').click();
  }

  async expectFeedback(message: string): Promise<void> {
    await expect(this.page.getByTestId('transaction-feedback')).toContainText(message);
  }

  async expectTransactionStatus(description: string, status: string): Promise<void> {
    await expect(this.rowByDescription(description).getByTestId('transaction-status')).toContainText(status);
  }

  async expectTransactionAmount(description: string, amount: number): Promise<void> {
    await expect(this.rowByDescription(description).getByTestId('transaction-amount')).toHaveText(formatCurrency(amount));
  }

  async approveTransaction(description: string): Promise<void> {
    await this.rowByDescription(description).getByTestId('approve-transaction-button').click();
  }

  async markAsPaid(description: string): Promise<void> {
    await this.rowByDescription(description).getByTestId('pay-transaction-button').click();
  }
}
