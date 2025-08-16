require('dotenv').config();

if (process.env.DATABASE_URL) {
    // PostgreSQL for Render production
    const { Pool } = require('pg');
    
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });
    
    pool.connect((err, client, release) => {
        if (err) {
            console.error('❌ PostgreSQL connection failed:', err.message);
        } else {
            console.log('✅ Connected to PostgreSQL database');
            if (release) release();
        }
    });
    
    module.exports = pool;
} else {
    // MySQL for local development
    const mysql = require('mysql2');
    
    const connection = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'Root@123',
        database: 'company_management',
        port: 3306
    });
    
    connection.connect((err) => {
        if (err) {
            console.error('❌ MySQL connection failed:', err.message);
        } else {
            console.log('✅ Connected to MySQL database');
        }
    });
    
    module.exports = connection;
}
