const { sql, poolPromise } = require('../config/db');

// submitReview: only booking_id needed — SP derives guest_id/hotel_id internally
const submitReview = async ({ bookingId, guestId, overallRating, title, body }) => {
    const pool = await poolPromise;
    await pool.request()
        .input('bookingId',     sql.UniqueIdentifier, bookingId)
        .input('guestId',       sql.UniqueIdentifier, guestId)      // passed for ownership check in SP
        .input('overallRating', sql.Decimal(2, 1),    overallRating)
        .input('title',         sql.VarChar(255),     title ?? null)
        .input('body',          sql.VarChar(sql.MAX), body  ?? null)
        .execute('usp_SubmitReview');
};

const getReviewById = async (reviewId) => {
    const pool = await poolPromise;
    const result = await pool.request()
        .input('reviewId', sql.UniqueIdentifier, reviewId)
        .execute('usp_GetReview');

    return result.recordset[0] || null;
};

const getHotelReviews = async (hotelId, pageSize, pageNumber) => {
    const pool = await poolPromise;
    const result = await pool.request()
        .input('hotelId',    sql.UniqueIdentifier, hotelId)
        .input('pageSize',   sql.Int,              pageSize)
        .input('pageNumber', sql.Int,              pageNumber)
        .execute('usp_GetHotelReviews');

    return result.recordset;
};

// SP joins Reviews → Bookings → Users to filter by guest
const getGuestReviews = async (guestId) => {
    const pool = await poolPromise;
    const result = await pool.request()
        .input('guestId', sql.UniqueIdentifier, guestId)
        .execute('usp_GetReviewHistory_Guest');

    return result.recordset;
};

// SP joins Reviews → Bookings → Room_Types → Hotels to filter by host
const getHostReviews = async (hostId, hotelId = null) => {
    const pool = await poolPromise;
    const result = await pool.request()
        .input('hostId',  sql.UniqueIdentifier, hostId)
        .input('hotelId', sql.UniqueIdentifier, hotelId)
        .execute('usp_GetReviewHistory_Host');

    return result.recordset;
};

const getAllReviewsAdmin = async ({ hotelId, guestId, minRating, maxRating }) => {
    const pool = await poolPromise;
    const result = await pool.request()
        .input('hotelId',   sql.UniqueIdentifier, hotelId   ?? null)
        .input('guestId',   sql.UniqueIdentifier, guestId   ?? null)
        .input('minRating', sql.Decimal(2, 1),    minRating ?? null)
        .input('maxRating', sql.Decimal(2, 1),    maxRating ?? null)
        .execute('usp_GetReviewHistory_Admin');

    return result.recordset;
};

// SP joins Reviews → Bookings → Room_Types → Hotels to filter by host
const getUnrespondedReviews = async (hostId = null) => {
    const pool = await poolPromise;
    const result = await pool.request()
        .input('hostId', sql.UniqueIdentifier, hostId)
        .execute('usp_GetUnrespondedReviews');

    return result.recordset;
};

// SP joins Reviews → Bookings → Room_Types → Hotels for rating aggregation
const getTopRatedHotels = async (minReviews, limit) => {
    const pool = await poolPromise;
    const result = await pool.request()
        .input('minReviews', sql.Int, minReviews)
        .input('limit',      sql.Int, limit)
        .execute('usp_GetTopRatedHotels');

    return result.recordset;
};

// SP verifies guestId matches booking before updating
const editReview = async (reviewId, guestId, { overallRating, title, body }) => {
    const pool = await poolPromise;
    await pool.request()
        .input('reviewId',      sql.UniqueIdentifier, reviewId)
        .input('guestId',       sql.UniqueIdentifier, guestId)
        .input('overallRating', sql.Decimal(2, 1),    overallRating ?? null)
        .input('title',         sql.VarChar(255),     title         ?? null)
        .input('body',          sql.VarChar(sql.MAX), body          ?? null)
        .execute('usp_EditReview');
};

// SP verifies hostId owns the hotel linked via booking before responding
const respondToReview = async (reviewId, hostId, hostResponse) => {
    const pool = await poolPromise;
    await pool.request()
        .input('reviewId',     sql.UniqueIdentifier, reviewId)
        .input('hostId',       sql.UniqueIdentifier, hostId)
        .input('hostResponse', sql.VarChar(sql.MAX), hostResponse)
        .execute('usp_RespondToReview');
};

// isAdmin flag lets SP skip ownership check
const deleteReview = async (reviewId, requesterId, isAdmin) => {
    const pool = await poolPromise;
    await pool.request()
        .input('reviewId',    sql.UniqueIdentifier, reviewId)
        .input('requesterId', sql.UniqueIdentifier, requesterId)
        .input('isAdmin',     sql.Bit,              isAdmin ? 1 : 0)
        .execute('usp_DeleteReview');
};

module.exports = {
    submitReview,
    getReviewById,
    getHotelReviews,
    getGuestReviews,
    getHostReviews,
    getAllReviewsAdmin,
    getUnrespondedReviews,
    getTopRatedHotels,
    editReview,
    respondToReview,
    deleteReview,
};
