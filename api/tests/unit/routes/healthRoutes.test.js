const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const healthRoutes = require('../../../src/routes/healthRoutes');

// Mock mongoose connection
jest.mock('mongoose', () => ({
  connection: {
    readyState: 1
  }
}));

// Mock process.memoryUsage
jest.spyOn(process, 'memoryUsage').mockReturnValue({
  rss: 50 * 1024 * 1024,
  heapTotal: 30 * 1024 * 1024,
  heapUsed: 20 * 1024 * 1024,
  external: 10 * 1024 * 1024
});

// Mock process.uptime
jest.spyOn(process, 'uptime').mockReturnValue(3600);

describe('Health Routes', () => {
  let app;
  
  beforeEach(() => {
    app = express();
    app.use('/api/health', healthRoutes);
  });
  
  afterEach(() => {
    jest.clearAllMocks();
  });
  
  it('should return health status with database connected', async () => {
    // Execute
    const response = await request(app).get('/api/health');
    
    // Assert
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status', 'ok');
    expect(response.body).toHaveProperty('timestamp');
    expect(response.body).toHaveProperty('uptime', 3600);
    expect(response.body).toHaveProperty('database.status', 'connected');
    expect(response.body).toHaveProperty('memory.rss', '50 MB');
    expect(response.body).toHaveProperty('memory.heapTotal', '30 MB');
    expect(response.body).toHaveProperty('memory.heapUsed', '20 MB');
    expect(response.body).toHaveProperty('environment');
  });
  
  it('should return database disconnected status when database is not connected', async () => {
    // Setup
    mongoose.connection.readyState = 0;
    
    // Execute
    const response = await request(app).get('/api/health');
    
    // Assert
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('database.status', 'disconnected');
    
    // Restore
    mongoose.connection.readyState = 1;
  });
  
  it('should handle errors', async () => {
    // Setup
    const originalReadyState = mongoose.connection.readyState;
    
    // Mock an error by making readyState a getter that throws
    Object.defineProperty(mongoose.connection, 'readyState', {
      get: () => { throw new Error('Test error'); },
      configurable: true
    });
    
    // Execute
    const response = await request(app).get('/api/health');
    
    // Assert
    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('status', 'error');
    expect(response.body).toHaveProperty('message', 'Health check failed');
    expect(response.body).toHaveProperty('error', 'Test error');
    
    // Restore
    Object.defineProperty(mongoose.connection, 'readyState', {
      value: originalReadyState,
      configurable: true,
      writable: true
    });
  });
});
