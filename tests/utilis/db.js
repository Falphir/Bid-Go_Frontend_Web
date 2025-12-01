// tests/utils/db.js
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

async function query(sql, params) {
    // MUDANÇA AQUI: de .execute para .query
    const [results, ] = await pool.query(sql, params);
    return results;
}

async function close() {
    await pool.end();
}

module.exports = { query, close };