// login, register, logout 
const authService                    = require('../services/auth.service');
const { sendSuccess, sendError }     = require('../utils/response.helper');

const register = async (req, res) => {
    console.log("DEBUG 1: req.body is:", req.body); 
    try {
        const {
            email,
            password,
            fullName,
            full_name,
            phone,
            phone_number,
            role
        } = req.body;

        const normalizedFullName = fullName || full_name;
        const normalizedPhone = phone || phone_number;

        if (!email || !password || !normalizedFullName) {
            return sendError(res, 'Email, password and full name are required', 400);
        }

        const result = await authService.register({ 
            email,
            password,
            fullName: normalizedFullName,
            phone: normalizedPhone,
            role 
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
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return sendError(res, 'No token provided', 400);
        }

        const token = authHeader.split(' ')[1];

        const result = await authService.logout(token);

        return sendSuccess(res, result, 200);

    } catch (err) {
        return sendError(res, err.message, 400);
    }
};

module.exports = { register, login, logout };