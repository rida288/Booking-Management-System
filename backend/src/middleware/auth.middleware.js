// verify token 
const { verifyToken } = require('../utils/jwt');
const { sendError }   = require('../utils/response.helper');

const protect = (req, res, next) => {
    const authHeader = req.headers.authorization;

    // check header and format 
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return sendError(res, 'No token provided', 401);
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    if (!decoded) {
        return sendError(res, 'Invalid or expired token', 401);
    }

    req.user = decoded; // { userId, email, role } - store the payload so middleware knows who the user is
    next(); // user cleared move on to the next function 
};

module.exports = { protect };