const { test, expect } = require('@playwright/test');
const db = require('./utilis/db');
const path = require('path');

// Estes testes seguem a mesma filosofia de sistema de create-transports.spec.js:
//  - Criam utilizadores e dados reais na BD via UI
//  - Criam um transport request via UI
//  - Criam uma bid via UI
//  - Fazem login "a sério" via UI
//  - Navegam até à página /history e validam a tabela renderizada

test.describe('System Test: History Page (Driver & Company)', () => {
  const timestamp = Date.now();

  const driverData = {
    email: `driver${timestamp}@gmail.com`,
    password: 'Bidandgo@25',
    name: 'Driver E2E Tester',
    phoneNumber: '911111111',
    nif: '222222222',
  };

  const companyData = {
    email: `company${timestamp}@gmail.com`,
    password: 'Bidandgo@25',
    name: 'Company E2E Tester',
    phoneNumber: '922222222',
    nif: '333333333',
    companyName: 'History E2E Lda',
    address: 'Rua History 1',
  };

  let driverId;
  let companyId;
  let transportRequestId;
  let bidId;

  // --- SETUP: criar driver + company via UI e gerar um histórico simples via UI ---
  test.beforeAll(async ({ browser }) => {
    console.log('--- SETUP HISTORY: criar driver e company + transport + bid via UI ---');

    const context = await browser.newContext();
    const page = await context.newPage();

    // 1) Criar COMPANY via UI (similar ao create-transports.spec.js)
    try {
      await page.goto('http://localhost:3000/Register');
      await expect(page.getByText(/Choose the account type/i)).toBeVisible();
      await page.getByText('Company', { exact: true }).click();

      await page.getByLabel('Name', { exact: true }).fill(companyData.name);
      await page.getByLabel('Company Name').fill(companyData.companyName);
      await page.getByLabel('Address').fill(companyData.address);
      await page.getByLabel('Email').fill(companyData.email);
      await page.locator('input[type="password"]').fill(companyData.password);
      await page.getByLabel('Phone').fill(companyData.phoneNumber);
      await page.getByLabel('NIF').fill(companyData.nif);

      await page.getByRole('button', { name: /Register/i }).click();

      await page.waitForTimeout(3000);
      console.log('Company registada via UI.');
    } catch (e) {
      console.error('Erro ao registar company para history:', e);
      throw e;
    }

    // 2) Buscar companyId na BD
    const companyRows = await db.query('SELECT * FROM Users WHERE Email = ?', [companyData.email]);
    if (!companyRows.length) {
      throw new Error('Erro: Company não encontrada na BD após registo.');
    }
    companyId = companyRows[0].Id || companyRows[0].id;
    console.log('CompanyId para history:', companyId);

    // 3) Criar DRIVER via UI
    try {
      await page.goto('http://localhost:3000/Register');
      await expect(page.getByText(/Choose the account type/i)).toBeVisible();
      await page.getByText('Driver', { exact: true }).click();

      await page.getByLabel('Name', { exact: true }).fill(driverData.name);
      await page.getByLabel('Email').fill(driverData.email);
      await page.locator('input[type="password"]').fill(driverData.password);
      await page.getByLabel('Phone').fill(driverData.phoneNumber);
      // No formulário está "Tax ID" para NIF do driver
      await page.getByLabel('Tax ID').fill(driverData.nif);

      const imagePath = path.resolve(__dirname, '../src/assets/logo.png');

      // Inputs de upload obrigatórios (Driver License + Insurance)
      const licenseInput = page.locator('input[type="file"]').nth(0);
      const insuranceInput = page.locator('input[type="file"]').nth(1);
      await licenseInput.setInputFiles(imagePath);
      await insuranceInput.setInputFiles(imagePath);

      await page.getByRole('button', { name: /Register/i }).click();
      await page.waitForTimeout(3000);
      console.log('Driver registado via UI.');
    } catch (e) {
      console.error('Erro ao registar driver para history:', e);
      throw e;
    }

    // 4) Buscar driverId na BD
    const driverRows = await db.query('SELECT * FROM Users WHERE Email = ?', [driverData.email]);
    if (!driverRows.length) {
      throw new Error('Erro: Driver não encontrado na BD após registo.');
    }
    driverId = driverRows[0].Id || driverRows[0].id;
    console.log('DriverId para history:', driverId);

    // 5) Login como company e criar um TransportRequest via UI
    console.log('A criar TransportRequest via UI para company...');
    await page.goto('http://localhost:3000/Login');
    await page.getByLabel(/email/i).fill(companyData.email);
    await page.locator('input[type="password"]').fill(companyData.password);
    await page.getByRole('button', { name: /sign in/i }).click();

    await expect(page).toHaveURL(/\/$/, { timeout: 10000 });

    await page.goto('http://localhost:3000/createRequest');

    const trImagePath = path.resolve(__dirname, '../src/assets/logo.png');
    await page.setInputFiles('#image-upload', trImagePath);

    await page.locator('input.Origin').fill('Porto');
    await page.locator('input.Destination').fill('Lisbon');
    await page.locator('input.PackageType').fill('History Pallet');
    await page.locator('input.Weight').fill('10');

    await page.getByPlaceholder(/length/i).fill('2');
    await page.getByPlaceholder(/width/i).fill('3');
    await page.getByPlaceholder(/height/i).fill('4');

    const today = new Date();
    const formatDate = (d) => d.toISOString().split('T')[0];
    const pickupDate = formatDate(new Date(today.getTime() + 48 * 60 * 60 * 1000));
    const deliveryDate = formatDate(new Date(today.getTime() + 144 * 60 * 60 * 1000));
    const auctionStart = formatDate(today);
    const auctionEnd = formatDate(new Date(today.getTime() + 24 * 60 * 60 * 1000));

    const dateInputs = page.locator('form.transport-form input[type="date"]');
    await dateInputs.nth(0).fill(pickupDate);
    await dateInputs.nth(1).fill(deliveryDate);
    await dateInputs.nth(2).fill(auctionStart);
    await dateInputs.nth(3).fill(auctionEnd);

    await page.getByPlaceholder(/e\.g\.: 150\.00/i).fill('150');
    await page.getByRole('button', { name: /create request/i }).click();

    const toast = page.getByText(/successfully|sucesso/i);
    await expect(toast).toBeVisible();
    await expect(page).toHaveURL(/\/myTransports$/);
    console.log('TransportRequest criado via UI.');

    // Recuperar o transportRequestId da BD
    const trRows = await db.query(
      'SELECT * FROM TransportRequests WHERE CompanyId = ? AND Origin = ? ORDER BY TransportRequestId DESC LIMIT 1',
      [companyId, 'Porto']
    );
    if (!trRows.length) {
      throw new Error('Erro: TransportRequest não foi encontrado na BD após criação via UI.');
    }
    transportRequestId = trRows[0].TransportRequestId || trRows[0].id;
    console.log('TransportRequestId para history (via UI):', transportRequestId);

    // 6) Logout da company (se houver botão de logout) e criar uma Bid como driver via UI
    await page.goto('http://localhost:3000/Login');

    console.log('A criar Bid via UI para histórico do driver...');
    await page.getByLabel(/email/i).fill(driverData.email);
    await page.locator('input[type="password"]').fill(driverData.password);
    await page.getByRole('button', { name: /sign in/i }).click();

    await expect(page).toHaveURL(/\/$/, { timeout: 10000 });

    // Ir directamente para a página de detalhes do transporte, como em create-bid.spec.js
    await page.goto(`http://localhost:3000/transportRequest/${transportRequestId}`);
    await expect(page.getByText(/Porto/i)).toBeVisible();
    await expect(page.getByText(/Lisbon/i)).toBeVisible();

    // Abrir modal de Bid usando o mesmo padrão de seletores do create-bid.spec.js
    const newBidBtn = page.locator(
      'button:has-text("New Bid"), ' +
      'button:has-text("Fazer proposta"), ' +
      'button:has-text("Add Bid"), ' +
      'button:has-text("Make a bid"), ' +
      'button:has-text("Fazer Oferta")'
    ).first();
    await expect(newBidBtn).toBeVisible();
    await newBidBtn.click();

    // Preencher formulário de Bid: input number para o valor
    await page.fill('input[type="number"]', '100');

    // Preencher data de entrega da bid (garantir que é depois do pickupDate usado acima)
    const pad = (n) => String(n).padStart(2, '0');
    const pickupDateObj = new Date(pickupDate + 'T00:00:00');
    const deadline = new Date(pickupDateObj.getTime() + 2 * 86400000); // +2 dias
    const iso = `${deadline.getFullYear()}-${pad(deadline.getMonth() + 1)}-${pad(deadline.getDate())}`;
    await page.fill('input[type="date"]', iso);

    // Submeter a bid, usando o mesmo padrão de botões do create-bid.spec.js
    const submitBtn = page.locator(
      'button:has-text("Submit Bid"), ' +
      'button:has-text("Submit"), ' +
      'button:has-text("Enviar"), ' +
      'button:has-text("Salvar proposta"), ' +
      'button:has-text("Enviar proposta")'
    ).first();
    await expect(submitBtn).toBeVisible();
    await submitBtn.click();

    // Toast de sucesso
    const bidToast = page.locator('.toast');
    await expect(bidToast).toContainText(/success|sucesso/i, { timeout: 10000 });

    // Confirmar na BD que existe uma Bid para este driver e request
    const bidRows = await db.query(
      'SELECT * FROM Bids WHERE DriverId = ? AND TransportRequestId = ? ORDER BY BidId DESC LIMIT 1',
      [driverId, transportRequestId]
    );
    if (!bidRows.length) {
      throw new Error('Erro: Bid não encontrada na BD após criação via UI.');
    }
    bidId = bidRows[0].BidId || bidRows[0].id;
    console.log('BidId para history (via UI):', bidId);

    await page.close();
    await context.close();
  });

  // --- TEARDOWN: limpar dados criados ---
  test.afterAll(async () => {
    console.log('--- TEARDOWN HISTORY ---');
    try {
      if (bidId) {
        await db.query('DELETE FROM Bids WHERE BidId = ?', [bidId]);
      }
      if (transportRequestId) {
        await db.query('DELETE FROM TransportRequests WHERE TransportRequestId = ?', [transportRequestId]);
      }
      if (driverId) {
        await db.query('DELETE FROM Users WHERE Id = ?', [driverId]);
      }
      if (companyId) {
        await db.query('DELETE FROM Users WHERE Id = ?', [companyId]);
      }
    } catch (e) {
      console.error('Erro ao limpar dados de history:', e.message);
    }
    await db.close();
  });

  // --- TESTE 1: Driver vê o seu histórico de bids ---
  test('Driver can login and see bidding history', async ({ page }) => {
    console.log('--- TESTE: Driver vê histórico ---');

    // Login como driver via UI
    await page.goto('http://localhost:3000/Login');
    await page.getByLabel(/email/i).fill(driverData.email);
    await page.locator('input[type="password"]').fill(driverData.password);
    await page.getByRole('button', { name: /sign in/i }).click();

    // Esperar que redirecione para a home ou dashboard
    await page.waitForTimeout(3000);

    // Ir para a página de histórico via URL direta
    await page.goto('http://localhost:3000/history');

    // Validações básicas de UI
    await expect(page.getByText(/Bidding History/i)).toBeVisible();

    const table = page.locator('.history-table');
    await expect(table).toBeVisible();

    // As colunas para driver (ver HistoryPage.js / normalizeHistoryDriver)
    await expect(table).toContainText('History E2E Lda'); // companyName
    await expect(table).toContainText('History Pallet'); // package
    await expect(table).toContainText('Lisbon'); // destination
    await expect(table).toContainText('Pendent'); // status
  });

  // --- TESTE 2: Company vê histórico de pedidos de transporte ---
  test('Company can login and see transport requests history', async ({ page }) => {
    console.log('--- TESTE: Company vê histórico ---');

    // Login como company via UI
    await page.goto('http://localhost:3000/Login');
    await page.getByLabel(/email/i).fill(companyData.email);
    await page.locator('input[type="password"]').fill(companyData.password);
    await page.getByRole('button', { name: /sign in/i }).click();

    await page.waitForTimeout(3000);

    await page.goto('http://localhost:3000/history');

    await expect(page.getByText(/Transport Requests History/i)).toBeVisible();

    const table = page.locator('.history-table');
    await expect(table).toBeVisible();

    // Para company, as colunas incluem requestId, package, driverName, destination, price, status
    await expect(table).toContainText('History Pallet');
    await expect(table).toContainText('Lisbon');
    await expect(table).toContainText('Active');
  });
});
