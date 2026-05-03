const { sql, poolPromise } = require('../config/db');

const createBooking = async (bookingData) => {
    const pool = await poolPromise;
    await pool.request()
        .input('guestId', sql.UniqueIdentifier, bookingData.guestId)
        .input('roomTypeId', sql.UniqueIdentifier, bookingData.roomTypeId)
        .input('checkIn', sql.Date, bookingData.checkIn)
        .input('checkOut', sql.Date, bookingData.checkOut)
        .input('numGuests', sql.Int, bookingData.numGuests)
        .input('numRooms', sql.Int, bookingData.numRooms)
        .execute('usp_CreateBooking');

    const result = await pool.request()
        .input('guestId', sql.UniqueIdentifier, bookingData.guestId)
        .query(`
            SELECT TOP 1 * 
            FROM Bookings 
            WHERE guest_id = @guestId 
            ORDER BY created_at DESC
        `);

    if (result.recordset && result.recordset.length > 0) {
        return result.recordset[0];
    }

    return null; 
};

const getBookingByGuest = async (bookingId, guestId) => {
    const pool = await poolPromise;
    const result = await pool.request()
        .input('bookingId', sql.UniqueIdentifier, bookingId)
        .input('guestId', sql.UniqueIdentifier, guestId)
        .execute('usp_GetBooking_Guest');

    return result.recordset[0] || null;
};

const getBookingByHost = async (bookingId, hostId) => {
    const pool = await poolPromise;
    const result = await pool.request()
        .input('bookingId', sql.UniqueIdentifier, bookingId)
        .input('hostId', sql.UniqueIdentifier, hostId)
        .execute('usp_GetBooking_Host');

    return result.recordset[0] || null;
};

const getBookingByAdmin = async (bookingId) => {
    const pool = await poolPromise;
    const result = await pool.request()
        .input('bookingId', sql.UniqueIdentifier, bookingId)
        .execute('usp_GetBooking_Admin');

    return result.recordset[0] || null;
};

const confirmBooking = async (bookingId) => {
    const pool = await poolPromise;
    await pool.request()
        .input('bookingId', sql.UniqueIdentifier, bookingId)
        .execute('usp_ConfirmBooking');
};

const completeBooking = async (bookingId) => {
    const pool = await poolPromise;
    await pool.request()
        .input('bookingId', sql.UniqueIdentifier, bookingId)
        .execute('usp_CompleteBooking');
};

const cancelBookingAsGuest = async (bookingId, guestId, cancellationReason) => {
    const pool = await poolPromise;
    await pool.request()
        .input('bookingId', sql.UniqueIdentifier, bookingId)
        .input('guestId', sql.UniqueIdentifier, guestId)
        .input('cancellationReason', sql.VarChar(sql.MAX), cancellationReason)
        .execute('usp_CancelBooking_Guest');
};

const cancelBookingAsAdmin = async (bookingId, cancellationReason) => {
    const pool = await poolPromise;
    await pool.request()
        .input('bookingId', sql.UniqueIdentifier, bookingId)
        .input('cancellationReason', sql.VarChar(sql.MAX), cancellationReason)
        .execute('usp_CancelBooking_Admin');
};

const getBookingHistoryByGuest = async (guestId, status = null) => {
    const pool = await poolPromise;
    const request = pool.request()
        .input('guestId', sql.UniqueIdentifier, guestId)
        .input('status', sql.VarChar(15), status);

    const result = await request.execute('usp_GetBookingHistory_Guest');
    return result.recordset;
};

const getBookingHistoryByHost = async (hostId, status = null) => {
    const pool = await poolPromise;
    const result = await pool.request()
        .input('hostId', sql.UniqueIdentifier, hostId)
        .input('status', sql.VarChar(15), status)
        .execute('usp_GetBookingHistory_Host');

    return result.recordset;
};

const getBookingHistoryByAdmin = async (status = null) => {
    const pool = await poolPromise;
    const result = await pool.request()
        .input('status', sql.VarChar(15), status)
        .execute('usp_GetBookingHistory_Admin');
    return result.recordset;
};

const purgeOldBookings = async () => {
    const pool = await poolPromise;
    await pool.request().execute('usp_PurgeOldBookings');
};

module.exports = {
    createBooking,
    getBookingByGuest,
    getBookingByHost,
    getBookingByAdmin,
    confirmBooking,
    completeBooking,
    cancelBookingAsGuest,
    cancelBookingAsAdmin,
    getBookingHistoryByGuest,
    getBookingHistoryByHost,
    getBookingHistoryByAdmin,
    purgeOldBookings
};
