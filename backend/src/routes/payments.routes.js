const express = require('express');
const router = express.Router();
const paymentsController = require('../controllers/payments.controller');
const { protect } = require('../middleware/auth.middleware');
const { requireAnyOf, requireAdmin, requireGuest } = require('../middleware/role.middleware');
const { ROLES } = require('../utils/constants');

router.use(protect);

// all static paths before parameterized ones 
router.post('/', requireGuest, paymentsController.processPayment);
router.get('/history', requireAnyOf(ROLES.GUEST, ROLES.HOST, ROLES.ADMIN), paymentsController.getPaymentHistory);
router.get('/failed', requireAdmin, paymentsController.getFailedPayments);
router.get('/audit/:bookingId',requireAdmin,paymentsController.getAuditTrail);
router.get('/:bookingId', requireGuest, paymentsController.getPaymentStatus);
router.patch('/:paymentId/status', requireAdmin, paymentsController.updatePaymentStatus);

module.exports = router;
