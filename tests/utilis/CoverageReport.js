const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');
const readline = require('readline');


const currentDirHasPackage = fs.existsSync(path.join(__dirname, 'package.json'));
const rootDir = currentDirHasPackage ? __dirname : path.resolve(__dirname, '..', '..');


const reportsDir = path.join(rootDir, 'reports');


const lcovPath = path.join(rootDir, 'coverage', 'lcov.info');
const htmlFile = path.join(reportsDir, 'relatorio_cobertura.html');
const pdfFile = path.join(reportsDir, 'Relatorio_Cobertura.pdf');

console.log('A iniciar Testes com Cobertura...');
console.log(`Raiz do projeto: ${rootDir}`);
console.log(`Pasta de relatórios: ${reportsDir}`);

if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
}


[lcovPath, htmlFile, pdfFile].forEach(f => {
    if (fs.existsSync(f)) try { fs.unlinkSync(f); } catch(e) {};
});


console.log('A recolher cobertura... (aguarde)');

const execOptions = {
    cwd: rootDir,
    env: { ...process.env, NODE_ENV: 'test' },
    maxBuffer: 1024 * 1024 * 10
};

exec('npm run e2e:coverage', execOptions, (error, stdout, stderr) => {
    console.log('Execução terminada.');
    if (stderr && !stderr.includes('npm update') && !stderr.includes('debugger')) {
        console.error('Notas do Sistema:', stderr);
    }

    generateCoverageReport();
});

async function generateCoverageReport() {
    await new Promise(r => setTimeout(r, 1000));
    console.log('A processar ficheiro lcov.info...');

    if (!fs.existsSync(lcovPath)) {
        console.error(`Erro: O ficheiro não foi criado em: ${lcovPath}`);
        return;
    }

    const fileStream = fs.createReadStream(lcovPath);
    const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

    let totalLines = 0, coveredLines = 0, totalFiles = 0;
    const fileStats = [];
    let currentFile = '', currentFileTotal = 0, currentFileHit = 0;

    for await (const line of rl) {
        if (line.startsWith('SF:')) {
            let rawPath = line.substring(3);
            currentFile = rawPath.replace(rootDir, '').replace(/^[\\\/]/, '');
            currentFileTotal = 0;
            currentFileHit = 0;
        } else if (line.startsWith('DA:')) {
            const parts = line.substring(3).split(',');
            const hits = parseInt(parts[1], 10);
            currentFileTotal++;
            if (hits > 0) currentFileHit++;
        } else if (line === 'end_of_record') {
            if (currentFileTotal > 0) {
                fileStats.push({
                    name: currentFile,
                    total: currentFileTotal,
                    hit: currentFileHit,
                    percent: (currentFileHit / currentFileTotal) * 100
                });
                totalLines += currentFileTotal;
                coveredLines += currentFileHit;
                totalFiles++;
            }
        }
    }

    fileStats.sort((a, b) => a.percent - b.percent);

    const totalCoveragePercent = totalLines === 0 ? 0 : (coveredLines / totalLines) * 100;
    const uncoveredLines = totalLines - coveredLines;


    const htmlContent = `
<!DOCTYPE html>
<html lang="pt">
<head>
    <meta charset="UTF-8">
    <title>Relatório de Cobertura - Bid-Go Web</title>
    <style>
        body { font-family: 'Segoe UI', sans-serif; color: #333; line-height: 1.5; max-width: 900px; margin: 0 auto; padding: 40px; background-color: #fff; }
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
    
    <p>O presente relatório apresenta os resultados da análise de cobertura de testes do sistema <strong>Bid-Go</strong> (Web), com o objetivo de avaliar a extensão e eficácia dos testes automatizados implementados. A cobertura de testes é um indicador essencial da qualidade do software, permitindo identificar áreas do código que foram ou não verificadas durante a execução dos testes.</p>
    
    <p>Os resultados foram obtidos através da recolha de métricas durante a execução dos testes E2E, abrangendo componentes, páginas e lógica da interface da aplicação. Este relatório fornece uma visão detalhada sobre a percentagem de linhas e ramos de código testados, possibilitando uma avaliação objetiva da robustez e fiabilidade do sistema.</p>

    <div class="summary-box">
        <div class="summary-title">Coverage Summary</div>
        <div class="metric-row"><span class="metric-label">Files:</span> <span>${totalFiles}</span></div>
        <div class="metric-row"><span class="metric-label">Line coverage:</span> <span>${totalCoveragePercent.toFixed(1)}% (${coveredLines} of ${totalLines})</span></div>
        <div class="metric-row"><span class="metric-label">Uncovered lines:</span> <span>${uncoveredLines}</span></div>
    </div>

    <h2>Coverage Details</h2>
    <table>
        <thead><tr><th>Name</th><th>Line Coverage</th><th>Lines (Hit/Total)</th></tr></thead>
        <tbody>
            ${fileStats.map(f => {
        const color = f.percent >= 80 ? '#28a745' : (f.percent >= 50 ? '#ffc107' : '#dc3545');
        return `
                <tr>
                    <td>${f.name}</td>
                    <td>
                        <div class="bar-container"><div class="bar-fill" style="width: ${f.percent}%; background-color: ${color};"></div></div>
                        <strong>${f.percent.toFixed(1)}%</strong>
                    </td>
                    <td>${f.hit} / ${f.total}</td>
                </tr>`;
    }).join('')}
        </tbody>
    </table>
</body>
</html>`;

    fs.writeFileSync(htmlFile, htmlContent);
    console.log(`HTML criado: ${htmlFile}`);
    convertToPdf(htmlFile, pdfFile);
}

function convertToPdf(htmlPath, pdfPath) {
    console.log('A converter para PDF...');
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

    exec(cmd, (err) => {
        if (!err) {
            console.log(`PDF Cobertura criado: ${pdfPath}`);
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