/**
 * Teste de Sistema — Create Bid
 *
 * Objetivo:
 * - Validar, de ponta a ponta, que um driver consegue criar um bid para um transporte existente.
 *
 * Fluxo principal:
 * 1) Registar uma empresa via UI.
 * 2) Iniciar sessão como empresa e criar um transporte via UI.
 * 3) Registar um driver via UI.
 * 4) Iniciar sessão como driver, abrir os detalhes do transporte, submeter um bid e confirmar via UI + BD.
 *
 * Validações de dados (BD):
 * - Tabelas envolvidas: `Users`, `TransportRequests`, `Bids`.
 * - As colunas `Id`/`id` e `TransportRequestId` podem variar por ambiente; este teste aplica fallbacks.
 *
 * Pré‑requisitos:
 * - App servida em `http://localhost:3000`.
 * - Base de dados de teste acessível através do helper `./utilis/db`.
 *
 * Limpeza (teardown):
 * - Remove registos criados em `Bids`, `TransportRequests` e `Users` (driver e empresa).
 */

require("./coverage-helper");

const { test, expect } = require("@playwright/test");
const db = require("./utilis/db");
const path = require("path");

test.describe.configure({ timeout: 90000 });

async function pollRow(sql, params, { attempts = 40, delay = 1000 } = {}) {
  for (let i = 0; i < attempts; i++) {
    const rows = await db.query(sql, params);
    if (rows.length) return rows;
    await new Promise((r) => setTimeout(r, delay));
  }
  return [];
}

