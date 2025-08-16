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
            console.error('Using DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Missing');
            return;
        }
        console.log('✅ Connected to PostgreSQL database');
        release();
    });
    
    module.exports = pool;
} else if (process.env.PGHOST) {
    // PostgreSQL using individual environment variables
    const { Pool } = require('pg');
    
    const pool = new Pool({
        host: process.env.PGHOST,
        user: process.env.PGUSER,
        password: process.env.PGPASSWORD,
        database: process.env.PGDATABASE,
        port: process.env.PGPORT || 5432,
        ssl: { rejectUnauthorized: false }
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
