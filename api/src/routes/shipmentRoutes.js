const express = require('express');
const shipmentController = require('../controllers/shipmentController');
const auth = require('../middleware/auth');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(auth);

// Get all shipments
router.get('/', shipmentController.getAllShipments);

// Get shipment by ID
router.get('/:id', shipmentController.getShipmentById);

// Create new shipment
router.post('/', shipmentController.createShipment);

// Update shipment
router.put('/:id', shipmentController.updateShipment);

// Delete shipment
router.delete('/:id', shipmentController.deleteShipment);

// Mark shipment as in-transit
router.post('/:id/in-transit', shipmentController.markInTransit);

// Mark shipment as delivered
router.post('/:id/delivered', shipmentController.markDelivered);

// Get shipments by recipient
router.get('/recipient/:recipientId', shipmentController.getShipmentsByRecipient);

// Get shipments by status
router.get('/status/:status', shipmentController.getShipmentsByStatus);

module.exports = router;
