import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';

export class LoginPage {
  constructor(private readonly page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto('/login');
  }

  async login(email: string, password: string): Promise<void> {
    await this.page.getByTestId('login-email-input').fill(email);
    await this.page.getByTestId('login-password-input').fill(password);
    await Promise.all([
      this.page.waitForURL('**/dashboard'),
      this.page.getByTestId('login-submit-button').click(),
    ]);
  }

  async submitInvalidCredentials(email: string, password: string): Promise<void> {
    await this.page.getByTestId('login-email-input').fill(email);
    await this.page.getByTestId('login-password-input').fill(password);
    await this.page.getByTestId('login-submit-button').click();
  }

  async expectError(message: string): Promise<void> {
    await expect(this.page.getByTestId('login-error-alert')).toContainText(message);
  }
}
