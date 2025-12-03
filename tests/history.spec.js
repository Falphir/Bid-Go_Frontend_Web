/**
 * Teste de Sistema — History Page (Driver & Company)
 *
 * Objetivo:
 * - Validar, end-to-end, que o driver consegue ver o seu histórico de bids
 *   e que a empresa consegue ver o histórico de pedidos de transporte.
 *
 * Fluxo principal:
 * 1) Registar empresa via UI e obter `companyId` na BD.
 * 2) Registar driver via UI e obter `driverId` na BD.
 * 3) Iniciar sessão como empresa e criar um `TransportRequest` via UI; obter `transportRequestId` na BD.
 * 4) Iniciar sessão como driver, criar uma `Bid` via UI; obter `bidId` na BD.
 * 5) Validar página `/history` para o driver (bidding history) e para a empresa (transport requests history).
 *
 * Validações de dados (BD):
 * - Tabelas: `Users`, `TransportRequests`, `Bids`.
 * - Colunas com possíveis variações: `Id`/`id`, `TransportRequestId`/`id`, `BidId`/`id`.
 *
 * Pré‑requisitos:
 * - App disponível em `http://localhost:3000`.
 * - Acesso à BD de teste via `./utilis/db`.
 *
 * Limpeza (teardown):
 * - Remove `Bids`, `TransportRequests` criados e os registos `Users` (driver e empresa).
 */

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

