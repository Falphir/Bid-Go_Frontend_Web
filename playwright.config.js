// Playwright config for the project
const { devices } = require('@playwright/test');

/** @type {import('@playwright/test').PlaywrightTestConfig} */
module.exports = {
  testDir: './tests',
  timeout: 30_000,
  expect: { timeout: 5000 },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['list'], ['html', { outputFolder: 'playwright-report' }]],
  use: {
    headless: true,
    viewport: { width: 1280, height: 720 },
    actionTimeout: 5000,
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'npm start',
    port: 3000,
    timeout: 120_000,
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
};
// playwright.config.js
const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
    // Como tens o teste em src/tests
    testDir: './tests',
    use: {
        baseURL: 'http://localhost:3000', // base para page.goto('/')
        headless: true,
    },
    webServer: {
        command: 'npm start',
        port: 3000,                    // ✅ apenas port
        reuseExistingServer: !process.env.CI,
        timeout: 120000,
    },
});
