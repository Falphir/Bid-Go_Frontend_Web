import { test, expect } from '@playwright/test';

test.describe('RF-001 - Aceitação - Registar Empresa', () => {

    // -----------------------------------------
    // CT01 - Registo válido (sucesso)
    // -----------------------------------------
    test('CT01 - Deve permitir registar empresa com dados válidos', async ({ page }) => {

        // Mock do sucesso
        await page.route('**/register/company', route => {
            route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ message: "Account successfully registered" })
            });
        });

        await page.goto('http://localhost:3000/register');
        await page.click('text=Company');

        await page.fill('input[placeholder="Name"]', 'Empresa Teste');
        await page.fill('input[placeholder="Company Name"]', 'ACME Ltd');
        await page.fill('input[placeholder="Address"]', 'Rua Teste 1');

        const email = `valid-${Date.now()}@example.com`;
        await page.fill('input[placeholder="Email"]', email);

        await page.fill('input[placeholder="Phone"]', '912345678');
        await page.fill('input[placeholder="NIF"]', '123456789');

        await page.fill('input[autocomplete="off"]', 'Abcd1234!');

        await page.click('button:has-text("Register")');

        await expect(page.getByText(/Account successfully registered/i)).toBeVisible();
    });

    // -----------------------------------------
    // CT02 - Email já registado
    // -----------------------------------------
    test('CT02 - Não deve permitir registar empresa com email já registado', async ({ page }) => {

        await page.route('**/register/company', route => {
            route.fulfill({
                status: 400,
                contentType: 'application/json',
                body: JSON.stringify({
                    message: "Email is already registered."
                })
            });
        });

        await page.goto('http://localhost:3000/register');
        await page.click('text=Company');

        await page.fill('input[placeholder="Name"]', 'Empresa Teste');
        await page.fill('input[placeholder="Company Name"]', 'ACME Ltd');
        await page.fill('input[placeholder="Address"]', 'Rua Teste');

        await page.fill('input[placeholder="Email"]', 'duplicado@example.com');
        await page.fill('input[placeholder="Phone"]', '912345678');
        await page.fill('input[placeholder="NIF"]', '123456789');

        await page.fill('input[autocomplete="off"]', 'Abcd1234!');

        await page.click('button:has-text("Register")');

        await expect(page.getByText(/Email is already registered/i)).toBeVisible();
    });

    // -----------------------------------------
    // CT03 - NIF inválido
    // -----------------------------------------
    test('CT03 - Não deve permitir registo com NIF inválido', async ({ page }) => {

        await page.route('**/register/company', route => {
            route.fulfill({
                status: 400,
                contentType: 'application/json',
                body: JSON.stringify({
                    message: "NIF: Tax ID (NIF) must contain between 9 and 10 digits."
                })
            });
        });

        await page.goto('http://localhost:3000/register');
        await page.click('text=Company');

        await page.fill('input[placeholder="Name"]', 'Empresa Teste');
        await page.fill('input[placeholder="Company Name"]', 'ACME Ltd');
        await page.fill('input[placeholder="Address"]', 'Rua Teste');

        await page.fill('input[placeholder="Email"]', `valid-${Date.now()}@example.com`);
        await page.fill('input[placeholder="Phone"]', '912345678');

        await page.fill('input[placeholder="NIF"]', '123');  // inválido

        await page.fill('input[autocomplete="off"]', 'Abcd1234!');

        await page.click('button:has-text("Register")');

        await expect(page.getByText(/NIF: Tax ID/i)).toBeVisible();
    });

    // -----------------------------------------
    // CT04 - Password fraca
    // -----------------------------------------
    test('CT04 - Não deve permitir registo com password fraca', async ({ page }) => {

        await page.route('**/register/company', route => {
            route.fulfill({
                status: 400,
                contentType: 'application/json',
                body: JSON.stringify({
                    message: "Password: Password must have at least 8 characters, including an uppercase letter, a lowercase letter, a number, and a special character."
                })
            });
        });

        await page.goto('http://localhost:3000/register');
        await page.click('text=Company');

        await page.fill('input[placeholder="Name"]', 'Empresa Teste');
        await page.fill('input[placeholder="Company Name"]', 'ACME Ltd');
        await page.fill('input[placeholder="Address"]', 'Rua Teste');

        await page.fill('input[placeholder="Email"]', `valid-${Date.now()}@example.com`);
        await page.fill('input[placeholder="Phone"]', '912345678');
        await page.fill('input[placeholder="NIF"]', '123456789');

        await page.fill('input[autocomplete="off"]', 'abc'); // password fraca

        await page.click('button:has-text("Register")');

        await expect(page.getByText(/Password must have at least 8 characters/i)).toBeVisible();
    });

});
