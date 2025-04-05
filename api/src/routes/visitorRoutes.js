const express = require('express');
const multer = require('multer');
const visitorController = require('../controllers/visitorController');

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Get all visitors
router.get('/', visitorController.getAllVisitors);

// Get visitor by ID
router.get('/:id', visitorController.getVisitorById);

// Create new visitor
router.post('/', visitorController.createVisitor);

// Update visitor
router.put('/:id', visitorController.updateVisitor);

// Delete visitor
router.delete('/:id', visitorController.deleteVisitor);

// Check in visitor
router.post('/:id/check-in', visitorController.checkInVisitor);

// Check out visitor
router.post('/:id/check-out', visitorController.checkOutVisitor);

// Analyze visitor photo
router.post('/analyze-photo', upload.single('photo'), visitorController.analyzeVisitorPhoto);

// Check visitor against watchlist
router.post('/check-watchlist', upload.single('photo'), visitorController.checkWatchlist);

module.exports = router;
