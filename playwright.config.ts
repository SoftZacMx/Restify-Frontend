import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E config.
 * baseURL: app must be served at http://localhost:5173 (Vite default).
 * webServer: starts the app automatically; in CI it runs in the background.
 * Login E2E requires the backend API to be running for auth to succeed.
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on', // Always record trace so UI shows steps, screenshots and logs when tests pass
  },
  timeout: 15_000,
  expect: { timeout: 10_000 },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
});
