require('dotenv').config();
const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: process.env.MYSQLHOST || 'localhost',
    user: process.env.MYSQLUSER || 'root',
    password: process.env.MYSQLPASSWORD || 'Root@123',
    database: process.env.MYSQLDATABASE || 'company_management',
    port: process.env.MYSQLPORT || 3306,
    ssl: process.env.NODE_ENV === 'production' ? {
        rejectUnauthorized: false
    } : false
});

connection.connect((err) => {
    if (err) {
        console.error('❌ Database connection failed:', err.message);
        console.error('Connection details:', {
            host: connection.config.host,
            user: connection.config.user,
            database: connection.config.database,
            port: connection.config.port
        });
        return;
    }
    console.log('✅ Connected to MySQL database');
});

module.exports = connection;
