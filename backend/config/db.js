require('dotenv').config();

console.log('🔍 Environment Variables Debug:');
console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
console.log('DATABASE_URL preview:', process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 50) + '...' : 'MISSING');
console.log('NODE_ENV:', process.env.NODE_ENV);

if (process.env.DATABASE_URL) {
    // PostgreSQL for Render production
    const { Pool } = require('pg');
    
    console.log('📡 Using DATABASE_URL for PostgreSQL connection');
    
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false
        }
    });
    
    pool.connect((err, client, release) => {
        if (err) {
            console.error('❌ PostgreSQL connection failed:', err.message);
            console.error('Connection string used:', process.env.DATABASE_URL);
            return;
        }
        console.log('✅ Connected to PostgreSQL database');
        release();
    });
    
    module.exports = pool;
} else {
    // Fallback to MySQL for local development
    console.log('🔄 Using MySQL fallback for local development');
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
            return;
        }
        console.log('✅ Connected to MySQL database');
    });
    
    module.exports = connection;
}
