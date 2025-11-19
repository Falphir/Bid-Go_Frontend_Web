// tests/example.e2e.spec.js
const { test, expect } = require('@playwright/test');

test('Homepage abre sem erros', async ({ page }) => {
    // Vai à root (usa baseURL do config)
    await page.goto('/');

    // Verifica se algo típico da tua página aparece
    // adapta o texto para algo que exista mesmo no teu App
    await expect(page.getByAltText(/Bid&Go/i)).toBeVisible();
});
