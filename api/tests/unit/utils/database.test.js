const { connectDB, closeDB, createIndexes } = require('../../../src/utils/database');
const mongoose = require('mongoose');

// Mock dependencies
jest.mock('mongoose');

describe('Database Utility', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Mock environment variables
    process.env.MONGODB_URI = 'mongodb://localhost:27017/test';
    
    // Mock console methods to prevent test output pollution
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
    
    // Mock process.exit to prevent tests from exiting
    jest.spyOn(process, 'exit').mockImplementation(() => {});
    
    // Mock mongoose connection
    mongoose.connect.mockResolvedValue({
      connection: {
        host: 'localhost'
      }
    });
    
    mongoose.connection = {
      close: jest.fn().mockResolvedValue(true)
    };
    
    // Mock mongoose modelNames and model
    mongoose.modelNames = jest.fn().mockReturnValue(['User', 'Visitor', 'Shipment', 'Key']);
    mongoose.model = jest.fn().mockReturnValue({
      createIndexes: jest.fn().mockResolvedValue(true)
    });
  });
  
  afterEach(() => {
    // Restore mocks
    console.log.mockRestore();
    console.error.mockRestore();
    process.exit.mockRestore();
  });
  
  describe('connectDB', () => {
    it('should connect to MongoDB successfully', async () => {
      // Execute
      const result = await connectDB();
      
      // Assert
      expect(mongoose.connect).toHaveBeenCalledWith(
        'mongodb://localhost:27017/test',
        {
          useNewUrlParser: true,
          useUnifiedTopology: true
        }
      );
      
      expect(console.log).toHaveBeenCalledWith('MongoDB Connected: localhost');
      expect(result).toEqual({
        connection: {
          host: 'localhost'
        }
      });
    });
    
    it('should handle connection errors', async () => {
      // Setup
      mongoose.connect.mockRejectedValue(new Error('Connection error'));
      
      // Execute
      try {
        await connectDB();
      } catch (error) {
        // This should not be reached because we're mocking process.exit
      }
      
      // Assert
      expect(mongoose.connect).toHaveBeenCalled();
      expect(console.error).toHaveBeenCalledWith('Error connecting to MongoDB: Connection error');
      expect(process.exit).toHaveBeenCalledWith(1);
    });
  });
  
  describe('closeDB', () => {
    it('should close the MongoDB connection', async () => {
      // Execute
      await closeDB();
      
      // Assert
      expect(mongoose.connection.close).toHaveBeenCalled();
      expect(console.log).toHaveBeenCalledWith('MongoDB connection closed');
    });
    
    it('should handle close errors', async () => {
      // Setup
      mongoose.connection.close.mockRejectedValue(new Error('Close error'));
      
      // Execute
      try {
        await closeDB();
      } catch (error) {
        // This should not be reached because we're mocking process.exit
      }
      
      // Assert
      expect(mongoose.connection.close).toHaveBeenCalled();
      expect(console.error).toHaveBeenCalledWith('Error closing MongoDB connection: Close error');
      expect(process.exit).toHaveBeenCalledWith(1);
    });
  });
  
  describe('createIndexes', () => {
    it('should create indexes for all models', async () => {
      // Execute
      await createIndexes();
      
      // Assert
      expect(mongoose.modelNames).toHaveBeenCalled();
      expect(mongoose.model).toHaveBeenCalledTimes(4); // Once for each model
      expect(mongoose.model).toHaveBeenCalledWith('User');
      expect(mongoose.model).toHaveBeenCalledWith('Visitor');
      expect(mongoose.model).toHaveBeenCalledWith('Shipment');
      expect(mongoose.model).toHaveBeenCalledWith('Key');
      
      // Each model's createIndexes should be called
      expect(mongoose.model('User').createIndexes).toHaveBeenCalled();
      expect(mongoose.model('Visitor').createIndexes).toHaveBeenCalled();
      expect(mongoose.model('Shipment').createIndexes).toHaveBeenCalled();
      expect(mongoose.model('Key').createIndexes).toHaveBeenCalled();
      
      expect(console.log).toHaveBeenCalledWith('Database indexes created successfully');
    });
    
    it('should handle errors', async () => {
      // Setup
      mongoose.modelNames.mockImplementation(() => {
        throw new Error('Index error');
      });
      
      // Execute
      await createIndexes();
      
      // Assert
      expect(mongoose.modelNames).toHaveBeenCalled();
      expect(console.error).toHaveBeenCalledWith('Error creating database indexes: Index error');
    });
  });
});
