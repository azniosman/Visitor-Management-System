const mongoose = require('mongoose');
const Key = require('../../../src/models/Key');

describe('Key Model', () => {
  describe('Validation', () => {
    it('should create a valid key', async () => {
      const userId = new mongoose.Types.ObjectId();
      const keyData = {
        keyName: 'Server Room',
        keyNumber: 'K001',
        area: 'IT Department',
        createdBy: userId
      };
      
      const key = new Key(keyData);
      await expect(key.save()).resolves.not.toThrow();
    });
    
    it('should require keyName', async () => {
      const userId = new mongoose.Types.ObjectId();
      const keyData = {
        keyNumber: 'K001',
        area: 'IT Department',
        createdBy: userId
      };
      
      const key = new Key(keyData);
      await expect(key.save()).rejects.toThrow();
    });
    
    it('should require keyNumber', async () => {
      const userId = new mongoose.Types.ObjectId();
      const keyData = {
        keyName: 'Server Room',
        area: 'IT Department',
        createdBy: userId
      };
      
      const key = new Key(keyData);
      await expect(key.save()).rejects.toThrow();
    });
    
    it('should require area', async () => {
      const userId = new mongoose.Types.ObjectId();
      const keyData = {
        keyName: 'Server Room',
        keyNumber: 'K001',
        createdBy: userId
      };
      
      const key = new Key(keyData);
      await expect(key.save()).rejects.toThrow();
    });
    
    it('should require createdBy', async () => {
      const keyData = {
        keyName: 'Server Room',
        keyNumber: 'K001',
        area: 'IT Department'
      };
      
      const key = new Key(keyData);
      await expect(key.save()).rejects.toThrow();
    });
    
    it('should set default status to available', async () => {
      const userId = new mongoose.Types.ObjectId();
      const keyData = {
        keyName: 'Server Room',
        keyNumber: 'K001',
        area: 'IT Department',
        createdBy: userId
      };
      
      const key = new Key(keyData);
      await key.save();
      
      expect(key.status).toBe('available');
    });
    
    it('should only allow valid status values', async () => {
      const userId = new mongoose.Types.ObjectId();
      const keyData = {
        keyName: 'Server Room',
        keyNumber: 'K001',
        area: 'IT Department',
        status: 'InvalidStatus',
        createdBy: userId
      };
      
      const key = new Key(keyData);
      await expect(key.save()).rejects.toThrow();
    });
    
    it('should only allow valid accessLevel values', async () => {
      const userId = new mongoose.Types.ObjectId();
      const keyData = {
        keyName: 'Server Room',
        keyNumber: 'K001',
        area: 'IT Department',
        accessLevel: 'InvalidLevel',
        createdBy: userId
      };
      
      const key = new Key(keyData);
      await expect(key.save()).rejects.toThrow();
    });
    
    it('should set default accessLevel to Low', async () => {
      const userId = new mongoose.Types.ObjectId();
      const keyData = {
        keyName: 'Server Room',
        keyNumber: 'K001',
        area: 'IT Department',
        createdBy: userId
      };
      
      const key = new Key(keyData);
      await key.save();
      
      expect(key.accessLevel).toBe('Low');
    });
    
    it('should only allow valid authorizedRoles values', async () => {
      const userId = new mongoose.Types.ObjectId();
      const keyData = {
        keyName: 'Server Room',
        keyNumber: 'K001',
        area: 'IT Department',
        authorizedRoles: ['InvalidRole'],
        createdBy: userId
      };
      
      const key = new Key(keyData);
      await expect(key.save()).rejects.toThrow();
    });
  });
});
