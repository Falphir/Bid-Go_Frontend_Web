const path = require('path');
try {
  require('dotenv').config({ path: path.resolve(__dirname, '.env.development') });
} catch (e) {
  console.warn('dotenv não pôde ser carregado em playwright.config.js:', e && e.message ? e.message : e);
}

const { devices } = require('@playwright/test');

/** @type {import('@playwright/test').PlaywrightTestConfig} */
module.exports = {
  testDir: './tests',
  timeout: 60_000,
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
    // Usar env-cmd para garantir que o process spawned carrega .env.development
    command: 'env-cmd -f .env.development npm start',
    port: 3000,
    timeout: 180_000,
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
};

const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
    testDir: './tests',
    use: {
        baseURL: 'http://localhost:3000',
        headless: true,
    },
    webServer: {
        // Também aqui: garantir variáveis ao iniciar o servidor para os testes do defineConfig
        command: 'env-cmd -f .env.development npm start',
        port: 3000,
        reuseExistingServer: !process.env.CI,
        timeout: 180000,
    },
});
