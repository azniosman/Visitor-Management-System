const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../../../src/models/User');
const auth = require('../../../src/middleware/auth');

describe('Auth Middleware', () => {
  let req, res, next;
  
  beforeEach(() => {
    req = {
      header: jest.fn()
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
  });
  
  it('should return 401 if no token is provided', async () => {
    req.header.mockReturnValue(null);
    
    await auth(req, res, next);
    
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Authentication required' });
    expect(next).not.toHaveBeenCalled();
  });
  
  it('should return 401 if token is invalid', async () => {
    req.header.mockReturnValue('Bearer invalid-token');
    
    // Mock jwt.verify to throw an error
    jest.spyOn(jwt, 'verify').mockImplementation(() => {
      throw new Error('Invalid token');
    });
    
    await auth(req, res, next);
    
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Authentication failed' });
    expect(next).not.toHaveBeenCalled();
    
    // Restore original implementation
    jwt.verify.mockRestore();
  });
  
  it('should return 401 if user is not found', async () => {
    const userId = new mongoose.Types.ObjectId();
    const token = 'valid-token';
    
    req.header.mockReturnValue(`Bearer ${token}`);
    
    // Mock jwt.verify to return a valid payload
    jest.spyOn(jwt, 'verify').mockReturnValue({ _id: userId });
    
    // Mock User.findOne to return null (user not found)
    jest.spyOn(User, 'findOne').mockResolvedValue(null);
    
    await auth(req, res, next);
    
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Authentication failed' });
    expect(next).not.toHaveBeenCalled();
    
    // Restore original implementations
    jwt.verify.mockRestore();
    User.findOne.mockRestore();
  });
  
  it('should set req.user and req.token if authentication is successful', async () => {
    const userId = new mongoose.Types.ObjectId();
    const token = 'valid-token';
    const user = {
      _id: userId,
      name: 'Test User',
      email: 'test@example.com',
      role: 'Admin',
      status: 'active',
      tokens: [{ token }]
    };
    
    req.header.mockReturnValue(`Bearer ${token}`);
    
    // Mock jwt.verify to return a valid payload
    jest.spyOn(jwt, 'verify').mockReturnValue({ _id: userId });
    
    // Mock User.findOne to return a user
    jest.spyOn(User, 'findOne').mockResolvedValue(user);
    
    await auth(req, res, next);
    
    expect(req.user).toEqual(user);
    expect(req.token).toBe(token);
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
    
    // Restore original implementations
    jwt.verify.mockRestore();
    User.findOne.mockRestore();
  });
});
