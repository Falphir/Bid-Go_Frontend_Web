const base = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const coverageDir = path.join(process.cwd(), '.nyc_output');

exports.test = base.test.extend({
    page: async ({ page }, use, testInfo) => {
        await use(page);

        const coverage = await page.evaluate(() => globalThis.__coverage__);

        if (coverage) {
            fs.mkdirSync(coverageDir, { recursive: true });
            const safeTitle = testInfo.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
            const filePath = path.join(coverageDir, `${safeTitle}.json`);
            fs.writeFileSync(filePath, JSON.stringify(coverage));
        }
    }
});

exports.expect = base.expect;