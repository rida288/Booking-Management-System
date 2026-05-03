const { verifyToken } = require('../utils/jwt');
const { isTokenBlacklisted } = require('../queries/auth.queries');
const { sendError } = require('../utils/response.helper');

const protect = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return sendError(res, 'No token provided', 401);
        }

        const token = authHeader.split(' ')[1];

        if (await isTokenBlacklisted(token)) {
            return sendError(res, 'Token is invalid (logged out)', 401);
        }

        const decoded = verifyToken(token);

        if (!decoded) {
            return sendError(res, 'Invalid or expired token', 401);
        }

        req.user = decoded;
        next();
    } catch (error) {
        return sendError(res, error.message, 401);
    }
};

module.exports = { protect };
