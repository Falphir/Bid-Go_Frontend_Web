/**
 * Playwright coverage helper.
 *
 * This hook runs after each Playwright test, collects the
 * `window.__coverage__` object from the browser context (when
 * available) and writes it as a JSON file under `tests/.nyc_output`,
 * so that Istanbul/NYC can merge the coverage into the main report.
 */
// Helper de cobertura para Playwright
//
// Este ficheiro recolhe a cobertura de código gerada no browser (window.__coverage__)
// após cada teste Playwright e grava-a no formato esperado pelo NYC/Istanbul
// dentro da pasta `.nyc_output`. Depois o relatório pode ser agregado/convertido
// por ferramentas como `nyc report`.

const fs = require("fs");
const path = require("path");
const { test } = require("@playwright/test");

test.afterEach(async ({ page }, testInfo) => {
  // Tenta ler a cobertura exposta pela aplicação no contexto da página
  let coverage;
  try {
    coverage = await page.evaluate(() => window.__coverage__ || null);
  } catch {
    coverage = null;
  }

  if (!coverage) {
    // Sem cobertura disponível — provavelmente a app não foi instrumentada
    console.warn(
      "[coverage-helper] Sem window.__coverage__ para o teste:",
      testInfo.title
    );
    return;
  }

  // Garante que a pasta de saída existe: tests/.nyc_output
  const outputDir = path.resolve(__dirname, "..", ".nyc_output");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Cria um nome de ficheiro seguro e relativamente curto baseado no título do teste
  const safeTitle = testInfo.title.replace(/[^\w]+/g, "_").substring(0, 80);
  const filename = `playwright-${safeTitle}-${Date.now()}.json`;
  const filePath = path.join(outputDir, filename);

  // Escreve a cobertura no formato JSON esperado pelo NYC/Istanbul
  fs.writeFileSync(filePath, JSON.stringify(coverage), "utf-8");
  console.log("[coverage-helper] Gravado:", filePath);
});
