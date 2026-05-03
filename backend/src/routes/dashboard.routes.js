const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');
const { protect } = require('../middleware/auth.middleware');
const { requireAdmin, requireAnyOf } = require('../middleware/role.middleware');
const { ROLES } = require('../utils/constants');

router.use(protect);

router.get('/admin', requireAdmin, dashboardController.getAdminDashboard);
router.get('/host', requireAnyOf(ROLES.HOST), dashboardController.getHostDashboard);

module.exports = router;