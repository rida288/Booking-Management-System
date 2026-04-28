const paymentQueries = require('../queries/payments.queries');
const { ROLES } = require('../utils/constants');

const processPayment = async ({ bookingId, guestId, amount, paymentMethod, gateway }) => {
    if (!bookingId || !amount || !paymentMethod) {
        throw new Error('bookingId, amount and paymentMethod are required');
    }

    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
        throw new Error('amount must be a positive number');
    }
 
    await paymentQueries.processPayment({
        bookingId,
        guestId,
        amount: numericAmount,
        paymentMethod,
        gateway: gateway || null
    });

    return { message: 'Payment processed successfully' };
};

const updatePaymentStatus = async ({ paymentId, status }) => {
    if (!paymentId || !status) {
        throw new Error('paymentId and status are required');
    }

    await paymentQueries.updatePaymentStatus({ paymentId, status });
    return { message: 'Payment status updated successfully' };
};

const getPaymentStatus = async ({ bookingId, guestId }) => {
    return paymentQueries.getPaymentStatusForGuest({ bookingId, guestId });
};

const getPaymentHistory = async ({ user }) => {
    if (user.role === ROLES.GUEST) {
        return paymentQueries.getPaymentHistoryForGuest({ guestId: user.userId });
    }

    if (user.role === ROLES.HOST) {
        return paymentQueries.getPaymentHistoryForHost({ hostId: user.userId });
    }

    if (user.role === ROLES.ADMIN) {
        return paymentQueries.getPaymentHistoryForAdmin();
    }

    throw new Error('Unsupported role');
};

const getFailedPayments = async () => {
    return paymentQueries.getFailedPaymentsForAdmin();
};

const getAuditTrail = async ({ bookingId }) => {
    if (!bookingId) {
        throw new Error('bookingId is required');
    }
 
    return paymentQueries.getAuditTrail({ bookingId });
};

module.exports = {
    processPayment,
    updatePaymentStatus,
    getPaymentStatus,
    getPaymentHistory,
    getFailedPayments, 
    getAuditTrail
};


