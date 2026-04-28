const express = require('express');
const router = express.Router();
const bookingsController = require('../controllers/bookings.controller');
const { protect } = require('../middleware/auth.middleware');
const { requireAnyOf, requireGuest, requireAdmin } = require('../middleware/role.middleware');
const { ROLES } = require('../utils/constants');

router.use(protect);

// url -> middleware -> function 
router.get('/history', requireAnyOf(ROLES.GUEST, ROLES.HOST), bookingsController.getBookingHistory);
router.post('/', requireGuest, bookingsController.createBooking);
router.get('/:id', requireAnyOf(ROLES.GUEST, ROLES.HOST, ROLES.ADMIN), bookingsController.getBookingById);
router.patch('/:id/confirm', requireAnyOf(ROLES.HOST, ROLES.ADMIN), bookingsController.confirmBooking);
router.patch('/:id/complete', requireAnyOf(ROLES.HOST, ROLES.ADMIN), bookingsController.completeBooking);
router.patch('/:id/cancel', requireAnyOf(ROLES.GUEST, ROLES.ADMIN), bookingsController.cancelBooking);
router.delete('/purge-old', requireAdmin, bookingsController.purgeOldBookings);

module.exports = router;
