const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Đường dẫn: POST /api/auth/login
router.post('/login', authController.login);
// Thêm vào routes/authRoutes.js
router.post('/register', authController.register);
router.get('/confirm-registration', authController.confirmRegistration);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
module.exports = router;