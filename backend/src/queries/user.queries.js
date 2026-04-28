const { sql, poolPromise } = require('../config/db');

const getUserById = async (userId) => {
    const pool = await poolPromise;

    const result = await pool.request()
        .input('userId', sql.UniqueIdentifier, userId)
        .query(`
            SELECT user_id, email, full_name, phone_number, role, is_active, created_at
            FROM Users
            WHERE user_id = @userId
        `);

    return result.recordset[0];
};

const updateProfile = async (userId, data) => {
    const pool = await poolPromise;

    const result = await pool.request()
        .input('userId', sql.UniqueIdentifier, userId)
        .input('fullName', sql.VarChar, data.fullName)
        .input('phone', sql.VarChar, data.phone)
        .query(`
            UPDATE Users
            SET full_name = @fullName,
                phone_number = @phone
            OUTPUT INSERTED.user_id, INSERTED.email, INSERTED.full_name, INSERTED.phone_number, INSERTED.role
            WHERE user_id = @userId
        `);

    return result.recordset[0];
};

const changeUserRole = async (userId, role) => {
    const pool = await poolPromise;

    const result = await pool.request()
        .input('userId', sql.UniqueIdentifier, userId)
        .input('role', sql.VarChar, role)
        .query(`
            UPDATE Users
            SET role = @role
            OUTPUT INSERTED.user_id, INSERTED.email, INSERTED.role
            WHERE user_id = @userId
        `);

    return result.recordset[0];
};

const changeUserStatus = async (userId, isActive) => {
    const pool = await poolPromise;

    const result = await pool.request()
        .input('userId', sql.UniqueIdentifier, userId)
        .input('isActive', sql.Bit, isActive)
        .query(`
            UPDATE Users
            SET is_active = @isActive
            OUTPUT INSERTED.user_id, INSERTED.email, INSERTED.is_active
            WHERE user_id = @userId
        `);

    return result.recordset[0];
};

const getAllUsers = async () => {
    const pool = await poolPromise;

    const result = await pool.request()
        .query(`
            SELECT user_id, email, full_name, phone_number, role, is_active, created_at
            FROM Users
            ORDER BY created_at DESC
        `);

    return result.recordset;
};

const searchUsers = async (keyword) => {
    const pool = await poolPromise;

    const result = await pool.request()
        .input('keyword', sql.VarChar, `%${keyword}%`)
        .query(`
            SELECT user_id, email, full_name, phone_number, role, is_active
            FROM Users
            WHERE full_name LIKE @keyword
               OR email LIKE @keyword
            ORDER BY created_at DESC
        `);

    return result.recordset;
};


module.exports = {
    getUserById,
    updateProfile,
    changeUserRole,
    changeUserStatus,
    getAllUsers,
    searchUsers
};
