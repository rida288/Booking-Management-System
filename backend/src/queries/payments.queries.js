const { sql, poolPromise } = require('../config/db');

const processPayment = async ({ bookingId, guestId, amount, paymentMethod, gateway = null }) => {
    const pool = await poolPromise;
    await pool.request()
        .input('bookingId', sql.UniqueIdentifier, bookingId)
        .input('guestId', sql.UniqueIdentifier, guestId)
        .input('amount', sql.Decimal(12, 2), amount)
        .input('paymentMethod', sql.NVarChar(20), paymentMethod)
        .input('gateway', sql.NVarChar(50), gateway)
        .execute('usp_ProcessPayment');
};

const updatePaymentStatus = async ({ paymentId, status }) => {
    const pool = await poolPromise;
    await pool.request()
        .input('paymentId', sql.UniqueIdentifier, paymentId)
        .input('status', sql.NVarChar(25), status)
        .execute('usp_UpdatePaymentStatus');
};

const getPaymentStatusForGuest = async ({ bookingId, guestId }) => {
    const pool = await poolPromise;
    const result = await pool.request()
        .input('bookingId', sql.UniqueIdentifier, bookingId)
        .input('guestId', sql.UniqueIdentifier, guestId)
        .execute('usp_GetPaymentStatus_Guest');

    return result.recordset;
};

const getPaymentHistoryForGuest = async ({ guestId }) => {
    const pool = await poolPromise; 
    const result = await pool.request()
        .input('guestId', sql.UniqueIdentifier, guestId)
        .execute('usp_GetPaymentHistory_Guest');

    return result.recordset;
};

const getPaymentHistoryForHost = async ({ hostId }) => {
    const pool = await poolPromise;
    const result = await pool.request()
        .input('hostId', sql.UniqueIdentifier, hostId)
        .execute('usp_GetPaymentHistory_Host');

    return result.recordset;
};

const getPaymentHistoryForAdmin = async () => {
    const pool = await poolPromise;
    const result = await pool.request()
        .execute('usp_GetPaymentHistory_Admin');

    return result.recordset;
};

const getFailedPaymentsForAdmin = async () => {
    const pool = await poolPromise;
    const result = await pool.request()
        .execute('usp_GetFailedPayments_Admin');

    return result.recordset;
};

const getAuditTrail = async ({ bookingId }) => {
    const pool = await poolPromise;
    const result = await pool.request()
        .input('bookingId', sql.UniqueIdentifier, bookingId)
        .execute('usp_GetAuditTrail');
 
    return result.recordset;
};

module.exports = {
    processPayment,
    updatePaymentStatus,
    getPaymentStatusForGuest,
    getPaymentHistoryForGuest,
    getPaymentHistoryForHost,
    getPaymentHistoryForAdmin,
    getFailedPaymentsForAdmin, 
    getAuditTrail
};

