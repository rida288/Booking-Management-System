const { sql, poolPromise } = require('../config/db');

// find user by email 
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

// create user 
const createUser = async (userData) => {
    const pool = await poolPromise;
    const result = await pool.request()
        .input('email',        sql.VarChar, userData.email)
        .input('passwordHash', sql.VarChar, userData.passwordHash)
        .input('fullName',     sql.VarChar, userData.fullName)
        .input('phone',        sql.VarChar, userData.phone)
        .input('role',         sql.VarChar, userData.role || 'GUEST')
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

module.exports = { findUserByEmail, createUser };