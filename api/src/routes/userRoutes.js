const express = require('express');
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(auth);

// Get all users (admin only)
router.get('/', adminAuth, userController.getAllUsers);

// Get user by ID
router.get('/:id', userController.getUserById);

// Create new user (admin only)
router.post('/', adminAuth, userController.createUser);

// Update user
router.put('/:id', userController.updateUser);

// Delete user (admin only)
router.delete('/:id', adminAuth, userController.deleteUser);

// Get current user profile
router.get('/me/profile', userController.getCurrentUser);

// Update current user profile
router.put('/me/profile', userController.updateCurrentUser);

// Update user password
router.put('/me/password', userController.updatePassword);

// Update notification preferences
router.put('/me/notifications', userController.updateNotificationPreferences);

// Get users by role
router.get('/role/:role', adminAuth, userController.getUsersByRole);

// Get users by department
router.get('/department/:department', adminAuth, userController.getUsersByDepartment);

module.exports = router;
