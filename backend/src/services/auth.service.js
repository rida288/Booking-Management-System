const bcrypt = require('bcrypt');
const { findUserByEmail, createUser } = require('../queries/auth.queries');
const { generateToken }               = require('../utils/jwt');
const { ROLES }                       = require('../utils/constants');

const SALT_ROUNDS = 10;

const register = async (userData) => {
    const existing = await findUserByEmail(userData.email);
    if (existing) {
        throw new Error('Email already registered');
    }

    if (userData.role && userData.role === ROLES.ADMIN) {
        throw new Error('Cannot self-register as ADMIN');
    }

    const passwordHash = await bcrypt.hash(userData.password, SALT_ROUNDS);

    const newUser = await createUser({
        email:        userData.email,
        passwordHash,
        fullName:     userData.fullName,
        phone:        userData.phone,
        role:         (userData.role || 'GUEST').toUpperCase()
    });

    const token = generateToken(newUser);

    return { user: newUser, token };
};

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

module.exports = { register, login };