const paymentService = require('../services/payment.service');
const { sendSuccess, sendError } = require('../utils/response.helper');

const processPayment = async (req, res) => {
    try {
        const result = await paymentService.processPayment({
            guestId: req.user.userId,
            ...req.body
        });

        return sendSuccess(res, result, 201);
    } catch (err) {
        return sendError(res, err.message, 400);
    }
};

const updatePaymentStatus = async (req, res) => {
    try {
        const result = await paymentService.updatePaymentStatus({
            paymentId: req.params.paymentId,
            status: req.body.status
        });

        return sendSuccess(res, result);
    } catch (err) {
        return sendError(res, err.message, 400);
    }
};

const getPaymentStatus = async (req, res) => {
    try {
        const result = await paymentService.getPaymentStatus({
            bookingId: req.params.bookingId,
            guestId: req.user.userId
        });

        return sendSuccess(res, result);
    } catch (err) {
        return sendError(res, err.message, 400);
    }
};

const getPaymentHistory = async (req, res) => {
    try {
        const result = await paymentService.getPaymentHistory({ user: req.user });
        return sendSuccess(res, result);
    } catch (err) {
        return sendError(res, err.message, 400);
    }
};

const getFailedPayments = async (req, res) => {
    try {
        const result = await paymentService.getFailedPayments();
        return sendSuccess(res, result);
    } catch (err) {
        return sendError(res, err.message, 400);
    }
};

const getAuditTrail = async (req, res) => {
    try {
        const result = await paymentService.getAuditTrail({
            bookingId: req.params.bookingId
        });
 
        return sendSuccess(res, result);
    } catch (err) {
        return sendError(res, err.message, 400);
    }
};

module.exports = {
    processPayment,
    updatePaymentStatus,
    getPaymentStatus,
    getPaymentHistory,
    getFailedPayments, 
    getAuditTrail
};
