const { isValidDateRange } = require('../utils/date.helper');
const bookingQueries = require('../queries/bookings.queries');
const { ROLES } = require('../utils/constants');

const createBooking = async ({ userId, roomTypeId, checkIn, checkOut, numGuests, numRooms }) => {
    if (!roomTypeId || !checkIn || !checkOut || !numGuests) {
        throw new Error('roomTypeId, checkIn, checkOut and numGuests are required');
    }
    if (!isValidDateRange(checkIn, checkOut)) {
        throw new Error('Invalid date range. Check-in must be today or later and check-out must be after check-in');
    }

    const booking = await bookingQueries.createBooking({
        guestId: userId,
        roomTypeId,
        checkIn,
        checkOut,
        numGuests: Number(numGuests),
        numRooms: Number(numRooms || 1)
    });

    return booking || { message: 'Booking created. No booking details were returned by the procedure.' };
};

const getBookingById = async ({ bookingId, user }) => {
    let booking = null;

    if (user.role === ROLES.GUEST) {
        booking = await bookingQueries.getBookingByGuest(bookingId, user.userId);
    } else if (user.role === ROLES.HOST) {
        booking = await bookingQueries.getBookingByHost(bookingId, user.userId);
    } else if (user.role === ROLES.ADMIN) {
        booking = await bookingQueries.getBookingByAdmin(bookingId);
    }

    if (!booking) {
        throw new Error('Booking not found or access denied');
    }

    return booking;
};

const confirmBooking = async (bookingId) => {
    await bookingQueries.confirmBooking(bookingId);
    return { message: 'Booking confirmed successfully' };
};

const completeBooking = async (bookingId) => {
    await bookingQueries.completeBooking(bookingId);
    return { message: 'Booking completed successfully' };
};

const cancelBooking = async ({ bookingId, user, cancellationReason }) => {
    if (!cancellationReason) {
        throw new Error('Cancellation reason is required');
    }

    if (user.role === ROLES.GUEST) {
        await bookingQueries.cancelBookingAsGuest(bookingId, user.userId, cancellationReason);
    } else if (user.role === ROLES.ADMIN) {
        await bookingQueries.cancelBookingAsAdmin(bookingId, cancellationReason);
    } else if (user.role === ROLES.HOST) {
        await bookingQueries.cancelBookingAsAdmin(bookingId, cancellationReason);
    } else {
        throw new Error('Only guests and admins can cancel bookings');
    }

    return { message: 'Booking cancelled successfully' };
};

const getBookingHistory = async ({ user, status }) => {
    if (user.role === ROLES.GUEST) {
        return bookingQueries.getBookingHistoryByGuest(user.userId, status || null);
    }

    if (user.role === ROLES.HOST) {
        return bookingQueries.getBookingHistoryByHost(user.userId, status || null);
    }

    throw new Error('Booking history is only available for guests and hosts');
};

const purgeOldBookings = async () => {
    await bookingQueries.purgeOldBookings();
    return { message: 'Old bookings purged successfully' };
};

module.exports = {
    createBooking,
    getBookingById,
    confirmBooking,
    completeBooking,
    cancelBooking,
    getBookingHistory,
    purgeOldBookings
};
