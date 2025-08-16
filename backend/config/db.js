require('dotenv').config();

if (process.env.DATABASE_URL) {
    // PostgreSQL for Render production
    const { Pool } = require('pg');
    
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });
    
    pool.connect((err, client, release) => {
        if (err) {
            console.error('❌ PostgreSQL connection failed:', err.message);
            return;
        }
        console.log('✅ Connected to PostgreSQL database');
        release();
    });
    
    module.exports = pool;
} else {
    // MySQL for local development
    const mysql = require('mysql2');
    
    const connection = mysql.createConnection({
        host: process.env.MYSQLHOST || 'localhost',
        user: process.env.MYSQLUSER || 'root',
        password: process.env.MYSQLPASSWORD || 'Root@123',
        database: process.env.MYSQLDATABASE || 'company_management',
        port: process.env.MYSQLPORT || 3306
    });
    
    connection.connect((err) => {
        if (err) {
            console.error('❌ MySQL connection failed:', err.message);
            return;
        }
        console.log('✅ Connected to MySQL database');
    });
    
    module.exports = connection;
}
