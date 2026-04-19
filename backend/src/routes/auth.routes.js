//     POST   /auth/register
//    POST   /auth/login
//    POST   /auth/logout
const express    = require('express');
const router     = express.Router();
const authController = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');

router.post('/register', authController.register);
router.post('/login',    authController.login);
router.post('/logout', protect, authController.logout); // user must be logged in to logout

module.exports = router;