// System-style test (sem mocks de rede) inspirado em create-transports.spec.js
// Regista uma empresa e cria um transporte via UI, regista um driver, faz login como driver e cria um bid.
// Valida também na BD (tabelas: Users, TransportRequests, Bids). Ajusta nomes de colunas conforme o teu schema real.

require('./coverage-helper');

const { test, expect } = require('@playwright/test');
const db = require('./utilis/db');
const path = require('path'); // necessário para resolver o caminho da imagem


test.describe('System Test: Create Bid on existing transport', () => {
    const ts = Date.now();
    const companyData = {
        email: `company${ts}@example.com`,
        password: 'Bidandgo@25',
        name: 'Company BidTest',
        PhoneNumber: '222381674',
        nif: '111151383',
        companyName: 'BidTest Lda',
        address: 'Rua Empresa'
    };
    const driverData = {
        email: `driver${ts}@example.com`,
        password: 'Bidandgo@25',
        name: 'Driver BidTest',
        PhoneNumber: '999198977',
        nif: '222192173' // usado no campo Tax ID (backend espera Nif)
    };

    let companyId;
    let driverId;
    let transportId;
    let pickupDateStr; // guardar pickup date do transporte para validar deadline do bid

    test.beforeAll(async ({ browser }) => {
        // 1. Registar empresa via UI
        const context = await browser.newContext();
        const page = await context.newPage();
        await page.goto('http://localhost:3000/Register');
        await expect(page.getByText(/Choose the account type/i)).toBeVisible();
        await page.getByText('Company', { exact: true }).click();
        await page.getByLabel('Name', { exact: true }).fill(companyData.name);
        await page.getByLabel('Company Name').fill(companyData.companyName);
        await page.getByLabel('Address').fill(companyData.address);
        await page.getByLabel('Email').fill(companyData.email);
        await page.locator('input[type="password"]').fill(companyData.password);
        await page.getByLabel('Phone').fill(companyData.PhoneNumber);
        await page.getByLabel('NIF').fill(companyData.nif);
        await page.getByRole('button', { name: /Register/i }).click();
        await page.waitForTimeout(8000);

        // Buscar companyId
        const companyRows = await db.query('SELECT * FROM Users WHERE Email = ?', [companyData.email]);
        if (!companyRows.length) throw new Error('Empresa não encontrada na BD.');
        companyId = companyRows[0].Id || companyRows[0].id;

        // 2. Login empresa e criar transporte via UI
        await page.goto('http://localhost:3000/Login');
        await page.getByLabel(/email/i).fill(companyData.email);
        await page.locator('input[type="password"]').fill(companyData.password);
        await page.getByRole('button', { name: /sign in/i }).click();
        await expect(page).toHaveURL(/\/$/);
        await page.goto('http://localhost:3000/createRequest');
        // Campos mínimos (ajusta seletores conforme necessários)
        await page.locator('input.Origin').fill('Porto');
        await page.locator('input.Destination').fill('Lisbon');
        await page.locator('input.PackageType').fill('Box');
        await page.locator('input.Weight').fill('5');
        await page.getByPlaceholder(/length/i).fill('1');
        await page.getByPlaceholder(/width/i).fill('1');
        await page.getByPlaceholder(/height/i).fill('1');
        const imagePath = path.resolve(__dirname, '../src/assets/logo.png');
        await page.setInputFiles('#image-upload', imagePath);
        const today = new Date();
        const fd = (d) => d.toISOString().split('T')[0];
        const auctionStart = fd(today);
        const auctionEnd = fd(new Date(today.getTime() + 2*86400000)); // +2 dias
        const pickupDate = fd(new Date(today.getTime() + 5*86400000)); // +5 dias após start
        const deliveryDate = fd(new Date(today.getTime() + 7*86400000)); // +7 dias
        pickupDateStr = pickupDate;
        const dateInputs = page.locator('form.transport-form input[type="date"]');
        await dateInputs.nth(0).fill(pickupDate);
        await dateInputs.nth(1).fill(deliveryDate);
        await dateInputs.nth(2).fill(auctionStart);
        await dateInputs.nth(3).fill(auctionEnd);
        await page.getByPlaceholder(/e\.g\.: 150\.00/i).fill('200');
        await page.getByRole('button', { name: /create request/i }).click();
        await expect(page).toHaveURL(/\/myTransports$/);

        // Obter transportId da BD (usa critérios iguais aos usados no UI)
        const trRows = await db.query('SELECT * FROM TransportRequests WHERE CompanyId = ? AND Origin = ?',[companyId,'Porto']);
        if (!trRows.length) throw new Error('Transport request não encontrada na BD.');
        // Log das chaves para diagnosticar schema real
        console.log('Chaves TransportRequests:', Object.keys(trRows[0]));
        transportId = trRows[0].Id || trRows[0].id || trRows[0].TransportRequestId || trRows[0].transportRequestId;

        // 3. Registar driver
        await page.goto('http://localhost:3000/Register');
        await expect(page.getByText(/Choose the account type/i)).toBeVisible();
        await page.getByText('Driver', { exact: true }).click();
        await page.getByLabel('Name', { exact: true }).fill(driverData.name);
        // Uploads obrigatórios (driver license + insurance)
        const driverImagePath = path.resolve(__dirname, '../src/assets/logo.png');
        const fileInputs = page.locator('input[type="file"]');
        await fileInputs.nth(0).setInputFiles(driverImagePath);
        await fileInputs.nth(1).setInputFiles(driverImagePath);
        await page.getByLabel('Email').fill(driverData.email);
        await page.locator('input[type="password"]').fill(driverData.password);
        await page.getByLabel('Phone').fill(driverData.PhoneNumber);
        // Label inclui espaço: 'Tax ID'
        await page.getByLabel('Tax ID').fill(driverData.nif);
        await page.getByRole('button', { name: /Register/i }).click();
        await page.waitForTimeout(6000);
        const dRows = await db.query('SELECT * FROM Users WHERE Email = ?', [driverData.email]);
        if (!dRows.length) throw new Error('Driver não encontrado na BD.');
        driverId = dRows[0].Id || dRows[0].id;

        await page.close();
        await context.close();
    });

    test.afterAll(async () => {
        // Limpeza: bids -> transport -> users (driver e empresa)
        try {
            if (transportId) {
                // Limpar bids (ajusta o nome da coluna conforme o schema real)
                await db.query('DELETE FROM Bids WHERE TransportRequestId = ?', [transportId]);
                // Remover transport(s) da empresa para garantir limpeza mesmo se Id difere
                await db.query('DELETE FROM TransportRequests WHERE CompanyId = ?', [companyId]);
            }
            if (driverId) await db.query('DELETE FROM Users WHERE Id = ?', [driverId]);
            if (companyId) await db.query('DELETE FROM Users WHERE Id = ?', [companyId]);
        } catch (e) {
            console.error('Erro no teardown create-bid:', e.message);
        }
        await db.close();
    });

    test('Driver can place a bid and see confirmation (UI + DB)', async ({ page }) => {
        if (!transportId || !driverId) throw new Error('Pré-condições falharam: transportId ou driverId ausente.');

        // Login driver
        await page.goto('http://localhost:3000/Login');
        await page.getByLabel(/email/i).fill(driverData.email);
        await page.locator('input[type="password"]').fill(driverData.password);
        await page.getByRole('button', { name: /sign in/i }).click();
        await expect(page).toHaveURL(/\/$/);

        // Ir para detalhes do transporte
        await page.goto(`http://localhost:3000/transportRequest/${transportId}`);
        await expect(page.getByText(/Porto/i)).toBeVisible();
        await expect(page.getByText(/Lisbon/i)).toBeVisible();

        // Abrir modal de Bid
        const newBidBtn = page.locator('button:has-text("New Bid"), button:has-text("Fazer proposta"), button:has-text("Add Bid"), button:has-text("Make a bid"), button:has-text("Fazer Oferta")').first();
        await expect(newBidBtn).toBeVisible();
        await newBidBtn.click();

        // Preencher formulário de Bid
        await page.fill('input[type="number"]', '180');
        const pad = (n) => String(n).padStart(2, '0');
        // Garantir deadline após pickup date
        const pickupDateObj = new Date(pickupDateStr + 'T00:00:00');
        const deadline = new Date(pickupDateObj.getTime() + 2 * 86400000); // +2 dias após pickup
        const iso = `${deadline.getFullYear()}-${pad(deadline.getMonth()+1)}-${pad(deadline.getDate())}`;
        await page.fill('input[type="date"]', iso);

        const submitBtn = page.locator('button:has-text("Submit Bid"), button:has-text("Submit"), button:has-text("Enviar"), button:has-text("Salvar proposta"), button:has-text("Enviar proposta")').first();
        await expect(submitBtn).toBeVisible();
        await submitBtn.click();

        // Toast de sucesso
        const toast = page.locator('.toast');
        await expect(toast).toContainText(/success|sucesso/i, { timeout: 10000 });

        // Verificar BD: Bid criada
        const bidRows = await db.query('SELECT * FROM Bids WHERE TransportRequestId = ? AND DriverId = ?', [transportId, driverId]);
        expect(bidRows.length).toBeGreaterThan(0);
    });
});