test.describe("System Test: History Page (Driver & Company)", () => {
  const timestamp = Date.now();

  const driverData = {
    email: `driver${timestamp}@gmail.com`,
    password: "Bidandgo@25",
    name: "Driver E2E Tester",
    phoneNumber: "911111111",
    nif: "222222222",
  };

  const companyData = {
    email: `company${timestamp}@gmail.com`,
    password: "Bidandgo@25",
    name: "Company E2E Tester",
    phoneNumber: "922222222",
    nif: "333333333",
    companyName: "History E2E Lda",
    address: "Rua History 1",
  };

  let driverId;
  let companyId;
  let transportRequestId;
  let bidId;

  test.beforeAll(async ({ browser }) => {
    console.log(
      "--- SETUP HISTORY: criar driver e company + transport + bid via UI ---"
    );

    const context = await browser.newContext();
    const page = await context.newPage();

    try {
      await page.goto("http://localhost:3000/Register");
      await expect(page.getByText(/Choose the account type/i)).toBeVisible();
      await page.getByText("Company", { exact: true }).click();

      await page.getByLabel("Name", { exact: true }).fill(companyData.name);
      await page.getByLabel("Company Name").fill(companyData.companyName);
      await page.getByLabel("Address").fill(companyData.address);
      await page.getByLabel("Email").fill(companyData.email);
      await page.locator('input[type="password"]').fill(companyData.password);
      await page.getByLabel("Phone").fill(companyData.phoneNumber);
      await page.getByLabel("NIF").fill(companyData.nif);

      await page.getByRole("button", { name: /Register/i }).click();
      console.log("Company registo submetido.");
    } catch (e) {
      console.error("Erro ao registar company para history:", e);
      throw e;
    }

    const companyRows = await pollRow(
      "SELECT * FROM Users WHERE Email = ?",
      [companyData.email]
    );
    if (!companyRows.length) {
      throw new Error("Erro: Company não encontrada na BD após polling.");
    }
    companyId = companyRows[0].Id || companyRows[0].id;
    console.log("CompanyId para history:", companyId);

    try {
      await page.goto("http://localhost:3000/Register");
      await expect(page.getByText(/Choose the account type/i)).toBeVisible();
      await page.getByText("Driver", { exact: true }).click();

      await page.getByLabel("Name", { exact: true }).fill(driverData.name);
      await page.getByLabel("Email").fill(driverData.email);
      await page.locator('input[type="password"]').fill(driverData.password);
      await page.getByLabel("Phone").fill(driverData.phoneNumber);
      await page.getByLabel("Tax ID").fill(driverData.nif);

      const imagePath = path.resolve(__dirname, "../src/assets/logo.png");
      const licenseInput = page.locator('input[type="file"]').nth(0);
      const insuranceInput = page.locator('input[type="file"]').nth(1);
      await licenseInput.setInputFiles(imagePath);
      await insuranceInput.setInputFiles(imagePath);

      await page.getByRole("button", { name: /Register/i }).click();
      console.log("Driver registo submetido.");
    } catch (e) {
      console.error("Erro ao registar driver para history:", e);
      throw e;
    }

    const driverRows = await pollRow(
      "SELECT * FROM Users WHERE Email = ?",
      [driverData.email]
    );
    if (!driverRows.length) {
      throw new Error("Erro: Driver não encontrado na BD após polling.");
    }
    driverId = driverRows[0].Id || driverRows[0].id;
    console.log("DriverId para history:", driverId);

    console.log("A criar TransportRequest via UI para company...");
    await page.goto("http://localhost:3000/Login");
    await page.getByLabel(/email/i).fill(companyData.email);
    await page.locator('input[type="password"]').fill(companyData.password);
    await page.getByRole("button", { name: /sign in/i }).click();

    await expect(page).toHaveURL(/\/$/, { timeout: 10000 });

    await page.goto("http://localhost:3000/createRequest");

    const trImagePath = path.resolve(__dirname, "../src/assets/logo.png");
    await page.setInputFiles("#image-upload", trImagePath);

    await page.locator("input.Origin").fill("Porto");
    await page.locator("input.Destination").fill("Lisbon");
    await page.locator("input.PackageType").fill("History Pallet");
    await page.locator("input.Weight").fill("10");

    await page.getByPlaceholder(/length/i).fill("2");
    await page.getByPlaceholder(/width/i).fill("3");
    await page.getByPlaceholder(/height/i).fill("4");

    const today = new Date();
    const formatDate = (d) => d.toISOString().split("T")[0];
    const pickupDate = formatDate(
      new Date(today.getTime() + 48 * 60 * 60 * 1000)
    );
    const deliveryDate = formatDate(
      new Date(today.getTime() + 144 * 60 * 60 * 1000)
    );
    const auctionStart = formatDate(today);
    const auctionEnd = formatDate(
      new Date(today.getTime() + 24 * 60 * 60 * 1000)
    );

    const dateInputs = page.locator('form.transport-form input[type="date"]');
    await dateInputs.nth(0).fill(pickupDate);
    await dateInputs.nth(1).fill(deliveryDate);
    await dateInputs.nth(2).fill(auctionStart);
    await dateInputs.nth(3).fill(auctionEnd);

    await page.getByPlaceholder(/e\.g\.: 150\.00/i).fill("150");
    await page.getByRole("button", { name: /create request/i }).click();

    const toast = page.getByText(/successfully|sucesso/i);
    await expect(toast).toBeVisible();
    await expect(page).toHaveURL(/\/myTransports$/);
    console.log("TransportRequest criado via UI.");

    const trRows = await pollRow(
      "SELECT * FROM TransportRequests WHERE CompanyId = ? AND Origin = ? ORDER BY TransportRequestId DESC LIMIT 1",
      [companyId, "Porto"],
      { attempts: 40, delay: 1000 }
    );
    if (!trRows.length) {
      throw new Error(
        "Erro: TransportRequest não foi encontrado na BD após polling."
      );
    }
    transportRequestId = trRows[0].TransportRequestId || trRows[0].id;
    console.log(
      "TransportRequestId para history (via UI):",
      transportRequestId
    );

    await page.goto("http://localhost:3000/Login");

    console.log("A criar Bid via UI para histórico do driver...");
    await page.getByLabel(/email/i).fill(driverData.email);
    await page.locator('input[type="password"]').fill(driverData.password);
    await page.getByRole("button", { name: /sign in/i }).click();

    await expect(page).toHaveURL(/\/$/, { timeout: 10000 });

    await page.goto(
      `http://localhost:3000/transportRequest/${transportRequestId}`
    );
    await expect(page.getByText(/Porto/i)).toBeVisible();
    await expect(page.getByText(/Lisbon/i)).toBeVisible();

    const newBidBtn = page
      .locator(
        'button:has-text("New Bid"), ' +
          'button:has-text("Fazer proposta"), ' +
          'button:has-text("Add Bid"), ' +
          'button:has-text("Make a bid"), ' +
          'button:has-text("Fazer Oferta")'
      )
      .first();
    await expect(newBidBtn).toBeVisible();
    await newBidBtn.click();

    await page.fill('input[type="number"]', "100");

    const pad = (n) => String(n).padStart(2, "0");
    const pickupDateObj = new Date(pickupDate + "T00:00:00");
    const deadline = new Date(pickupDateObj.getTime() + 2 * 86400000);
    const iso = `${deadline.getFullYear()}-${pad(
      deadline.getMonth() + 1
    )}-${pad(deadline.getDate())}`;
    await page.fill('input[type="date"]', iso);

    const submitBtn = page
      .locator(
        'button:has-text("Submit Bid"), ' +
          'button:has-text("Submit"), ' +
          'button:has-text("Enviar"), ' +
          'button:has-text("Salvar proposta"), ' +
          'button:has-text("Enviar proposta")'
      )
      .first();
    await expect(submitBtn).toBeVisible();
    await submitBtn.click();

    const bidToast = page.locator(".toast");
    await expect(bidToast).toContainText(/success|sucesso/i, {
      timeout: 10000,
    });

    const bidRows = await pollRow(
      "SELECT * FROM Bids WHERE DriverId = ? AND TransportRequestId = ? ORDER BY BidId DESC LIMIT 1",
      [driverId, transportRequestId]
    );
    if (!bidRows.length) {
      throw new Error("Erro: Bid não encontrada na BD após polling.");
    }
    bidId = bidRows[0].BidId || bidRows[0].id;
    console.log("BidId para history (via UI):", bidId);

    await page.close();
    await context.close();
  });

  test.afterAll(async () => {
    console.log("--- TEARDOWN HISTORY ---");
    try {
      if (bidId) {
        await db.query("DELETE FROM Bids WHERE BidId = ?", [bidId]);
      }
      if (transportRequestId) {
        await db.query(
          "DELETE FROM TransportRequests WHERE TransportRequestId = ?",
          [transportRequestId]
        );
      }
      if (driverId) {
        await db.query("DELETE FROM Users WHERE Id = ?", [driverId]);
      }
      if (companyId) {
        await db.query("DELETE FROM Users WHERE Id = ?", [companyId]);
      }
    } catch (e) {
      console.error("Erro ao limpar dados de history:", e.message);
    }

  });

  test("Driver can login and see bidding history", async ({ page }) => {
    console.log("--- TESTE: Driver vê histórico ---");

    await page.goto("http://localhost:3000/Login");
    await page.getByLabel(/email/i).fill(driverData.email);
    await page.locator('input[type="password"]').fill(driverData.password);
    await page.getByRole("button", { name: /sign in/i }).click();

    await expect(page).toHaveURL(/\/$/, { timeout: 15000 });

    await page.goto("http://localhost:3000/history");

    await expect(page.getByText(/Bidding History/i)).toBeVisible();

    const table = page.locator(".history-table");
    await expect(table).toBeVisible();

    await expect(table).toContainText("History E2E Lda"); // companyName
    await expect(table).toContainText("History Pallet"); // package
    await expect(table).toContainText("Lisbon"); // destination
    await expect(table).toContainText(/Pendent|Pending/i); // status (variação)
  });

  test("Company can login and see transport requests history", async ({
    page,
  }) => {
    console.log("--- TESTE: Company vê histórico ---");

    await page.goto("http://localhost:3000/Login");
    await page.getByLabel(/email/i).fill(companyData.email);
    await page.locator('input[type="password"]').fill(companyData.password);
    await page.getByRole("button", { name: /sign in/i }).click();

    await expect(page).toHaveURL(/\/$/, { timeout: 15000 });

    await page.goto("http://localhost:3000/history");

    await expect(page.getByText(/Transport Requests History/i)).toBeVisible();

    const table = page.locator(".history-table");
    await expect(table).toBeVisible();

    await expect(table).toContainText("History Pallet");
    await expect(table).toContainText("Lisbon");
    await expect(table).toContainText("Active");
  });
});
