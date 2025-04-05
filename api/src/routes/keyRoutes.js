const express = require('express');
const keyController = require('../controllers/keyController');
const auth = require('../middleware/auth');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(auth);

// Get all keys
router.get('/', keyController.getAllKeys);

// Get key by ID
router.get('/:id', keyController.getKeyById);

// Create new key
router.post('/', keyController.createKey);

// Update key
router.put('/:id', keyController.updateKey);

// Delete key
router.delete('/:id', keyController.deleteKey);

// Checkout key
router.post('/:id/checkout', keyController.checkoutKey);

// Return key
router.post('/:id/return', keyController.returnKey);

// Get keys by status
router.get('/status/:status', keyController.getKeysByStatus);

// Get keys by assigned user
router.get('/assigned/:userId', keyController.getKeysByAssignedUser);

// Get keys by access level
router.get('/access-level/:level', keyController.getKeysByAccessLevel);

module.exports = router;
