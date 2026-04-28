const bookingService = require('../services/bookings.service');
const { sendSuccess, sendError } = require('../utils/response.helper');

const createBooking = async (req, res) => {
    try {
        const result = await bookingService.createBooking({
            userId: req.user.userId,
            ...req.body
        });

        return sendSuccess(res, result, 201);
    } catch (err) {
        return sendError(res, err.message, 400);
    }
};

const getBookingById = async (req, res) => {
    try {
        const result = await bookingService.getBookingById({
            bookingId: req.params.id,
            user: req.user
        });

        return sendSuccess(res, result);
    } catch (err) {
        return sendError(res, err.message, 404);
    }
};

const confirmBooking = async (req, res) => {
    try {
        const result = await bookingService.confirmBooking(req.params.id);
        return sendSuccess(res, result);
    } catch (err) {
        return sendError(res, err.message, 400);
    }
};

const completeBooking = async (req, res) => {
    try {
        const result = await bookingService.completeBooking(req.params.id);
        return sendSuccess(res, result);
    } catch (err) {
        return sendError(res, err.message, 400);
    }
};

const cancelBooking = async (req, res) => {
    try {
        const result = await bookingService.cancelBooking({
            bookingId: req.params.id,
            user: req.user,
            cancellationReason: req.body.cancellationReason
        });

        return sendSuccess(res, result);
    } catch (err) {
        return sendError(res, err.message, 400);
    }
};

const getBookingHistory = async (req, res) => {
    try {
        const result = await bookingService.getBookingHistory({
            user: req.user,
            status: req.query.status
        });

        return sendSuccess(res, result);
    } catch (err) {
        return sendError(res, err.message, 400);
    }
};

const purgeOldBookings = async (req, res) => {
    try {
        const result = await bookingService.purgeOldBookings();
        return sendSuccess(res, result);
    } catch (err) {
        return sendError(res, err.message, 400);
    }
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
