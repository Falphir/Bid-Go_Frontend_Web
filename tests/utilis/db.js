// Utilitário de base de dados para testes (Playwright/Jest)
// Cria um pool de ligações MySQL e expõe funções simples para executar queries
// e encerrar o pool no final dos testes.
//
// Requer as seguintes variáveis de ambiente:
// - DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME
//
// Nota: usar um utilizador/BD de testes para evitar impactar dados reais.
const mysql = require('mysql2/promise');

let pool = null;

function ensurePool() {
    if (pool) return pool;
    pool = mysql.createPool({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        ssl: { minVersion: 'TLSv1.2' }
    });
    return pool;
}

/**
 * Executa uma query parametrizada usando o pool
 * @param {string} sql - Instrução SQL (pode conter placeholders ?)
 * @param {Array|Object} [params] - Parâmetros para a query
 * @returns {Promise<any>} Resultados da query (linhas)
 */
async function query(sql, params) {
    const p = ensurePool();
    const [results] = await p.query(sql, params);
    return results;
}

/**
 * Encerra o pool de ligações. Deve ser chamado no teardown dos testes.
 * @returns {Promise<void>}
 */
async function close() {
    if (!pool) return;
    try {
        await pool.end();
    } finally {
        pool = null; 
    }
}

module.exports = { query, close };