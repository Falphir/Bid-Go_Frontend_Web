// const { test, expect } = require('../playwright-coverage');
//
//
// function makeFakeJwt(payload) {
//   const header = { alg: 'none', typ: 'JWT' };
//   const b64 = (obj) => Buffer.from(JSON.stringify(obj)).toString('base64').replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');
//   return `${b64(header)}.${b64(payload)}.`;
// }
//
// test.describe('Register → Login → Edit profile', () => {
//   test('should register, login and edit company name', async ({ page }) => {
//     const fakePayload = { userId: 12345, userType: 'company', exp: Math.floor(Date.now() / 1000) + 3600 };
//     const fakeToken = makeFakeJwt(fakePayload);
//
//     await page.addInitScript({ content: `window.__PLAYWRIGHT_TEST__ = true; localStorage.setItem('token','${fakeToken}');` });
//
//     await page.route('**/register/company', (route) => {
//       route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ token: fakeToken }) });
//     });
//
//     await page.route('**/auth/me', (route) => {
//       const claims = [
//         { type: 'userId', value: String(fakePayload.userId) },
//         { type: 'userType', value: 'company' },
//         { type: 'name', value: 'Test Company User' }
//       ];
//       route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ claims }) });
//     });
//
//     await page.goto('http://localhost:3000/register');
//
//     await page.click('text=Company');
//
//     await page.fill('input[placeholder="Name"]', 'Test Company User');
//     await page.fill('input[placeholder="Company Name"]', 'ACME Ltd');
//     await page.fill('input[placeholder="Address"]', 'Rua Teste 1');
//     const email = `e2e-${Date.now()}@example.com`;
//     await page.fill('input[placeholder="Email"]', email);
//     await page.fill('input[placeholder="Phone"]', '912345678');
//     await page.fill('input[placeholder="NIF"]', '123456789');
//
//     await page.fill('input[autocomplete="off"]', 'Abcd1234!');
//
//     await page.click('button:has-text("Register")');
//
//     await page.goto('http://localhost:3000/login');
//
//     await page.route('**/auth/login', (route) => {
//       route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ token: fakeToken }) });
//     });
//
//     await page.fill('input[type="email"]', email);
//
//     await page.fill('input[autocomplete="current-password"]', 'Abcd1234!');
//     await page.click('button:has-text("Sign In")');
//
//     await page.waitForFunction(() => !!localStorage.getItem('token'));
//
//     await page.route(`**/profile/${fakePayload.userId}`, (route) => {
//       route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ name: 'Test Company User', companyName: 'ACME Ltd', email, address: 'Rua Teste 1', phoneNumber: '912345678', nif: '123456789' }) });
//     });
//
//     await page.goto('http://localhost:3000/profile');
//
//     await page.click('button:has-text("Edit Profile")');
//
//     const newName = 'ACME Ltd - Edited';
//       await page.fill('input[class="Name"]', newName);
//
//
//     await page.route(`**/profile/updateCompany/${fakePayload.userId}`, (route, request) => {
//       if (request.method().toLowerCase() === 'put') {
//         route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({}) });
//       } else {
//         route.continue();
//       }
//     });
//
//     await page.click('button:has-text("Save changes")');
//
//     const toast = page.locator('.toast');
//     await expect(toast).toHaveText(/Profile updated successfully|updated successfully|sucesso/i, { timeout: 10000 });
//
//   });
// });
