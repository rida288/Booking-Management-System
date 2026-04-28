const express = require('express');
const router = express.Router();

const userController = require('../controllers/users.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/authorize');

router.get('/profile', protect, userController.getProfile);
router.put('/profile', protect, userController.updateProfile);
//for admin//
router.get(
    '/',
    protect,
    authorize('ADMIN'),
    userController.getAllUsers
);
router.patch(
    '/:id/role',
    protect,
    authorize('ADMIN'),
    userController.updateRole
);
router.patch(
    '/:id/status',
    protect,
    authorize('ADMIN'),
    userController.updateStatus
);
router.get(
    '/search',
    protect,
    authorize('ADMIN'),
    userController.searchUsers
);

module.exports = router;