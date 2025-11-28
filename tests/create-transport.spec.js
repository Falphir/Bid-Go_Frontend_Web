const { test, expect } = require('../playwright-coverage');

const SAMPLE_PNG_BASE64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMBAQBNmR0AAAAASUVORK5CYII=';

function makeFakeJwt(payload) {
  const header = { alg: 'none', typ: 'JWT' };
  const b64 = (obj) => Buffer.from(JSON.stringify(obj)).toString('base64').replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');
  return `${b64(header)}.${b64(payload)}.`;
}

test.describe('Create Transport Request (company)', () => {
  test('company user can create a transport request', async ({ page }) => {
    const fakePayload = { userId: 555, userType: 'company', exp: Math.floor(Date.now() / 1000) + 3600 };
    const fakeToken = makeFakeJwt(fakePayload);

    await page.addInitScript({ content: `window.__PLAYWRIGHT_TEST__ = true; localStorage.setItem('token','${fakeToken}');` });

    await page.route('**/auth/me', (route) => {
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ claims: [
        { type: 'userId', value: String(fakePayload.userId) },
        { type: 'userType', value: 'company' }
      ] }) });
    });

    let lastRequestBody = null;
    await page.route('**/transports/createTransport', async (route, request) => {
      try {
        lastRequestBody = request.postData();
      } catch (e) {
        lastRequestBody = null;
      }
      await route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ id: 'created-1' }) });
    });

    await page.goto('http://localhost:3000/createRequest');

    await page.fill('input.Origin', 'Rua Teste 1');
    await page.fill('input.Destination', 'Lisboa');
    await page.fill('input.PackageType', 'Household appliance');
    await page.fill('input.Weight', '10');

    await page.fill('input[aria-label="Length (cm)"]', '10');
    await page.fill('input[aria-label="Width (cm)"]', '20');
    await page.fill('input[aria-label="Height (cm)"]', '30');

    const pad = (n) => String(n).padStart(2, '0');
    const today = new Date();
    const pickup = new Date(Date.now() + 24 * 3600 * 1000);
    const delivery = new Date(Date.now() + 3 * 24 * 3600 * 1000);
    const auctionStart = today;
    const auctionEnd = new Date(Date.now() + 24 * 3600 * 1000);

    const toIso = (d) => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;

    await page.fill('label:has-text("Pickup Date") + input', toIso(pickup));
    await page.fill('label:has-text("Delivery Date") + input', toIso(delivery));
    await page.fill('label:has-text("Auction Start") + input', toIso(auctionStart));
    await page.fill('label:has-text("Auction End") + input', toIso(auctionEnd));

    await page.fill('label:has-text("Maximum Price (€)") + input', '200.00');

    const buffer = Buffer.from(SAMPLE_PNG_BASE64, 'base64');
    await page.setInputFiles('#image-upload', { name: 'sample.png', mimeType: 'image/png', buffer });

    await page.click('button:has-text("Create Request")');

    const toast = page.locator('.toast');
    await expect(toast).toHaveText(/Request created successfully.|Rascunho criado com sucesso.|sucesso/i, { timeout: 10000 });

    expect(lastRequestBody).not.toBeNull();
  });
});
