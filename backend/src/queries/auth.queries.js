const { sql, poolPromise } = require('../config/db');

// 🔍 Find user by email
const findUserByEmail = async (email) => {
    const pool = await poolPromise;
    const result = await pool.request()
        .input('email', sql.VarChar, email)
        .query(`
            SELECT user_id, email, password_hash, 
                   full_name, phone_number, role, is_active
            FROM Users
            WHERE email = @email
        `);

    return result.recordset[0];
};

// ➕ Create new user
const createUser = async (userData) => {
    const pool = await poolPromise;
    const result = await pool.request()
        .input('email',        sql.VarChar, userData.email)
        .input('passwordHash', sql.VarChar, userData.passwordHash)
        .input('fullName',     sql.VarChar, userData.fullName)
        .input('phone',        sql.VarChar, userData.phone || null)
        .input('role',         sql.VarChar, userData.role)
        .query(`
            INSERT INTO Users 
                (email, password_hash, full_name, phone_number, role)
            OUTPUT INSERTED.user_id, INSERTED.email, 
                   INSERTED.full_name, INSERTED.role
            VALUES 
                (@email, @passwordHash, @fullName, @phone, @role)
        `);

    return result.recordset[0];
};

// 🚫 Add token to blacklist (logout)
const blacklistToken = async (token, expiresAt) => {
    const pool = await poolPromise;
    await pool.request()
        .input('token', sql.VarChar, token)
        .input('expiresAt', sql.DateTime2, expiresAt)
        .query(`
            INSERT INTO TokenBlacklist (token, expires_at)
            VALUES (@token, @expiresAt)
        `);
};

// 🔎 Check if token is blacklisted
const isTokenBlacklisted = async (token) => {
    const pool = await poolPromise;
    const result = await pool.request()
        .input('token', sql.VarChar, token)
        .query(`
            SELECT token FROM TokenBlacklist WHERE token = @token
        `);

    return result.recordset.length > 0;
};

module.exports = {
    findUserByEmail,
    createUser,
    blacklistToken,
    isTokenBlacklisted
};