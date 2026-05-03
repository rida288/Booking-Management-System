//    POST   /defects
//    GET    /defects/active
//     PATCH  /defects/:id/status

const express = require('express');
const router = express.Router();
const {ROLES} = require('../utils/constants');
const { protect } = require('../middleware/auth.middleware');
const { requireAnyOf } = require('../middleware/role.middleware');
const Controller = require('../controllers/defects.controller');


// Placeholder routes - implement your defect endpoints here
router.post('/', protect, requireAnyOf(ROLES.HOST, ROLES.ADMIN), Controller.reportDefect);
router.get('/active', protect, requireAnyOf(ROLES.HOST, ROLES.ADMIN), Controller.getActiveDefects);

router.patch('/:id/status', protect, requireAnyOf(ROLES.HOST, ROLES.ADMIN), Controller.updateDefectStatus);
router.get('/:defectId', protect, requireAnyOf(ROLES.HOST, ROLES.ADMIN), Controller.getRoomDefectById);
module.exports = router;
