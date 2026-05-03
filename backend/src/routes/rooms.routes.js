//    POST   /rooms
//    GET    /rooms/hotel/:hotelId
//    PUT    /rooms/:id
//     GET    /rooms/:id/availability

const express = require('express');
const router = express.Router();

// Placeholder routes - implement your room endpoints here

const roomController = require('../controllers/rooms.controller');
const { protect } = require('../middleware/auth.middleware');
const { requireAnyOf } = require('../middleware/role.middleware');
const { ROLES } = require('../utils/constants');


router.post('/', protect, requireAnyOf(ROLES.HOST, ROLES.ADMIN), roomController.createRoomType);
router.get('/hotel/:hotelId', roomController.getRoomsByHotel);
router.get('/:roomTypeId/availability', roomController.getRoomAvailability);
router.get('/:roomTypeId', roomController.getRoomTypeById);
router.put('/:id', protect, requireAnyOf(ROLES.HOST, ROLES.ADMIN), roomController.updateRoomType);


module.exports = router;
