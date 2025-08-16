require('dotenv').config();

// Try PostgreSQL first (for Render), then fallback to MySQL (for local)
let db;

if (process.env.DATABASE_URL) {
    // PostgreSQL for Render
    const { Pool } = require('pg');
    
    db = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false
        }
    });
    
    console.log('🔄 Attempting PostgreSQL connection...');
    
} else {
    // MySQL for local development
    const mysql = require('mysql2');
    
    db = mysql.createConnection({
        host: 'localhost',
        user: 'root', 
        password: 'Root@123',
        database: 'company_management'
    });
    
    console.log('🔄 Attempting MySQL connection...');
}

// Test connection
if (process.env.DATABASE_URL) {
    // Test PostgreSQL
    db.connect((err, client, release) => {
        if (err) {
            console.error('❌ PostgreSQL failed:', err.message);
        } else {
            console.log('✅ PostgreSQL connected successfully');
            if (release) release();
        }
    });
} else {
    // Test MySQL
    db.connect((err) => {
        if (err) {
            console.error('❌ MySQL failed:', err.message);
        } else {
            console.log('✅ MySQL connected successfully');
        }
    });
}

module.exports = db;
