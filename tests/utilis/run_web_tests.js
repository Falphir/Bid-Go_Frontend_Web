const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

// --- CORREÇÃO DOS CAMINHOS ---

// 1. Descobrir a raiz do projeto (Voltar 2 pastas atrás de "tests/utilis")
const rootDir = path.resolve(__dirname, '..', '..');

// 2. Caminho para os scripts geradores (Como estão na MESMA pasta, usamos apenas __dirname)
const reportGenerator = path.join(__dirname, 'generate_web_report.js');
const coverageGenerator = path.join(__dirname, 'generate_coverage.js');

// 3. Ficheiros a limpar (Estes ficam na raiz do projeto)
const filesToClean = [
    path.join(rootDir, 'raw_playwright.json'),
    path.join(rootDir, 'relatorio_web.html'),
    path.join(rootDir, 'Relatorio_Web.pdf'),
    path.join(rootDir, 'relatorio_cobertura.html'),
    path.join(rootDir, 'Relatorio_Cobertura.pdf'),
    path.join(rootDir, 'coverage', 'lcov.info')
];

console.log('🚀 A iniciar Ciclo Completo de Testes (Playwright + Coverage)...');
console.log(`📂 Raiz do projeto detetada: ${rootDir}`);

// 1. Limpeza
filesToClean.forEach(f => {
    if (fs.existsSync(f)) {
        try { fs.unlinkSync(f); } catch(e) {};
    }
});

// 2. Executar Playwright com Coverage (NYC)
console.log('⏳ A executar testes e a recolher cobertura... (aguarde)');

// O comando corre na raiz, por isso os caminhos são simples
const command = 'npx playwright test --reporter=json > raw_playwright.json && npx nyc --reporter=lcov';
const env = { ...process.env, NODE_ENV: 'test' };

// IMPORTANTE: cwd: rootDir garante que o comando corre na base do projeto
exec(command, { cwd: rootDir, env: env }, (error, stdout, stderr) => {
    console.log('🏁 Testes terminados.');

    if (stderr && !stderr.includes('npm update')) console.error('⚠️ Notas do Sistema:', stderr);

    // 3. Gerar Relatório de EXECUÇÃO
    console.log('📊 A gerar Relatório de Execução...');

    // Passamos o cwd: rootDir para o script filho saber onde ler o JSON
    exec(`node "${reportGenerator}"`, { cwd: rootDir }, (err, genStdout, genStderr) => {
        if (err) {
            console.error('❌ Erro Relatório Execução:', genStderr);
            // Mesmo com erro aqui, tentamos a cobertura
        } else {
            console.log(genStdout);
        }

        // 4. Gerar Relatório de COBERTURA
        console.log('📊 A processar Cobertura...');
        exec(`node "${coverageGenerator}"`, { cwd: rootDir }, (err2, covStdout, covStderr) => {
            if (err2) {
                console.error('❌ Erro Relatório Cobertura:', covStderr);
                console.error(`Caminho tentado: ${coverageGenerator}`);
            } else {
                console.log(covStdout);
            }

            // 5. Abrir os PDFs automaticamente (caminhos absolutos)
            openFile(path.join(rootDir, 'Relatorio_Web.pdf'));
            openFile(path.join(rootDir, 'Relatorio_Cobertura.pdf'));
        });
    });
});

function openFile(filePath) {
    if (!fs.existsSync(filePath)) return;

    const platform = os.platform();
    let cmd = '';

    if (platform === 'win32') {
        cmd = `start "" "${filePath}"`;
    } else if (platform === 'darwin') {
        cmd = `open "${filePath}"`;
    } else {
        cmd = `xdg-open "${filePath}"`;
    }

    exec(cmd);
}