// tests/utils/db.js
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '1234',
    database: 'bidgo',
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