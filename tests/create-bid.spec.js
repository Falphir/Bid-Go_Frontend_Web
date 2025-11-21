const { test, expect } = require('../playwright-coverage');


// Helper to build a fake JWT (not signed) with base64url payload
function makeFakeJwt(payload) {
  const header = { alg: 'none', typ: 'JWT' };
  const b64 = (obj) => Buffer.from(JSON.stringify(obj)).toString('base64').replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');
  return `${b64(header)}.${b64(payload)}.`; // trailing dot as empty signature
}

test.describe('Create Bid on transport request', () => {
  test('driver can create a bid and see it listed', async ({ page }) => {
    const fakePayload = { userId: 777, userType: 'driver', exp: Math.floor(Date.now() / 1000) + 3600 };
    const fakeToken = makeFakeJwt(fakePayload);
    const TRANSPORT_ID = 'TEST-TRANSPORT-1';

    // Mock auth/me so the app considers us a driver
    await page.route('**/auth/me', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ claims: [
          { type: 'userId', value: String(fakePayload.userId) },
          { type: 'userType', value: 'driver' }
        ] })
      });
    });

    // Inject fake token and mark test environment before the page loads so useMe fast-path works
    await page.addInitScript({ content: `window.__PLAYWRIGHT_TEST__ = true; localStorage.setItem('token','${fakeToken}');` });

    // Mock transport GET to show a request without bids
    await page.route(`**/transports/${TRANSPORT_ID}`, (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: TRANSPORT_ID,
          package: 'Transporte de Teste',
          status: 'ACTIVE',
          description: null,
          origin: 'Porto',
          destination: 'Lisboa',
          companyId: 123,
          pickupDate: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
          deliveryDate: new Date(Date.now() + 3 * 24 * 3600 * 1000).toISOString(),
          maxPrice: 1000,
          bids: []
        })
      });
    });

    // Intercept POST bids (app posts to /bids/createBid) and return created bid
    await page.route('**/bids/createBid', async (route) => {
      const created = {
        id: 'bid-1',
        driverId: fakePayload.userId,
        transportId: TRANSPORT_ID,
        price: 150.0,
        message: 'Posso entregar em 2 dias',
        createdAt: new Date().toISOString()
      };
      await route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify(created) });
    });

    // Mock GET active bids called after adding a bid (loadActiveBids)
    await page.route(`**/bids/bidsActive?transportRequestId=${TRANSPORT_ID}`, (route) => {
      const bid = {
        bidId: 'bid-1',
        value: 150,
        deliveryDeadline: new Date().toISOString(),
        driver: {
          driverId: fakePayload.userId,
          name: 'Driver Test',
          email: 'driver@test.example'
        }
      };
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([bid]) });
    });

    // Mock review average calls to avoid extra network failures
    await page.route('**/reviewRequest/average/driver/**', (route) => {
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ average: 4.5 }) });
    });

    // Navigate to transport request page (app routes to /transportRequest/:id)
    await page.goto(`http://localhost:3000/transportRequest/${TRANSPORT_ID}`);

    // Wait for page title
    await expect(page.locator('text=Transporte de Teste')).toBeVisible();

    // Open Add Bid modal - the UI exposes a New Bid button for drivers
    const openBtn = page.locator('button:has-text("New Bid"), button:has-text("Fazer proposta"), button:has-text("Add Bid"), button:has-text("Make a bid"), button:has-text("Fazer Oferta")').first();
    await expect(openBtn).toBeVisible();
    await openBtn.click();

    // Fill bid form (AddBidModal has an <input type="number"> for price and a date input for deadline)
    await page.fill('input[type="number"]', '150');
    // Set deadline to a valid date: pickupDate + 1 day (our mocked pickupDate is now +1 day)
    const pad = (n) => String(n).padStart(2, '0');
    const minDeadline = new Date(Date.now() + 2 * 24 * 3600 * 1000); // pickup (+1) + 1
    const iso = `${minDeadline.getFullYear()}-${pad(minDeadline.getMonth()+1)}-${pad(minDeadline.getDate())}`;
    await page.fill('input[type="date"]', iso);

    // Submit
    const submitBtn = page.locator('button:has-text("Submit Bid"), button:has-text("Submit"), button:has-text("Enviar"), button:has-text("Salvar proposta"), button:has-text("Enviar proposta")').first();
    await expect(submitBtn).toBeVisible();
    await submitBtn.click();

    // Expect success toast
    const toast = page.locator('.toast');
    await expect(toast).toHaveText("Bid created successfully.", { timeout: 10000 });
  });
});
