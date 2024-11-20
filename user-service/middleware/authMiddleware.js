const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
    const token = req.header('Authorization');

    if (!token) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    try {
        const decoded = jwt.verify(token, 'jwtSecret');
        req.user = decoded.id;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Token is not valid' });
    }
}

module.exports = authMiddleware;
