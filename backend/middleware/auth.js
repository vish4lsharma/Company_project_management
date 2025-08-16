const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/jwt');

function authenticateToken(req, res, next) {
    console.log('🔐 Auth middleware called for:', req.method, req.path);
    
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        console.log('❌ No token provided');
        return res.status(401).json({ error: 'Access token required' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            console.log('❌ Token verification failed:', err.message);
            return res.status(403).json({ error: 'Invalid token' });
        }
        
        console.log('✅ Token verified for user:', user.email);
        req.user = user;
        next();
    });
}

module.exports = authenticateToken;
