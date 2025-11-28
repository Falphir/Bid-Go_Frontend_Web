const { test, expect } = require('@playwright/test');
const db = require('./utilis/db'); // Confirma se a pasta é 'utilis' ou 'utils'
const path = require('path');

test.describe('System Test: Create Transport Request', () => {
    const timestamp = Date.now();

    const userData = {
        email: `company${timestamp}@gmail.com`,
        password: 'Bidandgo@25',
        name: 'Company E2E Tester',
        PhoneNumber : '222333222',
        nif : '111111122',
        companyName: "Company E2E Lda",
        address:"Rua de Teste",
    };

    // Variável para guardar o ID gerado pelo Backend
    let userId;

    // --- 1. SETUP: REGISTAR VIA UI + RECUPERAR ID ---
    test.beforeAll(async ({ browser }) => {
        console.log('--- SETUP: A registar utilizador via UI ---');

        const context = await browser.newContext();
        const page = await context.newPage();

        try {
            // A. Ir para a página de registo
            await page.goto('http://localhost:3000/Register');

            // --- PASSO 1: ESCOLHER TIPO DE CONTA ---
            await expect(page.getByText(/Choose the account type/i)).toBeVisible();
            await page.getByText('Company', { exact: true }).click();

            // --- PASSO 2: PREENCHER FORMULÁRIO ---
            await page.getByLabel('Name', { exact: true }).fill(userData.name);
            await page.getByLabel('Company Name').fill(userData.companyName);
            await page.getByLabel('Address').fill(userData.address);
            await page.getByLabel('Email').fill(userData.email);
            await page.locator('input[type="password"]').fill(userData.password);
            await page.getByLabel('Phone').fill(userData.PhoneNumber);
            await page.getByLabel('NIF').fill(userData.nif);

            // --- PASSO 3: SUBMETER ---
            await page.getByRole('button', { name: /Register/i }).click();

            // Esperar que o registo processe
            await page.waitForTimeout(3000);
            console.log('Registo submetido via UI.');

        } catch (e) {
            console.error('Erro no preenchimento do registo:', e);
            throw e;
        }

        // --- PASSO 4 (CRITICO): BUSCAR O ID GERADO À BD ---
        // Sem isto, o userId fica undefined!
        console.log('A recuperar o ID do utilizador na BD...');

        // Nota: Usa 'Users' com maiúscula por precaução
        const rows = await db.query('SELECT * FROM Users WHERE Email = ?', [userData.email]);

        if (rows.length > 0) {
            // Tenta ler Id (Maiúsculo) ou id (Minúsculo) para evitar erros
            userId = rows[0].Id || rows[0].id;

            console.log(`✅ User encontrado! ID: ${userId}`);

        } else {
            throw new Error("Erro Crítico: O user registado não apareceu na base de dados (Tabela vazia ou email diferente).");
        }

        await page.close();
        await context.close();
    });

    // --- 3. LIMPEZA (TEARDOWN) ---
    test.afterAll(async () => {
        console.log('--- TEARDOWN ---');
        if (userId) {
            try {
                // Tenta limpar transportes primeiro (por causa da chave estrangeira)
                // Usa CompanyId ou userId conforme a tua tabela
                await db.query('DELETE FROM TransportRequests WHERE CompanyId = ?', [userId]);
                await db.query('DELETE FROM Users WHERE Id = ?', [userId]);
            } catch (error) {
                console.error("Erro ao limpar DB:", error.message);
            }
        }
        await db.close();
    });

    // --- 4. O TESTE REAL ---
    test('User can login and create a transport request', async ({ page }) => {
        // Logs para debug
        page.on('console', msg => console.log(`Browser: ${msg.text()}`));

        // LOGIN
        console.log('A fazer Login...');
        await page.goto('http://localhost:3000/Login');

        await page.getByLabel(/email/i).fill(userData.email);
        await page.locator('input[type="password"]').fill(userData.password);
        await page.getByRole('button', { name: /sign in/i }).click();

        // Validar Login
        await expect(page).toHaveURL(/\/$/, { timeout: 10000 });
        console.log('Login com sucesso!');

        // CRIAR TRANSPORTE
        console.log('A criar transporte...');
        await page.goto('http://localhost:3000/createRequest');

        const imagePath = path.resolve(__dirname, '../src/assets/logo.png');
        await page.setInputFiles('#image-upload', imagePath);

        await page.locator('input.Origin').fill('Porto');
        await page.locator('input.Destination').fill('Lisbon');
        await page.locator('input.PackageType').fill('Household appliance');
        await page.locator('input.Weight').fill('10');

        await page.getByPlaceholder(/length/i).fill('2');
        await page.getByPlaceholder(/width/i).fill('3');
        await page.getByPlaceholder(/height/i).fill('4');

        // Datas
        const today = new Date();
        const formatDate = (d) => d.toISOString().split('T')[0];
        const pickupDate = formatDate(new Date(today.getTime() + 48*60*60*1000));
        const deliveryDate = formatDate(new Date(today.getTime() + 72*60*60*1000));
        const auctionStart = formatDate(today);
        const auctionEnd = formatDate(new Date(today.getTime() + 22*60*60*1000));

        const dateInputs = page.locator('form.transport-form input[type="date"]');
        await dateInputs.nth(0).fill(pickupDate);
        await dateInputs.nth(1).fill(deliveryDate);
        await dateInputs.nth(2).fill(auctionStart);
        await dateInputs.nth(3).fill(auctionEnd);

        await page.getByPlaceholder(/e\.g\.: 150\.00/i).fill('150');
        await page.getByRole('button', { name: /create request/i }).click();

        // Validação Final UI
        const toast = page.getByText(/successfully|sucesso/i);
        await expect(toast).toBeVisible();
        await expect(page).toHaveURL(/\/myTransports$/);

        console.log(`A verificar DB para o userId: ${userId}`);

        // Validação Final DB
        // CONFIRMAÇÃO FINAL: Tabela TransportRequests e coluna CompanyId
        const rows = await db.query(
            'SELECT * FROM TransportRequests WHERE CompanyId = ? AND Origin = ?',
            [userId, 'Porto']
        );
        expect(rows.length).toBe(1);
        console.log('Teste passou! Transporte gravado na DB.');
    });
});