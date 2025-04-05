const mongoose = require('mongoose');
const Visitor = require('../../../src/models/Visitor');

describe('Visitor Model', () => {
  describe('Validation', () => {
    it('should create a valid visitor', async () => {
      const userId = new mongoose.Types.ObjectId();
      const visitorData = {
        name: 'John Doe',
        company: 'ABC Corp',
        host: userId,
        purpose: 'Meeting',
        visitDate: new Date()
      };
      
      const visitor = new Visitor(visitorData);
      await expect(visitor.save()).resolves.not.toThrow();
    });
    
    it('should require name', async () => {
      const userId = new mongoose.Types.ObjectId();
      const visitorData = {
        company: 'ABC Corp',
        host: userId,
        purpose: 'Meeting',
        visitDate: new Date()
      };
      
      const visitor = new Visitor(visitorData);
      await expect(visitor.save()).rejects.toThrow();
    });
    
    it('should require host', async () => {
      const visitorData = {
        name: 'John Doe',
        company: 'ABC Corp',
        purpose: 'Meeting',
        visitDate: new Date()
      };
      
      const visitor = new Visitor(visitorData);
      await expect(visitor.save()).rejects.toThrow();
    });
    
    it('should require purpose', async () => {
      const userId = new mongoose.Types.ObjectId();
      const visitorData = {
        name: 'John Doe',
        company: 'ABC Corp',
        host: userId,
        visitDate: new Date()
      };
      
      const visitor = new Visitor(visitorData);
      await expect(visitor.save()).rejects.toThrow();
    });
    
    it('should require visitDate', async () => {
      const userId = new mongoose.Types.ObjectId();
      const visitorData = {
        name: 'John Doe',
        company: 'ABC Corp',
        host: userId,
        purpose: 'Meeting'
      };
      
      const visitor = new Visitor(visitorData);
      await expect(visitor.save()).rejects.toThrow();
    });
    
    it('should set default status to pre-registered', async () => {
      const userId = new mongoose.Types.ObjectId();
      const visitorData = {
        name: 'John Doe',
        company: 'ABC Corp',
        host: userId,
        purpose: 'Meeting',
        visitDate: new Date()
      };
      
      const visitor = new Visitor(visitorData);
      await visitor.save();
      
      expect(visitor.status).toBe('pre-registered');
    });
    
    it('should only allow valid status values', async () => {
      const userId = new mongoose.Types.ObjectId();
      const visitorData = {
        name: 'John Doe',
        company: 'ABC Corp',
        host: userId,
        purpose: 'Meeting',
        visitDate: new Date(),
        status: 'InvalidStatus'
      };
      
      const visitor = new Visitor(visitorData);
      await expect(visitor.save()).rejects.toThrow();
    });
    
    it('should set createdAt and updatedAt timestamps', async () => {
      const userId = new mongoose.Types.ObjectId();
      const visitorData = {
        name: 'John Doe',
        company: 'ABC Corp',
        host: userId,
        purpose: 'Meeting',
        visitDate: new Date()
      };
      
      const visitor = new Visitor(visitorData);
      await visitor.save();
      
      expect(visitor.createdAt).toBeDefined();
      expect(visitor.updatedAt).toBeDefined();
      expect(visitor.createdAt instanceof Date).toBe(true);
      expect(visitor.updatedAt instanceof Date).toBe(true);
    });
  });
});
