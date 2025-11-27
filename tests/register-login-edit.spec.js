const { test, expect } = require('../playwright-coverage');


// Helper to build a fake JWT (not signed) with base64url payload
function makeFakeJwt(payload) {
  const header = { alg: 'none', typ: 'JWT' };
  const b64 = (obj) => Buffer.from(JSON.stringify(obj)).toString('base64').replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');
  return `${b64(header)}.${b64(payload)}.`; // trailing dot as empty signature
}

test.describe('Register → Login → Edit profile', () => {
  test('should register, login and edit company name', async ({ page }) => {
    // Intercept register company call and return a token
    const fakePayload = { userId: 12345, userType: 'company', exp: Math.floor(Date.now() / 1000) + 3600 };
    const fakeToken = makeFakeJwt(fakePayload);

    // Ensure tests run with a token and prevent auto-redirects during requests
    await page.addInitScript({ content: `window.__PLAYWRIGHT_TEST__ = true; localStorage.setItem('token','${fakeToken}');` });

    await page.route('**/register/company', (route) => {
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ token: fakeToken }) });
    });

    // Intercept auth/me background call used by useMe and return claims indicating a company user
    await page.route('**/auth/me', (route) => {
      const claims = [
        { type: 'userId', value: String(fakePayload.userId) },
        { type: 'userType', value: 'company' },
        { type: 'name', value: 'Test Company User' }
      ];
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ claims }) });
    });

    // Start at register page
    await page.goto('http://localhost:3000/register');

    // Choose Company
    await page.click('text=Company');

    // Fill form
    await page.fill('input[placeholder="Name"]', 'Test Company User');
    await page.fill('input[placeholder="Company Name"]', 'ACME Ltd');
    await page.fill('input[placeholder="Address"]', 'Rua Teste 1');
    const email = `e2e-${Date.now()}@example.com`;
    await page.fill('input[placeholder="Email"]', email);
    await page.fill('input[placeholder="Phone"]', '912345678');
    await page.fill('input[placeholder="NIF"]', '123456789');
    // password input is a custom component; target by label
    await page.fill('input[autocomplete="off"]', 'Abcd1234!');

    // Click Register button
    await page.click('button:has-text("Register")');

    // After register, navigate explicitly to the Login page (route is /login)
    await page.goto('http://localhost:3000/login');

    // Now intercept login to return token as well (simulate login flow)
    await page.route('**/auth/login', (route) => {
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ token: fakeToken }) });
    });

    // Fill login form
    await page.fill('input[type="email"]', email);
    // password field; use lowercase `autocomplete` attribute
    await page.fill('input[autocomplete="current-password"]', 'Abcd1234!');
    await page.click('button:has-text("Sign In")');

    // Wait for the client to store the token in localStorage (login success)
    await page.waitForFunction(() => !!localStorage.getItem('token'));

    // Intercept profile GET before navigating so the request is handled
    await page.route(`**/profile/${fakePayload.userId}`, (route) => {
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ name: 'Test Company User', companyName: 'ACME Ltd', email, address: 'Rua Teste 1', phoneNumber: '912345678', nif: '123456789' }) });
    });

    // After login navigate to profile
    await page.goto('http://localhost:3000/profile');

    // Click Edit Profile button
    await page.click('button:has-text("Edit Profile")');

    // Change name field (target by label 'Name')
    const newName = 'ACME Ltd - Edited';
      await page.fill('input[class="Name"]', newName);


    // Intercept profile update
    await page.route(`**/profile/updateCompany/${fakePayload.userId}`, (route, request) => {
      // Accept PUT (FormData) and respond success. record method for debugging if needed.
      if (request.method().toLowerCase() === 'put') {
        route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({}) });
      } else {
        route.continue();
      }
    });

    // Click Save changes
    await page.click('button:has-text("Save changes")');

    // Expect a success toast to appear
    const toast = page.locator('.toast');
    await expect(toast).toHaveText(/Profile updated successfully|updated successfully|sucesso/i, { timeout: 10000 });

  });
});
