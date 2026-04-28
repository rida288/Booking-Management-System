// login, register, logout 
const authService                    = require('../services/auth.service');
const { sendSuccess, sendError }     = require('../utils/response.helper');

const register = async (req, res) => {
    console.log("DEBUG 1: req.body is:", req.body); 
    try {
        const { email, password, fullName, phone, role } = req.body;

        if (!email || !password || !fullName) {
            return sendError(res, 'Email, password and full name are required', 400);
        }

        const result = await authService.register({ 
            email, password, fullName, phone, role 
        });

        return sendSuccess(res, result, 201);

    } catch (err) {
        return sendError(res, err.message, 400);
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return sendError(res, 'Email and password are required', 400);
        }

        const result = await authService.login(email, password);

        return sendSuccess(res, result, 200);

    } catch (err) {
        return sendError(res, err.message, 401);
    }
};

const logout = async (req, res) => {
    try {
        return sendSuccess(res, { message: 'Logged out successfully' }, 200);
    }
    catch (err) {
        return sendError(res, err.message, 400);
    }
};

module.exports = { register, login, logout };