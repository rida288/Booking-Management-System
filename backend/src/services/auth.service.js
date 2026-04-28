const bcrypt = require('bcrypt');

const { generateToken }               = require('../utils/jwt');
const { ROLES }                       = require('../utils/constants');

const jwt = require('jsonwebtoken');

const {
    findUserByEmail,
    createUser,
    blacklistToken
} = require('../queries/auth.queries');




const SALT_ROUNDS = 10;

// 📝 REGISTER
const register = async (userData) => {

    const existing = await findUserByEmail(userData.email);
    if (existing) {
        throw new Error('Email already registered');
    }

    // ❌ Prevent admin self registration
    if (userData.role && userData.role.toUpperCase() === ROLES.ADMIN) {
        throw new Error('Cannot self-register as ADMIN');
    }

    const passwordHash = await bcrypt.hash(userData.password, SALT_ROUNDS);

    const role = ROLES[userData.role?.toUpperCase()] || ROLES.GUEST;

    const newUser = await createUser({
        email: userData.email,
        passwordHash,
        fullName: userData.fullName,
        phone: userData.phone,
        role
    });

    const token = generateToken(newUser);

    return {
        user: newUser,
        token
    };
};

// 🔐 LOGIN
const login = async (email, password) => {

    const user = await findUserByEmail(email);

    if (!user) {
        throw new Error('Invalid email or password');
    }

    if (!user.is_active) {
        throw new Error('Account is deactivated');
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
        throw new Error('Invalid email or password');
    }

    const token = generateToken(user);

    return {
        user: {
            userId:   user.user_id,
            email:    user.email,
            fullName: user.full_name,
            role:     user.role
        },
        token
    };
};

// 🚪 LOGOUT
const logout = async (token) => {
    if (!token) {
        throw new Error('Token required');
    }

    // decode token to get expiry
    const decoded = jwt.decode(token);

    if (!decoded || !decoded.exp) {
        throw new Error('Invalid token');
    }

    const expiresAt = new Date(decoded.exp * 1000);

    await blacklistToken(token, expiresAt);

    return { message: 'Logged out successfully' };
};

module.exports = {
    register,
    login,
    logout
};