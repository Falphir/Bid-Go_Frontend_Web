// tests/utils/db.js
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

async function query(sql, params) {
    const p = ensurePool();
    const [results] = await p.query(sql, params);
    return results;
}

async function close() {
    if (!pool) return;
    try {
        await pool.end();
    } finally {
        pool = null; 
    }
}

module.exports = { query, close };