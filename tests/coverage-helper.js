// coverage-helper.js
require('./coverage-helper');

const fs = require('fs');
const path = require('path');
const { test } = require('@playwright/test');

test.afterEach(async ({ page }, testInfo) => {
    // Tenta ler a cobertura do bundle instrumentado no browser
    let coverage;
    try {
        coverage = await page.evaluate(() => window.__coverage__ || null);
    } catch {
        coverage = null;
    }

    if (!coverage) {
        // Se não estiveres a correr com o frontend instrumentado (start:coverage),
        // isto vai ficar null – não faz mal, só não grava nada.
        console.warn('[coverage-helper] Sem window.__coverage__ para o teste:', testInfo.title);
        return;
    }

    // Diretório .nyc_output na raiz do projeto
    const outputDir = path.resolve(__dirname, '..', '.nyc_output');
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    // Nome de ficheiro “seguro”
    const safeTitle = testInfo.title.replace(/[^\w]+/g, '_').substring(0, 80);
    const filename = `playwright-${safeTitle}-${Date.now()}.json`;
    const filePath = path.join(outputDir, filename);

    fs.writeFileSync(filePath, JSON.stringify(coverage), 'utf-8');
    console.log('[coverage-helper] Gravado:', filePath);
});
