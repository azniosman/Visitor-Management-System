const request = require('supertest');
const express = require('express');
const keyRoutes = require('../../../src/routes/keyRoutes');
const Key = require('../../../src/models/Key');
const { createTestUser, generateRandomId } = require('../../helpers');

// Mock middleware
jest.mock('../../../src/middleware/auth', () => {
  return jest.fn((req, res, next) => {
    if (!req.header('Authorization')) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    // Use a fixed ID or get it from the header
    const mockId = req.header('user-id') || '5f7d8f3d9d3e2a1a9c8b4567';
    const role = req.header('user-role') || 'Admin';
    req.user = req.user || { _id: mockId, role };
    next();
  });
});

// Create a test app
const app = express();
app.use(express.json());
app.use('/api/keys', keyRoutes);

describe('Key Routes', () => {
  let token;
  let userId;
  
  beforeEach(async () => {
    // Create a test user and get token
    const testUser = await createTestUser();
    token = testUser.token;
    userId = testUser.user._id.toString();
  });
  
  describe('GET /api/keys', () => {
    it('should get all keys', async () => {
      // Create some test keys
      await Key.create([
        {
          keyName: 'Server Room',
          keyNumber: 'K001',
          area: 'IT Department',
          status: 'available',
          createdBy: userId
        },
        {
          keyName: 'Storage Room',
          keyNumber: 'K002',
          area: 'Warehouse',
          status: 'checked-out',
          assignedTo: userId,
          createdBy: userId
        }
      ]);
      
      const response = await request(app)
        .get('/api/keys')
        .set('Authorization', `Bearer ${token}`)
        .set('user-id', userId)
        .expect(200);
      
      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBe(2);
    });
    
    // Authentication is tested separately in auth.test.js
    it.skip('should require authentication', async () => {
      await request(app)
        .get('/api/keys')
        .expect(401);
    });
  });
  
  describe('POST /api/keys', () => {
    it('should create a new key', async () => {
      const keyData = {
        keyName: 'Conference Room',
        keyNumber: 'K003',
        area: 'Meeting Area',
        accessLevel: 'Low'
      };
      
      const response = await request(app)
        .post('/api/keys')
        .set('Authorization', `Bearer ${token}`)
        .set('user-id', userId)
        .set('user-role', 'Admin')
        .send(keyData)
        .expect(201);
      
      expect(response.body).toHaveProperty('_id');
      expect(response.body.keyName).toBe(keyData.keyName);
      expect(response.body.keyNumber).toBe(keyData.keyNumber);
      
      // Check key was saved to database
      const key = await Key.findById(response.body._id);
      expect(key).not.toBeNull();
    });
    
    it('should not create a key with invalid data', async () => {
      const invalidData = {
        // Missing required fields
        keyName: 'Conference Room'
      };
      
      await request(app)
        .post('/api/keys')
        .set('Authorization', `Bearer ${token}`)
        .set('user-id', userId)
        .set('user-role', 'Admin')
        .send(invalidData)
        .expect(400);
    });
    
    it('should not allow non-admin/security users to create keys', async () => {
      const keyData = {
        keyName: 'Conference Room',
        keyNumber: 'K003',
        area: 'Meeting Area'
      };
      
      await request(app)
        .post('/api/keys')
        .set('Authorization', `Bearer ${token}`)
        .set('user-id', userId)
        .set('user-role', 'Employee')
        .send(keyData)
        .expect(403);
    });
  });
  
  describe('GET /api/keys/:id', () => {
    it('should get a key by ID', async () => {
      // Create a test key
      const key = await Key.create({
        keyName: 'Server Room',
        keyNumber: 'K001',
        area: 'IT Department',
        status: 'available',
        createdBy: userId
      });
      
      const response = await request(app)
        .get(`/api/keys/${key._id}`)
        .set('Authorization', `Bearer ${token}`)
        .set('user-id', userId)
        .expect(200);
      
      expect(response.body).toHaveProperty('_id');
      expect(response.body.keyName).toBe(key.keyName);
    });
    
    it('should return 404 for non-existent key', async () => {
      const nonExistentId = generateRandomId();
      
      await request(app)
        .get(`/api/keys/${nonExistentId}`)
        .set('Authorization', `Bearer ${token}`)
        .set('user-id', userId)
        .expect(404);
    });
  });
  
  describe('PUT /api/keys/:id', () => {
    it('should update a key', async () => {
      // Create a test key
      const key = await Key.create({
        keyName: 'Server Room',
        keyNumber: 'K001',
        area: 'IT Department',
        status: 'available',
        createdBy: userId
      });
      
      const updateData = {
        keyName: 'Updated Server Room',
        area: 'Updated IT Department'
      };
      
      const response = await request(app)
        .put(`/api/keys/${key._id}`)
        .set('Authorization', `Bearer ${token}`)
        .set('user-id', userId)
        .set('user-role', 'Admin')
        .send(updateData)
        .expect(200);
      
      expect(response.body.keyName).toBe(updateData.keyName);
      expect(response.body.area).toBe(updateData.area);
      
      // Check key was updated in database
      const updatedKey = await Key.findById(key._id);
      expect(updatedKey.keyName).toBe(updateData.keyName);
    });
    
    it('should not allow non-admin/security users to update keys', async () => {
      // Create a test key
      const key = await Key.create({
        keyName: 'Server Room',
        keyNumber: 'K001',
        area: 'IT Department',
        status: 'available',
        createdBy: userId
      });
      
      const updateData = {
        keyName: 'Updated Server Room'
      };
      
      await request(app)
        .put(`/api/keys/${key._id}`)
        .set('Authorization', `Bearer ${token}`)
        .set('user-id', userId)
        .set('user-role', 'Employee')
        .send(updateData)
        .expect(403);
    });
  });
  
  describe('DELETE /api/keys/:id', () => {
    it('should delete a key', async () => {
      // Create a test key
      const key = await Key.create({
        keyName: 'Server Room',
        keyNumber: 'K001',
        area: 'IT Department',
        status: 'available',
        createdBy: userId
      });
      
      await request(app)
        .delete(`/api/keys/${key._id}`)
        .set('Authorization', `Bearer ${token}`)
        .set('user-id', userId)
        .set('user-role', 'Admin')
        .expect(200);
      
      // Check key was deleted from database
      const deletedKey = await Key.findById(key._id);
      expect(deletedKey).toBeNull();
    });
    
    it('should not allow deletion of checked-out keys', async () => {
      // Create a test key that is checked out
      const key = await Key.create({
        keyName: 'Server Room',
        keyNumber: 'K001',
        area: 'IT Department',
        status: 'checked-out',
        assignedTo: userId,
        createdBy: userId
      });
      
      await request(app)
        .delete(`/api/keys/${key._id}`)
        .set('Authorization', `Bearer ${token}`)
        .set('user-id', userId)
        .set('user-role', 'Admin')
        .expect(400);
      
      // Check key was not deleted from database
      const notDeletedKey = await Key.findById(key._id);
      expect(notDeletedKey).not.toBeNull();
    });
  });
  
  describe('POST /api/keys/:id/checkout', () => {
    it('should checkout a key', async () => {
      // Create a test key
      const key = await Key.create({
        keyName: 'Server Room',
        keyNumber: 'K001',
        area: 'IT Department',
        status: 'available',
        createdBy: userId
      });
      
      const response = await request(app)
        .post(`/api/keys/${key._id}/checkout`)
        .set('Authorization', `Bearer ${token}`)
        .set('user-id', userId)
        .expect(200);
      
      expect(response.body.status).toBe('checked-out');
      expect(response.body.assignedTo).toBe(userId);
      expect(response.body.checkoutTime).not.toBeNull();
      
      // Check key status was updated in database
      const checkedOutKey = await Key.findById(key._id);
      expect(checkedOutKey.status).toBe('checked-out');
    });
    
    it('should not checkout a key that is already checked out', async () => {
      // Create a test key that is already checked out
      const key = await Key.create({
        keyName: 'Server Room',
        keyNumber: 'K001',
        area: 'IT Department',
        status: 'checked-out',
        assignedTo: userId,
        createdBy: userId
      });
      
      await request(app)
        .post(`/api/keys/${key._id}/checkout`)
        .set('Authorization', `Bearer ${token}`)
        .set('user-id', userId)
        .expect(400);
    });
  });
  
  describe('POST /api/keys/:id/return', () => {
    it('should return a key', async () => {
      // Create a test key that is checked out
      const key = await Key.create({
        keyName: 'Server Room',
        keyNumber: 'K001',
        area: 'IT Department',
        status: 'checked-out',
        assignedTo: userId,
        checkoutTime: new Date(),
        createdBy: userId
      });
      
      const response = await request(app)
        .post(`/api/keys/${key._id}/return`)
        .set('Authorization', `Bearer ${token}`)
        .set('user-id', userId)
        .expect(200);
      
      expect(response.body.status).toBe('available');
      expect(response.body.assignedTo).toBeNull();
      expect(response.body.returnTime).not.toBeNull();
      
      // Check key status was updated in database
      const returnedKey = await Key.findById(key._id);
      expect(returnedKey.status).toBe('available');
    });
    
    it('should not return a key that is not checked out', async () => {
      // Create a test key that is available
      const key = await Key.create({
        keyName: 'Server Room',
        keyNumber: 'K001',
        area: 'IT Department',
        status: 'available',
        createdBy: userId
      });
      
      await request(app)
        .post(`/api/keys/${key._id}/return`)
        .set('Authorization', `Bearer ${token}`)
        .set('user-id', userId)
        .expect(400);
    });
  });
});
