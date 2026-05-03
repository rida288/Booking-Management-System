// get 

// post

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const { requireAnyOf } = require('../middleware/role.middleware');
const { ROLES } = require('../utils/constants');
const controller = require('../controllers/amenity.controller');

// Placeholder routes - implement your amenity endpoints here
router.get('/', controller.getAllAmenities);
router.post('/', protect, requireAnyOf(ROLES.ADMIN), controller.createAmenity);

// Hotel amenities
router.get('/hotel/:hotelId', controller.getHotelAmenities);
router.post('/hotel/:hotelId', protect, requireAnyOf(ROLES.HOST, ROLES.ADMIN), controller.addHotelAmenity);
router.delete('/hotel/:hotelId/:amenityId', protect, requireAnyOf(ROLES.HOST, ROLES.ADMIN), controller.removeHotelAmenity);

// Room type amenities
router.get('/room/:roomTypeId', controller.getRoomTypeAmenities);
router.post('/room/:roomTypeId', protect, requireAnyOf(ROLES.HOST, ROLES.ADMIN), controller.addRoomTypeAmenity);
router.delete('/room/:roomTypeId/:amenityId', protect, requireAnyOf(ROLES.HOST, ROLES.ADMIN), controller.removeRoomTypeAmenity);



module.exports = router;