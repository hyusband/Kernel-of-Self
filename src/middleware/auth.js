const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../services/userService');

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        // En Produccion hay que hacer que no se pueda acceder a la app sin token
        // Por ahora lo dejamos asi para poder probar
        return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Forbidden: Invalid token' });
        req.user = user;
        next();
    });
}

module.exports = { authenticateToken };
