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
  workers: isCI ? 2 : undefined,
  timeout: 45_000,
  expect: {
    timeout: 10_000,
  },
  outputDir: 'test-results',
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'artifacts/reports/playwright-results.json' }],
    ['junit', { outputFile: 'artifacts/reports/junit.xml' }],
  ],
  use: {
    baseURL,
    headless: process.env.HEADLESS !== 'false',
    testIdAttribute: 'data-testid',
    actionTimeout: 10_000,
    navigationTimeout: 15_000,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
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
      testMatch: /tests[\\/]+e2e[\\/].*\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        baseURL,
      },
    },
    {
      name: 'firefox',
      testMatch: /tests[\\/]+e2e[\\/].*\.spec\.ts/,
      use: {
        ...devices['Desktop Firefox'],
        baseURL,
      },
    },
    {
      name: 'webkit',
      testMatch: /tests[\\/]+e2e[\\/].*\.spec\.ts/,
      use: {
        ...devices['Desktop Safari'],
        baseURL,
      },
    },
    {
      name: 'api',
      testMatch: /tests[\\/]+api[\\/].*\.spec\.ts/,
      use: {
        baseURL,
        extraHTTPHeaders: {
          Accept: 'application/json',
        },
      },
    },
  ],
});
