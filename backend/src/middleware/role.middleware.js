// role based access control 

const { ROLES }     = require('../utils/constants');
const { sendError } = require('../utils/response.helper');

// require user 
const requireGuest = (req, res, next) => {
    if (req.user.role !== ROLES.GUEST) {
        return sendError(res, 'Access denied. Guests only.', 403);
    }
    next();
};

// require host
const requireHost = (req, res, next) => {
    if (req.user.role !== ROLES.HOST) {
        return sendError(res, 'Access denied. Hosts only.', 403);
    }
    next();
};

// require admin
const requireAdmin = (req, res, next) => {
    if (req.user.role !== ROLES.ADMIN) {
        return sendError(res, 'Access denied. Admins only.', 403);
    }
    next();
};

// allows multiple roles on one route
const requireAnyOf = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return sendError(res, 'Access denied.', 403);
        }
        next();
    };
};

module.exports = { requireGuest, requireHost, requireAdmin, requireAnyOf };