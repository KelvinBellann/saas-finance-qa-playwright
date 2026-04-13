import { expect, type APIResponse, type Page } from '@playwright/test';

export async function expectJsonError(response: APIResponse, expectedStatus: number, expectedMessage: RegExp | string): Promise<void> {
  const payload = (await response.json()) as { message?: string; stack?: string };
  expect(response.status()).toBe(expectedStatus);
  expect(payload.message ?? '').toMatch(expectedMessage);
  expect(JSON.stringify(payload)).not.toContain('Error:');
  expect(JSON.stringify(payload)).not.toContain('at ');
  expect(payload.stack).toBeUndefined();
}

export function expectSecurityHeaders(headers: Record<string, string>): void {
  expect(headers['content-security-policy']).toContain("default-src 'self'");
  expect(headers['x-content-type-options']).toBe('nosniff');
  expect(headers['x-frame-options']).toBe('DENY');
  expect(headers['referrer-policy']).toBe('no-referrer');
  expect(headers['permissions-policy']).toContain('camera=()');
  expect(headers['cache-control']).toBe('no-store');
  expect(headers['x-powered-by']).toBeUndefined();
}

export async function expectLoginPage(page: Page): Promise<void> {
  await expect(page.getByTestId('login-page-title')).toBeVisible();
  await expect(page).toHaveURL(/\/login$/);
}
