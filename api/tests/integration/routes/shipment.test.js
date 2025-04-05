const request = require('supertest');
const express = require('express');
const shipmentRoutes = require('../../../src/routes/shipmentRoutes');
const Shipment = require('../../../src/models/Shipment');
const { createTestUser, generateRandomId } = require('../../helpers');

// Mock middleware
jest.mock('../../../src/middleware/auth', () => {
  return jest.fn((req, res, next) => {
    if (!req.header('Authorization')) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    // Use a fixed ID or get it from the header
    const mockId = req.header('user-id') || '5f7d8f3d9d3e2a1a9c8b4567';
    req.user = req.user || { _id: mockId };
    next();
  });
});

// Create a test app
const app = express();
app.use(express.json());
app.use('/api/shipments', shipmentRoutes);

describe('Shipment Routes', () => {
  let token;
  let userId;
  
  beforeEach(async () => {
    // Create a test user and get token
    const testUser = await createTestUser();
    token = testUser.token;
    userId = testUser.user._id.toString();
  });
  
  describe('GET /api/shipments', () => {
    it('should get all shipments', async () => {
      // Create some test shipments
      await Shipment.create([
        {
          trackingNumber: 'TRK123456789',
          carrier: 'FedEx',
          sender: 'ABC Corp',
          recipient: userId,
          type: 'Package',
          status: 'received',
          createdBy: userId
        },
        {
          trackingNumber: 'TRK987654321',
          carrier: 'UPS',
          sender: 'XYZ Inc',
          recipient: userId,
          type: 'Document',
          status: 'in-transit',
          createdBy: userId
        }
      ]);
      
      const response = await request(app)
        .get('/api/shipments')
        .set('Authorization', `Bearer ${token}`)
        .set('user-id', userId)
        .expect(200);
      
      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBe(2);
    });
    
    // Authentication is tested separately in auth.test.js
    it.skip('should require authentication', async () => {
      await request(app)
        .get('/api/shipments')
        .expect(401);
    });
  });
  
  describe('POST /api/shipments', () => {
    it('should create a new shipment', async () => {
      const shipmentData = {
        trackingNumber: 'TRK123456789',
        carrier: 'FedEx',
        sender: 'ABC Corp',
        recipient: userId,
        type: 'Package',
        notes: 'Handle with care'
      };
      
      const response = await request(app)
        .post('/api/shipments')
        .set('Authorization', `Bearer ${token}`)
        .set('user-id', userId)
        .send(shipmentData)
        .expect(201);
      
      expect(response.body).toHaveProperty('_id');
      expect(response.body.trackingNumber).toBe(shipmentData.trackingNumber);
      expect(response.body.carrier).toBe(shipmentData.carrier);
      
      // Check shipment was saved to database
      const shipment = await Shipment.findById(response.body._id);
      expect(shipment).not.toBeNull();
    });
    
    it('should not create a shipment with invalid data', async () => {
      const invalidData = {
        // Missing required fields
        carrier: 'FedEx'
      };
      
      await request(app)
        .post('/api/shipments')
        .set('Authorization', `Bearer ${token}`)
        .set('user-id', userId)
        .send(invalidData)
        .expect(400);
    });
  });
  
  describe('GET /api/shipments/:id', () => {
    it('should get a shipment by ID', async () => {
      // Create a test shipment
      const shipment = await Shipment.create({
        trackingNumber: 'TRK123456789',
        carrier: 'FedEx',
        sender: 'ABC Corp',
        recipient: userId,
        type: 'Package',
        status: 'received',
        createdBy: userId
      });
      
      const response = await request(app)
        .get(`/api/shipments/${shipment._id}`)
        .set('Authorization', `Bearer ${token}`)
        .set('user-id', userId)
        .expect(200);
      
      expect(response.body).toHaveProperty('_id');
      expect(response.body.trackingNumber).toBe(shipment.trackingNumber);
    });
    
    it('should return 404 for non-existent shipment', async () => {
      const nonExistentId = generateRandomId();
      
      await request(app)
        .get(`/api/shipments/${nonExistentId}`)
        .set('Authorization', `Bearer ${token}`)
        .set('user-id', userId)
        .expect(404);
    });
  });
  
  describe('PUT /api/shipments/:id', () => {
    it('should update a shipment', async () => {
      // Create a test shipment
      const shipment = await Shipment.create({
        trackingNumber: 'TRK123456789',
        carrier: 'FedEx',
        sender: 'ABC Corp',
        recipient: userId,
        type: 'Package',
        status: 'received',
        createdBy: userId
      });
      
      const updateData = {
        carrier: 'UPS',
        notes: 'Updated notes'
      };
      
      const response = await request(app)
        .put(`/api/shipments/${shipment._id}`)
        .set('Authorization', `Bearer ${token}`)
        .set('user-id', userId)
        .send(updateData)
        .expect(200);
      
      expect(response.body.carrier).toBe(updateData.carrier);
      expect(response.body.notes).toBe(updateData.notes);
      
      // Check shipment was updated in database
      const updatedShipment = await Shipment.findById(shipment._id);
      expect(updatedShipment.carrier).toBe(updateData.carrier);
    });
  });
  
  describe('DELETE /api/shipments/:id', () => {
    it('should delete a shipment', async () => {
      // Create a test shipment
      const shipment = await Shipment.create({
        trackingNumber: 'TRK123456789',
        carrier: 'FedEx',
        sender: 'ABC Corp',
        recipient: userId,
        type: 'Package',
        status: 'received',
        createdBy: userId
      });
      
      await request(app)
        .delete(`/api/shipments/${shipment._id}`)
        .set('Authorization', `Bearer ${token}`)
        .set('user-id', userId)
        .expect(200);
      
      // Check shipment was deleted from database
      const deletedShipment = await Shipment.findById(shipment._id);
      expect(deletedShipment).toBeNull();
    });
  });
  
  describe('POST /api/shipments/:id/in-transit', () => {
    it('should mark a shipment as in-transit', async () => {
      // Create a test shipment
      const shipment = await Shipment.create({
        trackingNumber: 'TRK123456789',
        carrier: 'FedEx',
        sender: 'ABC Corp',
        recipient: userId,
        type: 'Package',
        status: 'received',
        createdBy: userId
      });
      
      const response = await request(app)
        .post(`/api/shipments/${shipment._id}/in-transit`)
        .set('Authorization', `Bearer ${token}`)
        .set('user-id', userId)
        .expect(200);
      
      expect(response.body.status).toBe('in-transit');
      
      // Check shipment status was updated in database
      const updatedShipment = await Shipment.findById(shipment._id);
      expect(updatedShipment.status).toBe('in-transit');
    });
  });
  
  describe('POST /api/shipments/:id/delivered', () => {
    it('should mark a shipment as delivered', async () => {
      // Create a test shipment
      const shipment = await Shipment.create({
        trackingNumber: 'TRK123456789',
        carrier: 'FedEx',
        sender: 'ABC Corp',
        recipient: userId,
        type: 'Package',
        status: 'in-transit',
        createdBy: userId
      });
      
      const response = await request(app)
        .post(`/api/shipments/${shipment._id}/delivered`)
        .set('Authorization', `Bearer ${token}`)
        .set('user-id', userId)
        .expect(200);
      
      expect(response.body.status).toBe('delivered');
      expect(response.body.deliveredTime).not.toBeNull();
      
      // Check shipment status was updated in database
      const deliveredShipment = await Shipment.findById(shipment._id);
      expect(deliveredShipment.status).toBe('delivered');
    });
  });
});
