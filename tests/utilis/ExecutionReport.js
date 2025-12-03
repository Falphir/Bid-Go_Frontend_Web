const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');




const currentDirHasPackage = fs.existsSync(path.join(__dirname, 'package.json'));
const rootDir = currentDirHasPackage ? __dirname : path.resolve(__dirname, '..', '..');


const reportsDir = path.join(rootDir, 'reports');


const jsonFile = path.join(reportsDir, 'raw_playwright.json');
const htmlFile = path.join(reportsDir, 'relatorio_web.html');
const pdfFile = path.join(reportsDir, 'Relatorio_Web.pdf');

console.log('A iniciar Testes de Execução (Web)...');
console.log(`Raiz do projeto: ${rootDir}`);
console.log(`Pasta de relatórios: ${reportsDir}`);




if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
}


[jsonFile, htmlFile, pdfFile].forEach(f => {
    if (fs.existsSync(f)) try { fs.unlinkSync(f); } catch(e) {};
});

// --- 3. EXECUTAR TESTES ---
console.log('A executar testes Playwright... (aguarde)');


const command = `npx playwright test --reporter=json > "${jsonFile}"`;
const env = { ...process.env, NODE_ENV: 'test' };

exec(command, { cwd: rootDir, env: env }, (error, stdout, stderr) => {
    console.log('Testes terminados.');


    if (stderr && !stderr.includes('npm update')) console.error('Notas do Sistema:', stderr);


    generateExecutionReport();
});

function generateExecutionReport() {
    console.log('A criar Relatório HTML e PDF...');

    if (!fs.existsSync(jsonFile)) {
        console.error(`Erro: O ficheiro ${jsonFile} não foi encontrado.`);
        return;
    }

    const content = fs.readFileSync(jsonFile, 'utf8');
    let json;
    try { json = JSON.parse(content); } catch (e) { return; }

    const stats = json.stats || {};
    const startTime = new Date(stats.startTime || Date.now());
    const durationMs = stats.duration || 0;

    let passed = 0, failed = 0, skipped = 0;
    const testResults = [];

    function processSuite(suite, parentName = '') {
        if (suite.specs) {
            suite.specs.forEach(spec => {
                const fullName = parentName ? `${parentName} ${spec.title}` : spec.title;
                spec.tests.forEach(test => {
                    const result = test.results[test.results.length - 1];
                    if (!result) return;

                    const status = result.status;
                    let displayStatus = 'Skip';
                    let errorDetails = '';

                    if (status === 'passed') {
                        displayStatus = 'Pass';
                        passed++;
                    } else if (status === 'failed' || status === 'timedOut') {
                        displayStatus = 'Fail';
                        failed++;
                        if (result.error && result.error.message) {
                            errorDetails = result.error.message.replace(/\u001b\[.*?m/g, '').split('\n')[0];
                        }
                    } else {
                        skipped++;
                    }

                    testResults.push({
                        name: fullName,
                        status: displayStatus,
                        duration: `${result.duration} ms`,
                        errorDetails: errorDetails
                    });
                });
            });
        }
        if (suite.suites) {
            suite.suites.forEach(child => processSuite(child, parentName ? `${parentName} > ${child.title}` : child.title));
        }
    }

    if (json.suites) json.suites.forEach(root => processSuite(root));

    const totalTests = passed + failed + skipped;
    const passRate = totalTests === 0 ? 0 : Math.round((passed / totalTests) * 100);
    const overallResult = (failed === 0 && totalTests > 0) ? "Pass" : "Fail";

    const minutes = Math.floor(durationMs / 60000);
    const seconds = Math.floor((durationMs % 60000) / 1000);
    const durationStr = `${minutes}m ${seconds}s`;
    const dateStr = startTime.toISOString().replace('T', ' ').substring(0, 19);


    const htmlContent = `
<!DOCTYPE html>
<html lang="pt">
<head>
    <meta charset="UTF-8">
    <title>Relatório de Execução - Bid-Go Web</title>
    <style>
        body { font-family: 'Segoe UI', sans-serif; color: #333; line-height: 1.5; max-width: 900px; margin: 0 auto; padding: 40px; background-color: #fff; }
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
    
    <p>O presente relatório apresenta os resultados da execução dos testes realizados no sistema <strong>Bid-Go</strong> (Web). O objetivo destes testes é validar o correto funcionamento dos diferentes componentes da aplicação, garantindo a fiabilidade, consistência e robustez das funcionalidades implementadas.</p>
    
    <p>Os testes foram executados de forma automatizada, consistindo em testes de sistema (End-to-End), e foram gerados através da ferramenta <strong>Playwright</strong>. Este relatório documenta o resumo da execução, incluindo a taxa de sucesso, a duração total dos testes e os casos de teste executados, permitindo assim uma análise clara do estado atual da qualidade do software.</p>

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
        </tbody>
    </table>

    <h2>Detalhes da Execução</h2>
    <table class="results-table">
        <thead><tr><th>TEST</th><th>RESULT</th><th>DURATION</th></tr></thead>
        <tbody>
            ${testResults.map(t => `
            <tr>
                <td>${t.name} ${t.status === 'Fail' ? `<span class="error-text">Error: ${t.errorDetails}</span>` : ''}</td>
                <td class="${t.status === 'Pass' ? 'status-pass' : 'status-fail'}">${t.status === 'Pass' ? '✔ Pass' : '✘ Fail'}</td>
                <td>${t.duration}</td>
            </tr>
            `).join('')}
        </tbody>
    </table>
</body>
</html>`;

    fs.writeFileSync(htmlFile, htmlContent);
    console.log(`HTML gerado: ${htmlFile}`);
    convertToPdf(htmlFile, pdfFile);
}

function convertToPdf(htmlPath, pdfPath) {
    console.log('🔄 A converter para PDF...');
    const possiblePaths = [
        'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
        'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
        '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
        '/usr/bin/google-chrome',
        '/usr/bin/chromium-browser'
    ];

    const browserPath = possiblePaths.find(p => fs.existsSync(p));
    if (!browserPath) {
        console.log('Navegador não encontrado. PDF não criado.');
        return;
    }

    const cmd = `"${browserPath}" --headless --disable-gpu --print-to-pdf="${pdfPath}" --no-pdf-header-footer "${htmlPath}"`;

    exec(cmd, (error) => {
        if (!error) {
            console.log(`PDF Web Criado: ${pdfPath}`);
            openFile(pdfPath);
        }
    });
}

function openFile(filePath) {
    if (!fs.existsSync(filePath)) return;
    const platform = os.platform();
    let cmd = platform === 'win32' ? `start "" "${filePath}"` : (platform === 'darwin' ? `open "${filePath}"` : `xdg-open "${filePath}"`);
    exec(cmd);
}