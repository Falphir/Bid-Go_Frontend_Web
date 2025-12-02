const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const os = require('os');

// Configurações
const inputFile = 'raw_playwright.json';
const htmlFile = 'relatorio_web.html';
const pdfFile = 'Relatorio_Web.pdf';

async function main() {
    // 1. Verificar se o ficheiro existe
    if (!fs.existsSync(inputFile)) {
        console.error('❌ Erro: Ficheiro raw_playwright.json não encontrado.');
        return;
    }

    const content = fs.readFileSync(inputFile, 'utf8');
    let json;
    try {
        json = JSON.parse(content);
    } catch (e) {
        console.error('❌ Erro ao ler JSON. O ficheiro pode estar corrompido ou vazio.');
        return;
    }

    // 2. Extrair Estatísticas
    const stats = json.stats || {};
    const startTime = new Date(stats.startTime || Date.now());
    const durationMs = stats.duration || 0;

    let passed = 0;
    let failed = 0;
    let skipped = 0;
    const testResults = [];

    // Função recursiva para processar suites
    function processSuite(suite, parentName = '') {
        if (suite.specs) {
            suite.specs.forEach(spec => {
                const title = spec.title;
                const fullName = parentName ? `${parentName} ${title}` : title;

                spec.tests.forEach(test => {
                    // Pega o último resultado
                    const result = test.results[test.results.length - 1];
                    if (!result) return;

                    const status = result.status; // passed, failed, timedOut, skipped
                    const duration = result.duration;

                    let displayStatus = 'Skip';
                    let errorDetails = '';

                    if (status === 'passed') {
                        displayStatus = 'Pass';
                        passed++;
                    } else if (status === 'failed' || status === 'timedOut') {
                        displayStatus = 'Fail';
                        failed++;
                        if (result.error && result.error.message) {
                            // Limpar códigos ANSI de cor
                            errorDetails = result.error.message.replace(/\u001b\[.*?m/g, '').split('\n')[0];
                        }
                    } else {
                        skipped++;
                    }

                    testResults.push({
                        name: fullName,
                        status: displayStatus,
                        duration: `${duration} ms`,
                        errorDetails: errorDetails
                    });
                });
            });
        }

        if (suite.suites) {
            suite.suites.forEach(childSuite => {
                const childTitle = childSuite.title;
                let nextParent = parentName ? `${parentName} > ${childTitle}` : childTitle;
                if (!childTitle) nextParent = parentName;
                processSuite(childSuite, nextParent);
            });
        }
    }

    if (json.suites) {
        json.suites.forEach(rootSuite => processSuite(rootSuite));
    }

    const totalTests = passed + failed + skipped;
    const passRate = totalTests === 0 ? 0 : Math.round((passed / totalTests) * 100);
    const overallResult = (failed === 0 && totalTests > 0) ? "Pass" : "Fail";

    // Formatar Duração
    const minutes = Math.floor(durationMs / 60000);
    const seconds = Math.floor((durationMs % 60000) / 1000);
    const durationStr = `${minutes}m ${seconds}s`;
    const dateStr = startTime.toISOString().replace('T', ' ').substring(0, 19);

    // 3. Gerar HTML (Template igual ao Mobile)
    const htmlContent = `
<!DOCTYPE html>
<html lang="pt">
<head>
    <meta charset="UTF-8">
    <title>Relatório de Execução - Bid-Go Web</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; line-height: 1.5; max-width: 900px; margin: 0 auto; padding: 40px; background-color: #fff; }
        h1 { font-size: 24px; font-weight: bold; margin-bottom: 20px; color: #000; }
        h2 { font-size: 18px; font-weight: bold; margin-top: 30px; margin-bottom: 10px; border-bottom: 1px solid #ccc; padding-bottom: 5px; }
        p { margin-bottom: 15px; text-align: justify; font-size: 14px; }
        .summary-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
        .metric { font-size: 14px; margin-bottom: 5px; }
        .status-pass { color: green; font-weight: bold; }
        .status-fail { color: red; font-weight: bold; }
        .summary-table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 14px; }
        .summary-table th, .summary-table td { border: 1px solid #ccc; padding: 8px; text-align: left; }
        .summary-table th { background-color: #f9f9f9; }
        .results-table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 13px; }
        .results-table th { border-bottom: 2px solid #000; text-align: left; padding: 5px; }
        .results-table td { border-bottom: 1px solid #ddd; padding: 8px 5px; vertical-align: top;}
        .error-text { color: red; font-size: 11px; display: block; margin-top: 4px; font-style: italic;}
    </style>
</head>
<body>
    <h1>Relatório de Execução de Testes (Web)</h1>
    <p>O presente relatório apresenta os resultados da execução dos testes de sistema (E2E) realizados na aplicação Web <strong>Bid-Go</strong>.</p>

    <h2>Run Summary</h2>
    <div class="summary-grid">
        <div>
            <div class="metric"><strong>Overall Result:</strong> <span class="${overallResult === 'Pass' ? 'status-pass' : 'status-fail'}">${overallResult === 'Pass' ? '✔ Pass' : '✘ Fail'}</span></div>
            <div class="metric"><strong>Pass Rate:</strong> ${passRate}%</div>
            <div class="metric"><strong>Run Duration:</strong> ${durationStr}</div>
        </div>
        <div>
            <div class="metric"><strong>Date:</strong> ${dateStr}</div>
            <div class="metric"><strong>Total Tests:</strong> ${totalTests}</div>
        </div>
    </div>

    <table class="summary-table">
        <thead><tr><th>✔ Passed</th><th>✘ Failed</th><th>⚠ Skipped</th></tr></thead>
        <tbody>
            <tr><td>${passed}</td><td>${failed}</td><td>${skipped}</td></tr>
            <tr><td>${passRate}%</td><td>${totalTests > 0 ? Math.round((failed/totalTests)*100) : 0}%</td><td>0%</td></tr>
        </tbody>
    </table>

    <h2>Detalhes da Execução</h2>
    <table class="results-table">
        <thead><tr><th>TEST</th><th style="width: 100px;">RESULT</th><th style="width: 100px;">DURATION</th></tr></thead>
        <tbody>
            ${testResults.map(t => `
            <tr>
                <td>
                    ${t.name}
                    ${t.status === 'Fail' ? `<span class="error-text">Error: ${t.errorDetails}</span>` : ''}
                </td>
                <td class="${t.status === 'Pass' ? 'status-pass' : 'status-fail'}">
                    ${t.status === 'Pass' ? '✔ Pass' : '✘ Fail'}
                </td>
                <td>${t.duration}</td>
            </tr>
            `).join('')}
        </tbody>
    </table>
</body>
</html>
  `;

    fs.writeFileSync(htmlFile, htmlContent);
    console.log(`✅ Relatório HTML gerado: ${htmlFile}`);

    // 4. Converter para PDF
    convertToPdf(htmlFile, pdfFile);
}

function convertToPdf(htmlPath, pdfPath) {
    console.log('🔄 A converter para PDF...');

    // Caminhos do Chrome no Windows/Mac/Linux
    const possiblePaths = [
        'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
        'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
        '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', // Mac
        '/usr/bin/google-chrome', // Linux
        '/usr/bin/chromium-browser' // Linux
    ];

    let browserPath = possiblePaths.find(p => fs.existsSync(p));

    if (!browserPath) {
        console.log('⚠️ Navegador não encontrado. PDF não gerado, mas o HTML está pronto.');
        return;
    }

    const absHtml = path.resolve(htmlPath);
    const absPdf = path.resolve(pdfPath);

    // Comando headless
    const cmd = `"${browserPath}" --headless --disable-gpu --print-to-pdf="${absPdf}" --no-pdf-header-footer "${absHtml}"`;

    exec(cmd, (error) => {
        if (error) {
            console.error(`❌ Falha ao gerar PDF: ${error.message}`);
        } else {
            console.log(`📄 PDF Web Gerado com sucesso: ${pdfFile}`);
        }
    });
}

main();