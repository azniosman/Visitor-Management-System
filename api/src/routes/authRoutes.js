const express = require('express');
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');

const router = express.Router();

// Login
router.post('/login', authController.login);

// Logout (requires authentication)
router.post('/logout', auth, authController.logout);

// Logout from all devices (requires authentication)
router.post('/logout-all', auth, authController.logoutAll);

// Register (this might be admin-only in a production environment)
router.post('/register', authController.register);

// Request password reset
router.post('/forgot-password', authController.forgotPassword);

// Reset password with token
router.post('/reset-password', authController.resetPassword);

// Verify email with token
router.get('/verify-email/:token', authController.verifyEmail);

// Refresh token
router.post('/refresh-token', authController.refreshToken);

module.exports = router;
