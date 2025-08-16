require('dotenv').config();
const crypto = require('crypto');

// Generate a secure JWT secret automatically
function generateJWTSecret() {
    return crypto.randomBytes(64).toString('hex');
}

// Use environment variable or generate new secret
const JWT_SECRET = process.env.JWT_SECRET || generateJWTSecret();

// Log the secret for development (remove in production)
if (!process.env.JWT_SECRET) {
    console.log('🔑 Generated JWT Secret:', JWT_SECRET);
    console.log('💡 Add JWT_SECRET to your .env file to persist this secret');
    console.log('💡 Example: JWT_SECRET=' + JWT_SECRET);
} else {
    console.log('✅ Using JWT secret from environment variables');
}

module.exports = {
    JWT_SECRET,
    generateJWTSecret
};
