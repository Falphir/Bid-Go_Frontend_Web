const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const readline = require('readline');
const os = require('os');

// Configurações
const lcovPath = path.join(__dirname, '..', 'coverage', 'lcov.info');
const htmlFile = path.join(__dirname, '..', 'relatorio_cobertura.html');
const pdfFile = path.join(__dirname, '..', 'Relatorio_Cobertura.pdf');

async function main() {
    if (!fs.existsSync(lcovPath)) {
        console.error('❌ Erro: Ficheiro coverage/lcov.info não encontrado.');
        console.error('ℹ️  Precisas de configurar o Playwright para gerar coverage (ver instruções).');
        return;
    }

    console.log('📊 A ler lcov.info...');

    const fileStream = fs.createReadStream(lcovPath);
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    let totalLines = 0;
    let coveredLines = 0;
    let totalFiles = 0;

    const fileStats = [];

    let currentFile = '';
    let currentFileTotal = 0;
    let currentFileHit = 0;

    for await (const line of rl) {
        if (line.startsWith('SF:')) {
            // Start File
            let rawPath = line.substring(3);
            // Tenta limpar o caminho para ficar bonito (remove caminhos absolutos)
            currentFile = path.basename(rawPath);
            // Se quiseres pastas: currentFile = rawPath.split('src/')[1] || rawPath;

            currentFileTotal = 0;
            currentFileHit = 0;
        } else if (line.startsWith('DA:')) {
            // Data Address: DA:linha,hits
            const parts = line.substring(3).split(',');
            const hits = parseInt(parts[1], 10);

            currentFileTotal++;
            if (hits > 0) currentFileHit++;
        } else if (line === 'end_of_record') {
            if (currentFileTotal > 0) {
                const percentage = (currentFileHit / currentFileTotal) * 100;
                fileStats.push({
                    name: currentFile,
                    total: currentFileTotal,
                    hit: currentFileHit,
                    percent: percentage
                });

                totalLines += currentFileTotal;
                coveredLines += currentFileHit;
                totalFiles++;
            }
        }
    }

    // Ordenar (os com menos cobertura aparecem primeiro, para alertar)
    fileStats.sort((a, b) => a.percent - b.percent);

    const totalCoveragePercent = totalLines === 0 ? 0 : (coveredLines / totalLines) * 100;
    const uncoveredLines = totalLines - coveredLines;

    // --- GERAR HTML (Mesmo Design do Mobile) ---
    const htmlContent = `
<!DOCTYPE html>
<html lang="pt">
<head>
    <meta charset="UTF-8">
    <title>Relatório de Cobertura - Bid-Go Web</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; line-height: 1.5; max-width: 900px; margin: 0 auto; padding: 40px; background-color: #fff; }
        h1 { font-size: 24px; font-weight: bold; margin-bottom: 20px; color: #000; }
        p { margin-bottom: 15px; text-align: justify; font-size: 14px; }
        .summary-box { background-color: #f9f9f9; border: 1px solid #ccc; padding: 15px; margin-bottom: 30px; border-radius: 4px; }
        .summary-title { font-weight: bold; font-size: 16px; margin-bottom: 10px; border-bottom: 1px solid #ddd; padding-bottom: 5px; }
        .metric-row { display: flex; justify-content: space-between; margin-bottom: 5px; font-size: 14px; }
        .metric-label { font-weight: bold; color: #555; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 13px; }
        th { text-align: left; border-bottom: 2px solid #333; padding: 8px; background-color: #fff; }
        td { border-bottom: 1px solid #eee; padding: 8px; }
        .bar-container { background-color: #e9ecef; width: 100px; height: 10px; border-radius: 5px; display: inline-block; vertical-align: middle; margin-right: 10px; }
        .bar-fill { height: 100%; border-radius: 5px; }
    </style>
</head>
<body>
    <h1>Relatório de Cobertura de Testes (Web)</h1>
    <p>O presente relatório apresenta os resultados da análise de cobertura de código da aplicação Web <strong>Bid-Go</strong>.</p>

    <div class="summary-box">
        <div class="summary-title">Coverage Summary</div>
        <div class="metric-row"><span class="metric-label">Parser:</span> <span>LCOV (Playwright/NYC)</span></div>
        <div class="metric-row"><span class="metric-label">Files:</span> <span>${totalFiles}</span></div>
        <div class="metric-row"><span class="metric-label">Line coverage:</span> <span>${totalCoveragePercent.toFixed(1)}% (${coveredLines} of ${totalLines})</span></div>
        <div class="metric-row"><span class="metric-label">Uncovered lines:</span> <span>${uncoveredLines}</span></div>
    </div>

    <h2>Coverage Details</h2>
    <table>
        <thead>
            <tr>
                <th>Name</th>
                <th>Line Coverage</th>
                <th>Lines (Hit/Total)</th>
            </tr>
        </thead>
        <tbody>
            ${fileStats.map(f => {
        const color = f.percent >= 80 ? '#28a745' : (f.percent >= 50 ? '#ffc107' : '#dc3545');
        return `
                <tr>
                    <td>${f.name}</td>
                    <td>
                        <div class="bar-container">
                            <div class="bar-fill" style="width: ${f.percent}%; background-color: ${color};"></div>
                        </div>
                        <strong>${f.percent.toFixed(1)}%</strong>
                    </td>
                    <td>${f.hit} / ${f.total}</td>
                </tr>
                `;
    }).join('')}
        </tbody>
    </table>
</body>
</html>
    `;

    fs.writeFileSync(htmlFile, htmlContent);
    console.log(`✅ HTML gerado: ${htmlFile}`);

    convertToPdf(htmlFile, pdfFile);
}

function convertToPdf(htmlPath, pdfPath) {
    console.log('🔄 A converter para PDF...');
    const possiblePaths = [
        'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
        'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
        '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
        '/usr/bin/google-chrome'
    ];

    const browserPath = possiblePaths.find(p => fs.existsSync(p));
    if (!browserPath) return;

    const cmd = `"${browserPath}" --headless --disable-gpu --print-to-pdf="${pdfPath}" --no-pdf-header-footer "${htmlPath}"`;
    exec(cmd, (err) => {
        if (!err) {
            console.log(`📄 PDF Cobertura Gerado: ${pdfPath}`);
            // Abrir automaticamente
            const platform = os.platform();
            if (platform === 'win32') exec(`start "" "${pdfPath}"`);
            else if (platform === 'darwin') exec(`open "${pdfPath}"`);
            else exec(`xdg-open "${pdfPath}"`);
        }
    });
}

main();