const { sql, poolPromise } = require('../config/db');

const getAdminDashboard = async () => {
    const pool = await poolPromise;
    const result = await pool.request().execute('usp_GetAdminDashboard');
    return {
        totalRevenue:      result.recordsets[0][0],
        revenueThisMonth:  result.recordsets[1][0],
        bookingsByStatus:  result.recordsets[2],
        revenueByMonth:    result.recordsets[3],
        topHotels:         result.recordsets[4],
        paymentStats:      result.recordsets[5][0]
    };
};

const getHostDashboard = async (hostId) => {
    const pool = await poolPromise;
    const result = await pool.request()
        .input('hostId', sql.UniqueIdentifier, hostId)
        .execute('usp_GetHostDashboard');
    return {
        totalRevenue:        result.recordsets[0][0],
        revenueThisMonth:    result.recordsets[1][0],
        bookingsByStatus:    result.recordsets[2],
        occupancyByRoomType: result.recordsets[3],
        pendingBookings:     result.recordsets[4][0],
        unrespondedReviews:  result.recordsets[5][0],
        revenueByMonth:      result.recordsets[6]
    };
};

module.exports = { getAdminDashboard, getHostDashboard };