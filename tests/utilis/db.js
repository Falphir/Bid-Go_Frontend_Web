/**
 * Simple MySQL helper for tests (Playwright/Jest).
 *
 * It lazily creates a connection pool using `mysql2/promise` based on
 * environment variables (DB_HOST, DB_PORT, DB_USER, DB_PASSWORD,
 * DB_NAME) and exposes small helpers to run parametrized queries and
 * to close the pool during test teardown.
 */

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
 * Executes a parametrized SQL query using the shared pool.
 *
 * @param {string} sql - SQL statement, possibly containing `?` placeholders.
 * @param {Array|Object} [params] - Parameters for the query.
 * @returns {Promise<*>} Query results (rows).
 */
async function query(sql, params) {
    const p = ensurePool();
    const [results] = await p.query(sql, params);
    return results;
}

/**
 * Closes the connection pool. Should be called during test teardown.
 *
 * @returns {Promise<void>} Resolves when all connections are closed.
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