const visitorController = require('../../../src/controllers/visitorController');
const Visitor = require('../../../src/models/Visitor');
const AWS = require('aws-sdk');

// Mock dependencies
jest.mock('../../../src/models/Visitor');
jest.mock('aws-sdk');

describe('Visitor Controller', () => {
  let req, res, next;
  
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Mock request and response objects
    req = {
      body: {},
      params: {},
      file: null,
      user: {
        _id: 'user-id'
      }
    };
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    
    next = jest.fn();
    
    // Mock AWS services
    AWS.Rekognition.prototype.detectFaces = jest.fn().mockReturnValue({
      promise: jest.fn().mockResolvedValue({
        FaceDetails: [{ BoundingBox: {}, Confidence: 99.9 }]
      })
    });
    
    AWS.Comprehend.prototype.detectSentiment = jest.fn().mockReturnValue({
      promise: jest.fn().mockResolvedValue({
        Sentiment: 'POSITIVE',
        SentimentScore: {
          Positive: 0.9,
          Negative: 0.01,
          Neutral: 0.09,
          Mixed: 0
        }
      })
    });
  });
  
  describe('getAllVisitors', () => {
    it('should get all visitors', async () => {
      // Setup
      const mockVisitors = [
        { id: 1, name: 'Visitor 1' },
        { id: 2, name: 'Visitor 2' }
      ];
      
      Visitor.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockVisitors)
      });
      
      // Execute
      await visitorController.getAllVisitors(req, res);
      
      // Assert
      expect(Visitor.find).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockVisitors);
    });
    
    it('should handle errors', async () => {
      // Setup
      Visitor.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockRejectedValue(new Error('Database error'))
      });
      
      // Execute
      await visitorController.getAllVisitors(req, res);
      
      // Assert
      expect(Visitor.find).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: expect.any(String) });
    });
  });
  
  describe('getVisitorById', () => {
    it('should get a visitor by ID', async () => {
      // Setup
      req.params.id = 'visitor-id';
      
      const mockVisitor = {
        _id: 'visitor-id',
        name: 'Test Visitor',
        host: 'host-id'
      };
      
      Visitor.findById.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockVisitor)
      });
      
      // Execute
      await visitorController.getVisitorById(req, res);
      
      // Assert
      expect(Visitor.findById).toHaveBeenCalledWith('visitor-id');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockVisitor);
    });
    
    it('should return 404 for non-existent visitor', async () => {
      // Setup
      req.params.id = 'nonexistent-id';
      
      Visitor.findById.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(null)
      });
      
      // Execute
      await visitorController.getVisitorById(req, res);
      
      // Assert
      expect(Visitor.findById).toHaveBeenCalledWith('nonexistent-id');
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: expect.any(String) });
    });
    
    it('should handle errors', async () => {
      // Setup
      req.params.id = 'visitor-id';
      
      Visitor.findById.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockRejectedValue(new Error('Database error'))
      });
      
      // Execute
      await visitorController.getVisitorById(req, res);
      
      // Assert
      expect(Visitor.findById).toHaveBeenCalledWith('visitor-id');
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: expect.any(String) });
    });
  });
  
  describe('createVisitor', () => {
    it('should create a new visitor', async () => {
      // Setup
      req.body = {
        name: 'New Visitor',
        company: 'ABC Corp',
        host: 'host-id',
        purpose: 'Meeting',
        visitDate: '2023-01-01'
      };
      
      const mockVisitor = {
        ...req.body,
        _id: 'new-visitor-id',
        save: jest.fn().mockResolvedValue(true)
      };
      
      Visitor.mockImplementation(() => mockVisitor);
      
      // Execute
      await visitorController.createVisitor(req, res);
      
      // Assert
      expect(Visitor).toHaveBeenCalledWith(req.body);
      expect(mockVisitor.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockVisitor);
    });
    
    it('should analyze visitor notes with AWS Comprehend', async () => {
      // Setup
      req.body = {
        name: 'New Visitor',
        company: 'ABC Corp',
        host: 'host-id',
        purpose: 'Meeting',
        visitDate: '2023-01-01',
        notes: 'This is a test note for sentiment analysis'
      };
      
      const mockVisitor = {
        ...req.body,
        _id: 'new-visitor-id',
        aiAnalysis: {},
        save: jest.fn().mockResolvedValue(true)
      };
      
      Visitor.mockImplementation(() => mockVisitor);
      
      // Execute
      await visitorController.createVisitor(req, res);
      
      // Assert
      expect(Visitor).toHaveBeenCalledWith(req.body);
      expect(AWS.Comprehend.prototype.detectSentiment).toHaveBeenCalled();
      expect(mockVisitor.aiAnalysis).toBeDefined();
      expect(mockVisitor.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockVisitor);
    });
    
    it('should handle validation errors', async () => {
      // Setup
      req.body = {
        // Missing required fields
        name: 'New Visitor'
      };
      
      const mockVisitor = {
        ...req.body,
        save: jest.fn().mockRejectedValue(new Error('Validation error'))
      };
      
      Visitor.mockImplementation(() => mockVisitor);
      
      // Execute
      await visitorController.createVisitor(req, res);
      
      // Assert
      expect(Visitor).toHaveBeenCalledWith(req.body);
      expect(mockVisitor.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: expect.any(String) });
    });
  });
  
  describe('updateVisitor', () => {
    it('should update a visitor', async () => {
      // Setup
      req.params.id = 'visitor-id';
      req.body = {
        name: 'Updated Visitor',
        company: 'Updated Corp'
      };
      
      const mockVisitor = {
        _id: 'visitor-id',
        name: 'Original Visitor',
        company: 'Original Corp',
        save: jest.fn().mockResolvedValue(true)
      };
      
      Visitor.findById.mockResolvedValue(mockVisitor);
      
      // Execute
      await visitorController.updateVisitor(req, res);
      
      // Assert
      expect(Visitor.findById).toHaveBeenCalledWith('visitor-id');
      expect(mockVisitor.name).toBe('Updated Visitor');
      expect(mockVisitor.company).toBe('Updated Corp');
      expect(mockVisitor.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockVisitor);
    });
    
    it('should return 404 for non-existent visitor', async () => {
      // Setup
      req.params.id = 'nonexistent-id';
      req.body = {
        name: 'Updated Visitor'
      };
      
      Visitor.findById.mockResolvedValue(null);
      
      // Execute
      await visitorController.updateVisitor(req, res);
      
      // Assert
      expect(Visitor.findById).toHaveBeenCalledWith('nonexistent-id');
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: expect.any(String) });
    });
    
    it('should handle validation errors', async () => {
      // Setup
      req.params.id = 'visitor-id';
      req.body = {
        visitDate: 'invalid-date'
      };
      
      const mockVisitor = {
        _id: 'visitor-id',
        save: jest.fn().mockRejectedValue(new Error('Validation error'))
      };
      
      Visitor.findById.mockResolvedValue(mockVisitor);
      
      // Execute
      await visitorController.updateVisitor(req, res);
      
      // Assert
      expect(Visitor.findById).toHaveBeenCalledWith('visitor-id');
      expect(mockVisitor.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: expect.any(String) });
    });
  });
  
  describe('deleteVisitor', () => {
    it('should delete a visitor', async () => {
      // Setup
      req.params.id = 'visitor-id';
      
      const mockVisitor = {
        _id: 'visitor-id',
        name: 'Visitor to Delete'
      };
      
      Visitor.findById.mockResolvedValue(mockVisitor);
      Visitor.deleteOne.mockResolvedValue({ deletedCount: 1 });
      
      // Execute
      await visitorController.deleteVisitor(req, res);
      
      // Assert
      expect(Visitor.findById).toHaveBeenCalledWith('visitor-id');
      expect(Visitor.deleteOne).toHaveBeenCalledWith({ _id: 'visitor-id' });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: expect.any(String) });
    });
    
    it('should return 404 for non-existent visitor', async () => {
      // Setup
      req.params.id = 'nonexistent-id';
      
      Visitor.findById.mockResolvedValue(null);
      
      // Execute
      await visitorController.deleteVisitor(req, res);
      
      // Assert
      expect(Visitor.findById).toHaveBeenCalledWith('nonexistent-id');
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: expect.any(String) });
    });
    
    it('should handle errors', async () => {
      // Setup
      req.params.id = 'visitor-id';
      
      const mockVisitor = {
        _id: 'visitor-id'
      };
      
      Visitor.findById.mockResolvedValue(mockVisitor);
      Visitor.deleteOne.mockRejectedValue(new Error('Database error'));
      
      // Execute
      await visitorController.deleteVisitor(req, res);
      
      // Assert
      expect(Visitor.findById).toHaveBeenCalledWith('visitor-id');
      expect(Visitor.deleteOne).toHaveBeenCalledWith({ _id: 'visitor-id' });
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: expect.any(String) });
    });
  });
  
  describe('checkInVisitor', () => {
    it('should check in a visitor', async () => {
      // Setup
      req.params.id = 'visitor-id';
      
      const mockVisitor = {
        _id: 'visitor-id',
        name: 'Visitor to Check In',
        status: 'pre-registered',
        save: jest.fn().mockResolvedValue(true)
      };
      
      Visitor.findById.mockResolvedValue(mockVisitor);
      
      // Execute
      await visitorController.checkInVisitor(req, res);
      
      // Assert
      expect(Visitor.findById).toHaveBeenCalledWith('visitor-id');
      expect(mockVisitor.status).toBe('checked-in');
      expect(mockVisitor.checkInTime).toBeDefined();
      expect(mockVisitor.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockVisitor);
    });
    
    it('should return 404 for non-existent visitor', async () => {
      // Setup
      req.params.id = 'nonexistent-id';
      
      Visitor.findById.mockResolvedValue(null);
      
      // Execute
      await visitorController.checkInVisitor(req, res);
      
      // Assert
      expect(Visitor.findById).toHaveBeenCalledWith('nonexistent-id');
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: expect.any(String) });
    });
    
    it('should handle errors', async () => {
      // Setup
      req.params.id = 'visitor-id';
      
      const mockVisitor = {
        _id: 'visitor-id',
        save: jest.fn().mockRejectedValue(new Error('Database error'))
      };
      
      Visitor.findById.mockResolvedValue(mockVisitor);
      
      // Execute
      await visitorController.checkInVisitor(req, res);
      
      // Assert
      expect(Visitor.findById).toHaveBeenCalledWith('visitor-id');
      expect(mockVisitor.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: expect.any(String) });
    });
  });
  
  describe('checkOutVisitor', () => {
    it('should check out a visitor', async () => {
      // Setup
      req.params.id = 'visitor-id';
      
      const mockVisitor = {
        _id: 'visitor-id',
        name: 'Visitor to Check Out',
        status: 'checked-in',
        save: jest.fn().mockResolvedValue(true)
      };
      
      Visitor.findById.mockResolvedValue(mockVisitor);
      
      // Execute
      await visitorController.checkOutVisitor(req, res);
      
      // Assert
      expect(Visitor.findById).toHaveBeenCalledWith('visitor-id');
      expect(mockVisitor.status).toBe('checked-out');
      expect(mockVisitor.checkOutTime).toBeDefined();
      expect(mockVisitor.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockVisitor);
    });
    
    it('should return 404 for non-existent visitor', async () => {
      // Setup
      req.params.id = 'nonexistent-id';
      
      Visitor.findById.mockResolvedValue(null);
      
      // Execute
      await visitorController.checkOutVisitor(req, res);
      
      // Assert
      expect(Visitor.findById).toHaveBeenCalledWith('nonexistent-id');
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: expect.any(String) });
    });
    
    it('should handle errors', async () => {
      // Setup
      req.params.id = 'visitor-id';
      
      const mockVisitor = {
        _id: 'visitor-id',
        save: jest.fn().mockRejectedValue(new Error('Database error'))
      };
      
      Visitor.findById.mockResolvedValue(mockVisitor);
      
      // Execute
      await visitorController.checkOutVisitor(req, res);
      
      // Assert
      expect(Visitor.findById).toHaveBeenCalledWith('visitor-id');
      expect(mockVisitor.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: expect.any(String) });
    });
  });
  
  describe('analyzeVisitorPhoto', () => {
    it('should analyze a visitor photo', async () => {
      // Setup
      req.file = {
        buffer: Buffer.from('mock-image-data')
      };
      
      // Execute
      await visitorController.analyzeVisitorPhoto(req, res);
      
      // Assert
      expect(AWS.Rekognition.prototype.detectFaces).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        facesDetected: 1,
        analysis: expect.any(Object)
      });
    });
    
    it('should return 400 if no photo is provided', async () => {
      // Setup
      req.file = null;
      
      // Execute
      await visitorController.analyzeVisitorPhoto(req, res);
      
      // Assert
      expect(AWS.Rekognition.prototype.detectFaces).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: expect.any(String) });
    });
    
    it('should handle AWS errors', async () => {
      // Setup
      req.file = {
        buffer: Buffer.from('mock-image-data')
      };
      
      AWS.Rekognition.prototype.detectFaces = jest.fn().mockReturnValue({
        promise: jest.fn().mockRejectedValue(new Error('AWS error'))
      });
      
      // Execute
      await visitorController.analyzeVisitorPhoto(req, res);
      
      // Assert
      expect(AWS.Rekognition.prototype.detectFaces).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: expect.any(String) });
    });
  });
  
  describe('checkWatchlist', () => {
    it('should check a visitor against the watchlist', async () => {
      // Setup
      req.file = {
        buffer: Buffer.from('mock-image-data')
      };
      
      // Execute
      await visitorController.checkWatchlist(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        watchlistMatch: false,
        confidence: expect.any(Number)
      });
    });
    
    it('should return 400 if no photo is provided', async () => {
      // Setup
      req.file = null;
      
      // Execute
      await visitorController.checkWatchlist(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: expect.any(String) });
    });
    
    it('should handle errors', async () => {
      // Setup
      req.file = {
        buffer: Buffer.from('mock-image-data')
      };
      
      // Mock an error
      const originalImplementation = visitorController.checkWatchlist;
      visitorController.checkWatchlist = jest.fn().mockImplementation(() => {
        throw new Error('Test error');
      });
      
      // Execute
      await visitorController.checkWatchlist(req, res);
      
      // Restore original implementation
      visitorController.checkWatchlist = originalImplementation;
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: expect.any(String) });
    });
  });
});