test.describe("System Test: Create Bid on existing transport", () => {
  const ts = Date.now();
  const companyData = {
    email: `company${ts}@example.com`,
    password: "Bidandgo@25",
    name: "Company BidTest",
    PhoneNumber: "222381674",
    nif: "111151383",
    companyName: "BidTest Lda",
    address: "Rua Empresa",
  };
  const driverData = {
    email: `driver${ts}@example.com`,
    password: "Bidandgo@25",
    name: "Driver BidTest",
    PhoneNumber: "999198977",
    nif: "222192173",
  };

  let companyId;
  let driverId;
  let transportId;
  let pickupDateStr;

  test.beforeAll(async ({ browser }) => {
    // Registo da empresa via UI
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto("http://localhost:3000/Register");
    await expect(page.getByText(/Choose the account type/i)).toBeVisible();
    await page.getByText("Company", { exact: true }).click();
    await page.getByLabel("Name", { exact: true }).fill(companyData.name);
    await page.getByLabel("Company Name").fill(companyData.companyName);
    await page.getByLabel("Address").fill(companyData.address);
    await page.getByLabel("Email").fill(companyData.email);
    await page.locator('input[type="password"]').fill(companyData.password);
    await page.getByLabel("Phone").fill(companyData.PhoneNumber);
    await page.getByLabel("NIF").fill(companyData.nif);
    await page.getByRole("button", { name: /Register/i }).click();

    // Poll até a empresa existir (evita timeout fixo)
    const companyRows = await pollRow(
      "SELECT * FROM Users WHERE Email = ?",
      [companyData.email]
    );
    if (!companyRows.length)
      throw new Error("Empresa não encontrada na BD após polling.");
    companyId = companyRows[0].Id || companyRows[0].id;

    // Login da empresa e criação do transporte via UI
    await page.goto("http://localhost:3000/Login");
    await page.getByLabel(/email/i).fill(companyData.email);
    await page.locator('input[type="password"]').fill(companyData.password);
    await page.getByRole("button", { name: /sign in/i }).click();
    await expect(page).toHaveURL(/\/$/);
    await page.goto("http://localhost:3000/createRequest");
    await page.locator("input.Origin").fill("Porto");
    await page.locator("input.Destination").fill("Lisbon");
    await page.locator("input.PackageType").fill("Box");
    await page.locator("input.Weight").fill("5");
    await page.getByPlaceholder(/length/i).fill("1");
    await page.getByPlaceholder(/width/i).fill("1");
    await page.getByPlaceholder(/height/i).fill("1");
    const imagePath = path.resolve(__dirname, "../src/assets/logo.png");
    await page.setInputFiles("#image-upload", imagePath);
    const today = new Date();
    const fd = (d) => d.toISOString().split("T")[0];
    const auctionStart = fd(today);
    const auctionEnd = fd(new Date(today.getTime() + 2 * 86400000));
    const pickupDate = fd(new Date(today.getTime() + 5 * 86400000));
    const deliveryDate = fd(new Date(today.getTime() + 7 * 86400000));
    pickupDateStr = pickupDate;
    const dateInputs = page.locator('form.transport-form input[type="date"]');
    await dateInputs.nth(0).fill(pickupDate);
    await dateInputs.nth(1).fill(deliveryDate);
    await dateInputs.nth(2).fill(auctionStart);
    await dateInputs.nth(3).fill(auctionEnd);
    await page.getByPlaceholder(/e\.g\.: 150\.00/i).fill("200");
    await page.getByRole("button", { name: /create request/i }).click();
    await expect(page).toHaveURL(/\/myTransports$/);

    // Obter transportId na BD (polling para garantir inserção)
    const trRows = await pollRow(
      "SELECT * FROM TransportRequests WHERE CompanyId = ? AND Origin = ?",
      [companyId, "Porto"],
      { attempts: 40, delay: 1000 }
    );
    if (!trRows.length)
      throw new Error("Transport request não encontrada na BD após polling.");
    console.log("Chaves TransportRequests:", Object.keys(trRows[0]));
    transportId =
      trRows[0].Id ||
      trRows[0].id ||
      trRows[0].TransportRequestId ||
      trRows[0].transportRequestId;

    // Registo do driver via UI
    await page.goto("http://localhost:3000/Register");
    await expect(page.getByText(/Choose the account type/i)).toBeVisible();
    await page.getByText("Driver", { exact: true }).click();
    await page.getByLabel("Name", { exact: true }).fill(driverData.name);
    const driverImagePath = path.resolve(__dirname, "../src/assets/logo.png");
    const fileInputs = page.locator('input[type="file"]');
    await fileInputs.nth(0).setInputFiles(driverImagePath);
    await fileInputs.nth(1).setInputFiles(driverImagePath);
    await page.getByLabel("Email").fill(driverData.email);
    await page.locator('input[type="password"]').fill(driverData.password);
    await page.getByLabel("Phone").fill(driverData.PhoneNumber);
    await page.getByLabel("Tax ID").fill(driverData.nif);
    await page.getByRole("button", { name: /Register/i }).click();
    const dRows = await pollRow(
      "SELECT * FROM Users WHERE Email = ?",
      [driverData.email],
      { attempts: 40, delay: 1000 }
    );
    if (!dRows.length)
      throw new Error("Driver não encontrado na BD após polling.");
    driverId = dRows[0].Id || dRows[0].id;

    await page.close();
    await context.close();
  });

  test.afterAll(async () => {
    try {
      if (transportId) {
        await db.query("DELETE FROM Bids WHERE TransportRequestId = ?", [
          transportId,
        ]);
        await db.query("DELETE FROM TransportRequests WHERE CompanyId = ?", [
          companyId,
        ]);
      }
      if (driverId)
        await db.query("DELETE FROM Users WHERE Id = ?", [driverId]);
      if (companyId)
        await db.query("DELETE FROM Users WHERE Id = ?", [companyId]);
    } catch (e) {
      console.error("Erro no teardown create-bid:", e.message);
    }
    await db.close();
  });

  test("Driver can place a bid and see confirmation (UI + DB)", async ({
    page,
  }) => {
    if (!transportId || !driverId)
      throw new Error(
        "Pré-condições falharam: transportId ou driverId ausente."
      );

    // Login como driver
    await page.goto("http://localhost:3000/Login");
    await page.getByLabel(/email/i).fill(driverData.email);
    await page.locator('input[type="password"]').fill(driverData.password);
    await page.getByRole("button", { name: /sign in/i }).click();
    await expect(page).toHaveURL(/\/$/);

    // Aceder aos detalhes do transporte
    await page.goto(`http://localhost:3000/transportRequest/${transportId}`);
    await expect(page.getByText(/Porto/i)).toBeVisible();
    await expect(page.getByText(/Lisbon/i)).toBeVisible();

    // Abrir modal de Bid
    const newBidBtn = page
      .locator(
        'button:has-text("New Bid"), button:has-text("Fazer proposta"), button:has-text("Add Bid"), button:has-text("Make a bid"), button:has-text("Fazer Oferta")'
      )
      .first();
    await expect(newBidBtn).toBeVisible();
    await newBidBtn.click();

    // Preencher formulário de Bid
    await page.fill('input[type="number"]', "180");
    const pad = (n) => String(n).padStart(2, "0");
    const pickupDateObj = new Date(pickupDateStr + "T00:00:00");
    const deadline = new Date(pickupDateObj.getTime() + 2 * 86400000);
    const iso = `${deadline.getFullYear()}-${pad(
      deadline.getMonth() + 1
    )}-${pad(deadline.getDate())}`;
    await page.fill('input[type="date"]', iso);

    const submitBtn = page
      .locator(
        'button:has-text("Submit Bid"), button:has-text("Submit"), button:has-text("Enviar"), button:has-text("Salvar proposta"), button:has-text("Enviar proposta")'
      )
      .first();
    await expect(submitBtn).toBeVisible();
    await submitBtn.click();

    // Toast de sucesso
    const toast = page.locator(".toast");
    await expect(toast).toContainText(/success|sucesso/i, { timeout: 10000 });

    // Verificar BD: Bid criada
    const bidRows = await db.query(
      "SELECT * FROM Bids WHERE TransportRequestId = ? AND DriverId = ?",
      [transportId, driverId]
    );
    expect(bidRows.length).toBeGreaterThan(0);
  });
});
