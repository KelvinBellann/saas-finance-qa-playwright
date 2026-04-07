import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config();

const port = Number(process.env.PORT ?? 3000);
const baseURL = process.env.BASE_URL ?? `http://127.0.0.1:${port}`;
const isCI = Boolean(process.env.CI);

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: undefined,
  timeout: 45_000,
  expect: {
    timeout: 10_000,
  },
  outputDir: 'test-results',
  reporter: [['list']],
  use: {
    baseURL,
    headless: process.env.HEADLESS !== 'false',
    testIdAttribute: 'data-testid',
    trace: 'off',
    screenshot: 'off',
    video: 'off',
    viewport: { width: 1440, height: 900 },
    ignoreHTTPSErrors: true,
  },
  webServer: {
    command: 'npm run app:start:test',
    url: `${baseURL}/api/health`,
    reuseExistingServer: !isCI,
    timeout: 120_000,
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        baseURL,
      },
    },
    {
      name: 'api',
      testMatch: /tests[\\/]+api[\\/].*\.spec\.ts/,
      use: {
        baseURL,
      },
    },
  ],
});
