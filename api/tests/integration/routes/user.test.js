const request = require('supertest');
const express = require('express');
const userRoutes = require('../../../src/routes/userRoutes');
const User = require('../../../src/models/User');
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

// Mock admin middleware
jest.mock('../../../src/middleware/adminAuth', () => {
  return jest.fn((req, res, next) => {
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }
    next();
  });
});

// Create a test app
const app = express();
app.use(express.json());
app.use('/api/users', userRoutes);

describe('User Routes', () => {
  let token;
  let userId;
  
  beforeEach(async () => {
    // Create a test user and get token
    const testUser = await createTestUser();
    token = testUser.token;
    userId = testUser.user._id.toString();
  });
  
  describe('GET /api/users', () => {
    it('should get all users for admin', async () => {
      // Create some test users
      await User.create([
        {
          name: 'Test User 1',
          email: 'test1@example.com',
          password: 'SecureP@ss123',
          role: 'Employee',
          department: 'IT',
          status: 'active'
        },
        {
          name: 'Test User 2',
          email: 'test2@example.com',
          password: 'SecureP@ss123',
          role: 'Reception',
          department: 'Front Desk',
          status: 'active'
        }
      ]);
      
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${token}`)
        .set('user-id', userId)
        .set('user-role', 'Admin')
        .expect(200);
      
      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBeGreaterThanOrEqual(2);
      
      // Check that passwords are not returned
      response.body.forEach(user => {
        expect(user).not.toHaveProperty('password');
      });
    });
    
    it('should not allow non-admin users to get all users', async () => {
      await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${token}`)
        .set('user-id', userId)
        .set('user-role', 'Employee')
        .expect(403);
    });
  });
  
  describe('POST /api/users', () => {
    it('should create a new user for admin', async () => {
      const userData = {
        name: 'New User',
        email: 'newuser@example.com',
        password: 'SecureP@ss123',
        role: 'Employee',
        department: 'Marketing',
        status: 'active'
      };
      
      const response = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${token}`)
        .set('user-id', userId)
        .set('user-role', 'Admin')
        .send(userData)
        .expect(201);
      
      expect(response.body).toHaveProperty('_id');
      expect(response.body.name).toBe(userData.name);
      expect(response.body.email).toBe(userData.email);
      expect(response.body).not.toHaveProperty('password');
      
      // Check user was saved to database
      const user = await User.findById(response.body._id);
      expect(user).not.toBeNull();
    });
    
    it('should not allow non-admin users to create users', async () => {
      const userData = {
        name: 'New User',
        email: 'newuser@example.com',
        password: 'SecureP@ss123',
        role: 'Employee',
        department: 'Marketing'
      };
      
      await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${token}`)
        .set('user-id', userId)
        .set('user-role', 'Employee')
        .send(userData)
        .expect(403);
    });
    
    it('should not create a user with existing email', async () => {
      // Create a user first
      await User.create({
        name: 'Existing User',
        email: 'existing@example.com',
        password: 'SecureP@ss123',
        role: 'Employee',
        department: 'IT',
        status: 'active'
      });
      
      // Try to create another user with the same email
      const userData = {
        name: 'New User',
        email: 'existing@example.com',
        password: 'SecureP@ss123',
        role: 'Employee',
        department: 'Marketing'
      };
      
      await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${token}`)
        .set('user-id', userId)
        .set('user-role', 'Admin')
        .send(userData)
        .expect(400);
    });
  });
  
  describe('GET /api/users/:id', () => {
    it('should get a user by ID', async () => {
      // Create a test user
      const user = await User.create({
        name: 'Test User',
        email: 'testuser@example.com',
        password: 'SecureP@ss123',
        role: 'Employee',
        department: 'IT',
        status: 'active'
      });
      
      const response = await request(app)
        .get(`/api/users/${user._id}`)
        .set('Authorization', `Bearer ${token}`)
        .set('user-id', userId)
        .set('user-role', 'Admin')
        .expect(200);
      
      expect(response.body).toHaveProperty('_id');
      expect(response.body.name).toBe(user.name);
      expect(response.body.email).toBe(user.email);
      expect(response.body).not.toHaveProperty('password');
    });
    
    it('should allow users to view their own profile', async () => {
      // Create a test user
      const user = await User.create({
        name: 'Test User',
        email: 'testuser@example.com',
        password: 'SecureP@ss123',
        role: 'Employee',
        department: 'IT',
        status: 'active'
      });
      
      const response = await request(app)
        .get(`/api/users/${user._id}`)
        .set('Authorization', `Bearer ${token}`)
        .set('user-id', user._id.toString())
        .set('user-role', 'Employee')
        .expect(200);
      
      expect(response.body).toHaveProperty('_id');
      expect(response.body.name).toBe(user.name);
    });
    
    it('should not allow non-admin users to view other profiles', async () => {
      // Create a test user
      const user = await User.create({
        name: 'Test User',
        email: 'testuser@example.com',
        password: 'SecureP@ss123',
        role: 'Employee',
        department: 'IT',
        status: 'active'
      });
      
      // Try to view the profile with a different user ID
      await request(app)
        .get(`/api/users/${user._id}`)
        .set('Authorization', `Bearer ${token}`)
        .set('user-id', generateRandomId())
        .set('user-role', 'Employee')
        .expect(403);
    });
  });
  
  describe('PUT /api/users/:id', () => {
    it('should update a user for admin', async () => {
      // Create a test user
      const user = await User.create({
        name: 'Test User',
        email: 'testuser@example.com',
        password: 'SecureP@ss123',
        role: 'Employee',
        department: 'IT',
        status: 'active'
      });
      
      const updateData = {
        name: 'Updated User',
        department: 'HR',
        role: 'Reception'
      };
      
      const response = await request(app)
        .put(`/api/users/${user._id}`)
        .set('Authorization', `Bearer ${token}`)
        .set('user-id', userId)
        .set('user-role', 'Admin')
        .send(updateData)
        .expect(200);
      
      expect(response.body.name).toBe(updateData.name);
      expect(response.body.department).toBe(updateData.department);
      expect(response.body.role).toBe(updateData.role);
      
      // Check user was updated in database
      const updatedUser = await User.findById(user._id);
      expect(updatedUser.name).toBe(updateData.name);
    });
    
    it('should allow users to update their own profile', async () => {
      // Create a test user
      const user = await User.create({
        name: 'Test User',
        email: 'testuser@example.com',
        password: 'SecureP@ss123',
        role: 'Employee',
        department: 'IT',
        status: 'active'
      });
      
      const updateData = {
        name: 'Updated User',
        department: 'HR'
      };
      
      const response = await request(app)
        .put(`/api/users/${user._id}`)
        .set('Authorization', `Bearer ${token}`)
        .set('user-id', user._id.toString())
        .set('user-role', 'Employee')
        .send(updateData)
        .expect(200);
      
      expect(response.body.name).toBe(updateData.name);
      expect(response.body.department).toBe(updateData.department);
      
      // Role should not be changed by non-admin
      expect(response.body.role).toBe('Employee');
    });
    
    it('should not allow non-admin users to update other profiles', async () => {
      // Create a test user
      const user = await User.create({
        name: 'Test User',
        email: 'testuser@example.com',
        password: 'SecureP@ss123',
        role: 'Employee',
        department: 'IT',
        status: 'active'
      });
      
      const updateData = {
        name: 'Updated User'
      };
      
      // Try to update the profile with a different user ID
      await request(app)
        .put(`/api/users/${user._id}`)
        .set('Authorization', `Bearer ${token}`)
        .set('user-id', generateRandomId())
        .set('user-role', 'Employee')
        .send(updateData)
        .expect(403);
    });
    
    it('should not allow non-admin users to change roles', async () => {
      // Create a test user
      const user = await User.create({
        name: 'Test User',
        email: 'testuser@example.com',
        password: 'SecureP@ss123',
        role: 'Employee',
        department: 'IT',
        status: 'active'
      });
      
      const updateData = {
        name: 'Updated User',
        role: 'Admin'
      };
      
      await request(app)
        .put(`/api/users/${user._id}`)
        .set('Authorization', `Bearer ${token}`)
        .set('user-id', user._id.toString())
        .set('user-role', 'Employee')
        .send(updateData)
        .expect(403);
    });
  });
  
  describe('DELETE /api/users/:id', () => {
    it('should delete a user for admin', async () => {
      // Create a test user
      const user = await User.create({
        name: 'Test User',
        email: 'testuser@example.com',
        password: 'SecureP@ss123',
        role: 'Employee',
        department: 'IT',
        status: 'active'
      });
      
      await request(app)
        .delete(`/api/users/${user._id}`)
        .set('Authorization', `Bearer ${token}`)
        .set('user-id', userId)
        .set('user-role', 'Admin')
        .expect(200);
      
      // Check user was deleted from database
      const deletedUser = await User.findById(user._id);
      expect(deletedUser).toBeNull();
    });
    
    it('should not allow non-admin users to delete users', async () => {
      // Create a test user
      const user = await User.create({
        name: 'Test User',
        email: 'testuser@example.com',
        password: 'SecureP@ss123',
        role: 'Employee',
        department: 'IT',
        status: 'active'
      });
      
      await request(app)
        .delete(`/api/users/${user._id}`)
        .set('Authorization', `Bearer ${token}`)
        .set('user-id', user._id.toString())
        .set('user-role', 'Employee')
        .expect(403);
    });
  });
});
