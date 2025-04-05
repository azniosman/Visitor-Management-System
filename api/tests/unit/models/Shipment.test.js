const mongoose = require('mongoose');
const Shipment = require('../../../src/models/Shipment');

describe('Shipment Model', () => {
  describe('Validation', () => {
    it('should create a valid shipment', async () => {
      const userId = new mongoose.Types.ObjectId();
      const shipmentData = {
        trackingNumber: 'TRK123456789',
        carrier: 'FedEx',
        sender: 'ABC Corp',
        recipient: userId,
        type: 'Package',
        status: 'received',
        createdBy: userId
      };
      
      const shipment = new Shipment(shipmentData);
      await expect(shipment.save()).resolves.not.toThrow();
    });
    
    it('should require trackingNumber', async () => {
      const userId = new mongoose.Types.ObjectId();
      const shipmentData = {
        carrier: 'FedEx',
        sender: 'ABC Corp',
        recipient: userId,
        type: 'Package',
        createdBy: userId
      };
      
      const shipment = new Shipment(shipmentData);
      await expect(shipment.save()).rejects.toThrow();
    });
    
    it('should require carrier', async () => {
      const userId = new mongoose.Types.ObjectId();
      const shipmentData = {
        trackingNumber: 'TRK123456789',
        sender: 'ABC Corp',
        recipient: userId,
        type: 'Package',
        createdBy: userId
      };
      
      const shipment = new Shipment(shipmentData);
      await expect(shipment.save()).rejects.toThrow();
    });
    
    it('should require sender', async () => {
      const userId = new mongoose.Types.ObjectId();
      const shipmentData = {
        trackingNumber: 'TRK123456789',
        carrier: 'FedEx',
        recipient: userId,
        type: 'Package',
        createdBy: userId
      };
      
      const shipment = new Shipment(shipmentData);
      await expect(shipment.save()).rejects.toThrow();
    });
    
    it('should require recipient', async () => {
      const userId = new mongoose.Types.ObjectId();
      const shipmentData = {
        trackingNumber: 'TRK123456789',
        carrier: 'FedEx',
        sender: 'ABC Corp',
        type: 'Package',
        createdBy: userId
      };
      
      const shipment = new Shipment(shipmentData);
      await expect(shipment.save()).rejects.toThrow();
    });
    
    it('should require type', async () => {
      const userId = new mongoose.Types.ObjectId();
      const shipmentData = {
        trackingNumber: 'TRK123456789',
        carrier: 'FedEx',
        sender: 'ABC Corp',
        recipient: userId,
        createdBy: userId
      };
      
      const shipment = new Shipment(shipmentData);
      await expect(shipment.save()).rejects.toThrow();
    });
    
    it('should only allow valid types', async () => {
      const userId = new mongoose.Types.ObjectId();
      const shipmentData = {
        trackingNumber: 'TRK123456789',
        carrier: 'FedEx',
        sender: 'ABC Corp',
        recipient: userId,
        type: 'InvalidType',
        createdBy: userId
      };
      
      const shipment = new Shipment(shipmentData);
      await expect(shipment.save()).rejects.toThrow();
    });
    
    it('should only allow valid status values', async () => {
      const userId = new mongoose.Types.ObjectId();
      const shipmentData = {
        trackingNumber: 'TRK123456789',
        carrier: 'FedEx',
        sender: 'ABC Corp',
        recipient: userId,
        type: 'Package',
        status: 'InvalidStatus',
        createdBy: userId
      };
      
      const shipment = new Shipment(shipmentData);
      await expect(shipment.save()).rejects.toThrow();
    });
    
    it('should set default status to received', async () => {
      const userId = new mongoose.Types.ObjectId();
      const shipmentData = {
        trackingNumber: 'TRK123456789',
        carrier: 'FedEx',
        sender: 'ABC Corp',
        recipient: userId,
        type: 'Package',
        createdBy: userId
      };
      
      const shipment = new Shipment(shipmentData);
      await shipment.save();
      
      expect(shipment.status).toBe('received');
    });
    
    it('should set receivedTime to current time by default', async () => {
      const userId = new mongoose.Types.ObjectId();
      const shipmentData = {
        trackingNumber: 'TRK123456789',
        carrier: 'FedEx',
        sender: 'ABC Corp',
        recipient: userId,
        type: 'Package',
        createdBy: userId
      };
      
      const shipment = new Shipment(shipmentData);
      await shipment.save();
      
      expect(shipment.receivedTime).toBeDefined();
      expect(shipment.receivedTime instanceof Date).toBe(true);
    });
  });
});
