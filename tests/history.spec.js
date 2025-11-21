const { test, expect } = require('../playwright-coverage');

function makeFakeJwt(payload) {
  const header = { alg: 'none', typ: 'JWT' };
  const b64 = (obj) => Buffer.from(JSON.stringify(obj)).toString('base64').replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');
  return `${b64(header)}.${b64(payload)}.`;
}

test.describe('History page E2E', () => {
  test('driver sees bidding history', async ({ page }) => {
    const fakePayload = { userId: 101, userType: 'driver', exp: Math.floor(Date.now() / 1000) + 3600 };
    const fakeToken = makeFakeJwt(fakePayload);

    await page.addInitScript({ content: `window.__PLAYWRIGHT_TEST__ = true; localStorage.setItem('token','${fakeToken}');` });

    await page.route('**/auth/me', (route) => {
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ claims: [ { type: 'userId', value: String(fakePayload.userId) }, { type: 'userType', value: 'driver' } ] }) });
    });

    const serverData = [
      { companyName: 'ACME', package: 'Box', date: '2025-01-01', destination: 'Lisboa', price: 100, status: 'Completed', rating: 4 }
    ];

    await page.route(`**/history/driver/${fakePayload.userId}`, (route) => {
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(serverData) });
    });

    await page.goto('http://localhost:3000/history');

    await expect(page.locator('text=Bidding History')).toBeVisible();
    // table exists and shows our company name
    const table = page.locator('.history-table');
    await expect(table).toBeVisible();
    await expect(table.locator('text=ACME')).toBeVisible();
    await expect(table.locator('text=Box')).toBeVisible();
  });

  test('company sees transport requests history', async ({ page }) => {
    const fakePayload = { userId: 202, userType: 'company', exp: Math.floor(Date.now() / 1000) + 3600 };
    const fakeToken = makeFakeJwt(fakePayload);

    await page.addInitScript({ content: `window.__PLAYWRIGHT_TEST__ = true; localStorage.setItem('token','${fakeToken}');` });

    await page.route('**/auth/me', (route) => {
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ claims: [ { type: 'userId', value: String(fakePayload.userId) }, { type: 'userType', value: 'company' } ] }) });
    });

    const serverData = [
      { requestId: 'REQ-1', package: 'Pallet', driverName: 'Driver A', date: '2025-02-01', destination: 'Porto', price: 120, status: 'Completed' }
    ];

    await page.route(`**/history/company/${fakePayload.userId}`, (route) => {
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(serverData) });
    });

    await page.goto('http://localhost:3000/history');

    await expect(page.locator('text=Transport Requests History')).toBeVisible();
    const table = page.locator('.history-table');
    await expect(table).toBeVisible();
    await expect(table.locator('text=REQ-1')).toBeVisible();
    await expect(table.locator('text=Pallet')).toBeVisible();
  });
});
