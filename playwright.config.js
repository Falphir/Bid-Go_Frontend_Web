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
