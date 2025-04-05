const authController = require('../../../src/controllers/authController');
const User = require('../../../src/models/User');
const jwt = require('jsonwebtoken');
const { sendEmail } = require('../../../src/utils/email');

// Mock dependencies
jest.mock('../../../src/models/User');
jest.mock('jsonwebtoken');
jest.mock('../../../src/utils/email');

describe('Auth Controller', () => {
  let req, res, next;
  
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Mock request and response objects
    req = {
      body: {},
      user: {
        _id: 'user-id',
        tokens: [{ token: 'token1' }]
      },
      token: 'current-token'
    };
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    
    next = jest.fn();
  });
  
  describe('login', () => {
    it('should login a user with valid credentials', async () => {
      // Setup
      req.body = {
        email: 'test@example.com',
        password: 'SecureP@ss123'
      };
      
      const mockUser = {
        _id: 'user-id',
        email: 'test@example.com',
        status: 'active',
        isValidPassword: jest.fn().mockResolvedValue(true),
        tokens: [],
        save: jest.fn().mockResolvedValue(true),
        toObject: jest.fn().mockReturnValue({
          _id: 'user-id',
          email: 'test@example.com',
          name: 'Test User',
          role: 'Admin'
        })
      };
      
      User.findOne.mockResolvedValue(mockUser);
      jwt.sign.mockReturnValue('new-token');
      
      // Execute
      await authController.login(req, res);
      
      // Assert
      expect(User.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
      expect(mockUser.isValidPassword).toHaveBeenCalledWith('SecureP@ss123');
      expect(jwt.sign).toHaveBeenCalled();
      expect(mockUser.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        user: expect.any(Object),
        token: 'new-token'
      });
    });
    
    it('should return 401 for non-existent user', async () => {
      // Setup
      req.body = {
        email: 'nonexistent@example.com',
        password: 'SecureP@ss123'
      };
      
      User.findOne.mockResolvedValue(null);
      
      // Execute
      await authController.login(req, res);
      
      // Assert
      expect(User.findOne).toHaveBeenCalledWith({ email: 'nonexistent@example.com' });
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: expect.any(String) });
    });
    
    it('should return 401 for inactive user', async () => {
      // Setup
      req.body = {
        email: 'inactive@example.com',
        password: 'SecureP@ss123'
      };
      
      const mockUser = {
        email: 'inactive@example.com',
        status: 'inactive'
      };
      
      User.findOne.mockResolvedValue(mockUser);
      
      // Execute
      await authController.login(req, res);
      
      // Assert
      expect(User.findOne).toHaveBeenCalledWith({ email: 'inactive@example.com' });
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: expect.any(String) });
    });
    
    it('should return 401 for invalid password', async () => {
      // Setup
      req.body = {
        email: 'test@example.com',
        password: 'WrongPassword'
      };
      
      const mockUser = {
        email: 'test@example.com',
        status: 'active',
        isValidPassword: jest.fn().mockResolvedValue(false)
      };
      
      User.findOne.mockResolvedValue(mockUser);
      
      // Execute
      await authController.login(req, res);
      
      // Assert
      expect(User.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
      expect(mockUser.isValidPassword).toHaveBeenCalledWith('WrongPassword');
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: expect.any(String) });
    });
    
    it('should handle server errors', async () => {
      // Setup
      req.body = {
        email: 'test@example.com',
        password: 'SecureP@ss123'
      };
      
      User.findOne.mockRejectedValue(new Error('Database error'));
      
      // Execute
      await authController.login(req, res);
      
      // Assert
      expect(User.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: expect.any(String) });
    });
  });
  
  describe('logout', () => {
    it('should logout a user', async () => {
      // Setup
      req.user.tokens = [
        { token: 'token1' },
        { token: 'current-token' },
        { token: 'token3' }
      ];
      req.user.save = jest.fn().mockResolvedValue(true);
      
      // Execute
      await authController.logout(req, res);
      
      // Assert
      expect(req.user.tokens).toEqual([
        { token: 'token1' },
        { token: 'token3' }
      ]);
      expect(req.user.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: expect.any(String) });
    });
    
    it('should handle server errors', async () => {
      // Setup
      req.user.save = jest.fn().mockRejectedValue(new Error('Database error'));
      
      // Execute
      await authController.logout(req, res);
      
      // Assert
      expect(req.user.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: expect.any(String) });
    });
  });
  
  describe('logoutAll', () => {
    it('should logout from all devices', async () => {
      // Setup
      req.user.tokens = [
        { token: 'token1' },
        { token: 'token2' },
        { token: 'token3' }
      ];
      req.user.save = jest.fn().mockResolvedValue(true);
      
      // Execute
      await authController.logoutAll(req, res);
      
      // Assert
      expect(req.user.tokens).toEqual([]);
      expect(req.user.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: expect.any(String) });
    });
    
    it('should handle server errors', async () => {
      // Setup
      req.user.save = jest.fn().mockRejectedValue(new Error('Database error'));
      
      // Execute
      await authController.logoutAll(req, res);
      
      // Assert
      expect(req.user.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: expect.any(String) });
    });
  });
  
  describe('register', () => {
    it('should register a new user', async () => {
      // Setup
      req.body = {
        name: 'New User',
        email: 'newuser@example.com',
        password: 'SecureP@ss123',
        role: 'Employee'
      };
      
      User.findOne.mockResolvedValue(null);
      
      const mockUser = {
        ...req.body,
        _id: 'new-user-id',
        save: jest.fn().mockResolvedValue(true),
        tokens: [],
        toObject: jest.fn().mockReturnValue({
          _id: 'new-user-id',
          name: 'New User',
          email: 'newuser@example.com',
          role: 'Employee'
        })
      };
      
      User.mockImplementation(() => mockUser);
      jwt.sign.mockReturnValue('new-token');
      sendEmail.mockResolvedValue(true);
      
      // Execute
      await authController.register(req, res);
      
      // Assert
      expect(User.findOne).toHaveBeenCalledWith({ email: 'newuser@example.com' });
      expect(User).toHaveBeenCalledWith(req.body);
      expect(jwt.sign).toHaveBeenCalled();
      expect(mockUser.save).toHaveBeenCalled();
      expect(sendEmail).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        user: expect.any(Object),
        token: 'new-token'
      });
    });
    
    it('should not register a user with existing email', async () => {
      // Setup
      req.body = {
        name: 'New User',
        email: 'existing@example.com',
        password: 'SecureP@ss123',
        role: 'Employee'
      };
      
      User.findOne.mockResolvedValue({ email: 'existing@example.com' });
      
      // Execute
      await authController.register(req, res);
      
      // Assert
      expect(User.findOne).toHaveBeenCalledWith({ email: 'existing@example.com' });
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: expect.any(String) });
    });
    
    it('should handle validation errors', async () => {
      // Setup
      req.body = {
        name: 'New User',
        email: 'newuser@example.com',
        password: 'short',
        role: 'Employee'
      };
      
      User.findOne.mockResolvedValue(null);
      
      const mockUser = {
        ...req.body,
        save: jest.fn().mockRejectedValue(new Error('Validation error'))
      };
      
      User.mockImplementation(() => mockUser);
      
      // Execute
      await authController.register(req, res);
      
      // Assert
      expect(User.findOne).toHaveBeenCalledWith({ email: 'newuser@example.com' });
      expect(User).toHaveBeenCalledWith(req.body);
      expect(mockUser.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: expect.any(String) });
    });
  });
  
  describe('forgotPassword', () => {
    it('should send a password reset email', async () => {
      // Setup
      req.body = {
        email: 'user@example.com'
      };
      
      const mockUser = {
        email: 'user@example.com',
        save: jest.fn().mockResolvedValue(true)
      };
      
      User.findOne.mockResolvedValue(mockUser);
      sendEmail.mockResolvedValue(true);
      
      // Execute
      await authController.forgotPassword(req, res);
      
      // Assert
      expect(User.findOne).toHaveBeenCalledWith({ email: 'user@example.com' });
      expect(mockUser.resetPasswordToken).toBeDefined();
      expect(mockUser.resetPasswordExpires).toBeDefined();
      expect(mockUser.save).toHaveBeenCalled();
      expect(sendEmail).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: expect.any(String) });
    });
    
    it('should return 200 even if email does not exist (for security)', async () => {
      // Setup
      req.body = {
        email: 'nonexistent@example.com'
      };
      
      User.findOne.mockResolvedValue(null);
      
      // Execute
      await authController.forgotPassword(req, res);
      
      // Assert
      expect(User.findOne).toHaveBeenCalledWith({ email: 'nonexistent@example.com' });
      expect(sendEmail).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: expect.any(String) });
    });
    
    it('should handle email sending errors', async () => {
      // Setup
      req.body = {
        email: 'user@example.com'
      };
      
      const mockUser = {
        email: 'user@example.com',
        save: jest.fn().mockResolvedValue(true)
      };
      
      User.findOne.mockResolvedValue(mockUser);
      sendEmail.mockRejectedValue(new Error('Email error'));
      
      // Execute
      await authController.forgotPassword(req, res);
      
      // Assert
      expect(User.findOne).toHaveBeenCalledWith({ email: 'user@example.com' });
      expect(mockUser.resetPasswordToken).toBeDefined();
      expect(mockUser.save).toHaveBeenCalled();
      expect(sendEmail).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: expect.any(String) });
    });
  });
  
  describe('resetPassword', () => {
    it('should reset password with valid token', async () => {
      // Setup
      req.body = {
        token: 'valid-token',
        password: 'NewSecureP@ss123'
      };
      
      const mockUser = {
        resetPasswordToken: 'valid-token',
        resetPasswordExpires: new Date(Date.now() + 3600000), // 1 hour from now
        save: jest.fn().mockResolvedValue(true)
      };
      
      User.findOne.mockResolvedValue(mockUser);
      
      // Execute
      await authController.resetPassword(req, res);
      
      // Assert
      expect(User.findOne).toHaveBeenCalledWith({
        resetPasswordToken: 'valid-token',
        resetPasswordExpires: { $gt: expect.any(Number) }
      });
      expect(mockUser.password).toBe('NewSecureP@ss123');
      expect(mockUser.resetPasswordToken).toBeUndefined();
      expect(mockUser.resetPasswordExpires).toBeUndefined();
      expect(mockUser.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: expect.any(String) });
    });
    
    it('should return 400 for invalid or expired token', async () => {
      // Setup
      req.body = {
        token: 'invalid-token',
        password: 'NewSecureP@ss123'
      };
      
      User.findOne.mockResolvedValue(null);
      
      // Execute
      await authController.resetPassword(req, res);
      
      // Assert
      expect(User.findOne).toHaveBeenCalledWith({
        resetPasswordToken: 'invalid-token',
        resetPasswordExpires: { $gt: expect.any(Number) }
      });
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: expect.any(String) });
    });
    
    it('should handle validation errors', async () => {
      // Setup
      req.body = {
        token: 'valid-token',
        password: 'short'
      };
      
      const mockUser = {
        resetPasswordToken: 'valid-token',
        resetPasswordExpires: new Date(Date.now() + 3600000), // 1 hour from now
        save: jest.fn().mockRejectedValue(new Error('Validation error'))
      };
      
      User.findOne.mockResolvedValue(mockUser);
      
      // Execute
      await authController.resetPassword(req, res);
      
      // Assert
      expect(User.findOne).toHaveBeenCalled();
      expect(mockUser.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: expect.any(String) });
    });
  });
});
