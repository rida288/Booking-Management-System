//    POST   /hotels
//    GET    /hotels
//    GET    /hotels/:id
//    PUT    /hotels/:id
//     DELETE /hotels/:ids

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const { requireAnyOf} = require('../middleware/role.middleware');
const { ROLES } = require('../utils/constants');
// Placeholder routes - implement your hotel endpoints here

const Controller = require('../controllers/hotels.controller');

router.post('/', protect, requireAnyOf(ROLES.HOST, ROLES.ADMIN), Controller.createHotel);
router.get('/', Controller.searchHotel);
router.get('/:id', Controller.getHotelById);
router.put('/:id', protect, requireAnyOf(ROLES.HOST, ROLES.ADMIN), Controller.updateHotel);
router.delete('/:id', protect, requireAnyOf(ROLES.HOST, ROLES.ADMIN), Controller.deleteHotel);




module.exports = router;