const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const errorHandler = require('../../src/middleware/errorHandler');
const visitorRoutes = require('../../src/routes/visitorRoutes');
const Visitor = require('../../src/models/Visitor');

// Mock middleware
jest.mock('../../src/middleware/auth', () => {
  return jest.fn((req, res, next) => {
    req.user = { _id: 'user-id', role: 'Admin' };
    next();
  });
});

describe('Error Handling', () => {
  let app;
  
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Create a test app with error handler
    app = express();
    app.use(express.json());
    app.use('/api/visitors', visitorRoutes);
    app.use(errorHandler);
    
    // Mock console.error to prevent test output pollution
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });
  
  afterEach(() => {
    // Restore console.error
    console.error.mockRestore();
  });
  
  describe('Invalid Routes', () => {
    it('should return 404 for non-existent routes', async () => {
      // Setup
      app.use((req, res, next) => {
        const error = new Error('Route not found');
        error.statusCode = 404;
        next(error);
      });
      
      // Execute and Assert
      await request(app)
        .get('/api/nonexistent')
        .expect(404)
        .expect(res => {
          expect(res.body).toHaveProperty('message', 'Route not found');
        });
    });
  });
  
  describe('Validation Errors', () => {
    it('should handle Mongoose validation errors', async () => {
      // Setup
      jest.spyOn(Visitor.prototype, 'save').mockImplementation(() => {
        const error = new Error('Validation failed');
        error.name = 'ValidationError';
        error.errors = {
          name: { message: 'Name is required' },
          host: { message: 'Host is required' }
        };
        throw error;
      });
      
      // Execute and Assert
      await request(app)
        .post('/api/visitors')
        .send({})
        .expect(400)
        .expect(res => {
          expect(res.body).toHaveProperty('message');
          expect(res.body.message).toContain('Name is required');
          expect(res.body.message).toContain('Host is required');
        });
    });
    
    it('should handle Mongoose duplicate key errors', async () => {
      // Setup
      jest.spyOn(Visitor.prototype, 'save').mockImplementation(() => {
        const error = new Error('Duplicate key error');
        error.code = 11000;
        error.keyValue = { email: 'duplicate@example.com' };
        throw error;
      });
      
      // Execute and Assert
      await request(app)
        .post('/api/visitors')
        .send({
          name: 'Test Visitor',
          email: 'duplicate@example.com',
          host: 'host-id',
          purpose: 'Testing',
          visitDate: new Date()
        })
        .expect(400)
        .expect(res => {
          expect(res.body).toHaveProperty('message', 'email already exists');
        });
    });
  });
  
  describe('Database Errors', () => {
    it('should handle database connection errors', async () => {
      // Setup
      jest.spyOn(Visitor, 'find').mockImplementation(() => {
        throw new Error('Database connection error');
      });
      
      // Execute and Assert
      await request(app)
        .get('/api/visitors')
        .expect(500)
        .expect(res => {
          expect(res.body).toHaveProperty('message', 'Database connection error');
        });
    });
    
    it('should handle database query timeout', async () => {
      // Setup
      jest.spyOn(Visitor, 'find').mockImplementation(() => {
        const error = new Error('Query timed out');
        error.name = 'MongoTimeoutError';
        throw error;
      });
      
      // Execute and Assert
      await request(app)
        .get('/api/visitors')
        .expect(500)
        .expect(res => {
          expect(res.body).toHaveProperty('message', 'Query timed out');
        });
    });
  });
  
  describe('Authentication Errors', () => {
    it('should handle JWT errors', async () => {
      // Setup
      app.use('/test-jwt-error', (req, res, next) => {
        const error = new Error('Invalid token');
        error.name = 'JsonWebTokenError';
        next(error);
      });
      
      // Execute and Assert
      await request(app)
        .get('/test-jwt-error')
        .expect(401)
        .expect(res => {
          expect(res.body).toHaveProperty('message', 'Invalid token');
        });
    });
    
    it('should handle token expiration', async () => {
      // Setup
      app.use('/test-token-expired', (req, res, next) => {
        const error = new Error('Token expired');
        error.name = 'TokenExpiredError';
        next(error);
      });
      
      // Execute and Assert
      await request(app)
        .get('/test-token-expired')
        .expect(401)
        .expect(res => {
          expect(res.body).toHaveProperty('message', 'Token expired');
        });
    });
  });
  
  describe('Edge Cases', () => {
    it('should handle empty request body', async () => {
      // Execute and Assert
      await request(app)
        .post('/api/visitors')
        .send({})
        .expect(400);
    });
    
    it('should handle malformed JSON', async () => {
      // Setup
      app.use('/test-malformed-json', express.json());
      app.use('/test-malformed-json', (err, req, res, next) => {
        if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
          return res.status(400).json({ message: 'Invalid JSON' });
        }
        next(err);
      });
      
      // Execute and Assert
      await request(app)
        .post('/test-malformed-json')
        .set('Content-Type', 'application/json')
        .send('{malformed json')
        .expect(400);
    });
    
    it('should handle very large payloads', async () => {
      // Setup
      const largeObject = {};
      for (let i = 0; i < 10000; i++) {
        largeObject[`key${i}`] = `value${i}`;
      }
      
      // Execute and Assert
      await request(app)
        .post('/api/visitors')
        .send(largeObject)
        .expect(res => {
          expect(res.status).toBeGreaterThanOrEqual(400);
        });
    });
    
    it('should handle invalid MongoDB ObjectId', async () => {
      // Execute and Assert
      await request(app)
        .get('/api/visitors/invalid-id')
        .expect(500)
        .expect(res => {
          expect(res.body).toHaveProperty('message');
          expect(res.body.message).toContain('Cast to ObjectId failed');
        });
    });
  });
});
