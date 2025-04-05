const errorHandler = require('../../../src/middleware/errorHandler');

describe('Error Handler Middleware', () => {
  let req, res, next;
  
  beforeEach(() => {
    req = {};
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    
    next = jest.fn();
    
    // Mock console.error to prevent test output pollution
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });
  
  afterEach(() => {
    // Restore console.error
    console.error.mockRestore();
  });
  
  it('should handle generic errors', () => {
    // Setup
    const error = new Error('Test error');
    
    // Execute
    errorHandler(error, req, res, next);
    
    // Assert
    expect(console.error).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Test error',
      stack: expect.any(String)
    });
  });
  
  it('should handle errors with custom status code', () => {
    // Setup
    const error = new Error('Custom error');
    error.statusCode = 400;
    
    // Execute
    errorHandler(error, req, res, next);
    
    // Assert
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Custom error',
      stack: expect.any(String)
    });
  });
  
  it('should handle Mongoose validation errors', () => {
    // Setup
    const error = new Error('Validation error');
    error.name = 'ValidationError';
    error.errors = {
      name: { message: 'Name is required' },
      email: { message: 'Email is invalid' }
    };
    
    // Execute
    errorHandler(error, req, res, next);
    
    // Assert
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Name is required, Email is invalid'
    });
  });
  
  it('should handle Mongoose duplicate key errors', () => {
    // Setup
    const error = new Error('Duplicate key error');
    error.code = 11000;
    error.keyValue = { email: 'test@example.com' };
    
    // Execute
    errorHandler(error, req, res, next);
    
    // Assert
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: 'email already exists'
    });
  });
  
  it('should handle JWT errors', () => {
    // Setup
    const error = new Error('Invalid token');
    error.name = 'JsonWebTokenError';
    
    // Execute
    errorHandler(error, req, res, next);
    
    // Assert
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Invalid token'
    });
  });
  
  it('should handle token expiration errors', () => {
    // Setup
    const error = new Error('Token expired');
    error.name = 'TokenExpiredError';
    
    // Execute
    errorHandler(error, req, res, next);
    
    // Assert
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Token expired'
    });
  });
  
  it('should hide stack trace in production', () => {
    // Setup
    const originalNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    
    const error = new Error('Production error');
    
    // Execute
    errorHandler(error, req, res, next);
    
    // Restore NODE_ENV
    process.env.NODE_ENV = originalNodeEnv;
    
    // Assert
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Production error',
      stack: '🥞'
    });
  });
});
