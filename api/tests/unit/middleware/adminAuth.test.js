const adminAuth = require('../../../src/middleware/adminAuth');

describe('Admin Auth Middleware', () => {
  let req, res, next;
  
  beforeEach(() => {
    req = {
      user: {
        _id: 'user-id',
        role: 'Admin'
      }
    };
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    
    next = jest.fn();
  });
  
  it('should call next() if user is an admin', async () => {
    // Execute
    await adminAuth(req, res, next);
    
    // Assert
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });
  
  it('should return 403 if user is not an admin', async () => {
    // Setup
    req.user.role = 'Employee';
    
    // Execute
    await adminAuth(req, res, next);
    
    // Assert
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: expect.any(String) });
  });
  
  it('should handle errors', async () => {
    // Setup
    const error = new Error('Test error');
    
    // Mock implementation that throws an error
    const originalImplementation = adminAuth;
    const mockImplementation = jest.fn().mockImplementation(() => {
      throw error;
    });
    
    // Replace the implementation
    const adminAuthModule = require('../../../src/middleware/adminAuth');
    adminAuthModule = mockImplementation;
    
    // Execute
    await adminAuthModule(req, res, next);
    
    // Restore original implementation
    adminAuthModule = originalImplementation;
    
    // Assert
    expect(mockImplementation).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: expect.any(String) });
  });
});
