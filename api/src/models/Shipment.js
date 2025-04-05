const mongoose = require('mongoose');

const shipmentSchema = new mongoose.Schema({
  trackingNumber: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  carrier: {
    type: String,
    required: true,
    trim: true
  },
  sender: {
    type: String,
    required: true,
    trim: true
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['Package', 'Document', 'Pallet', 'Other'],
    required: true
  },
  status: {
    type: String,
    enum: ['received', 'in-transit', 'delivered'],
    default: 'received'
  },
  receivedTime: {
    type: Date,
    default: Date.now
  },
  deliveredTime: {
    type: Date
  },
  notes: {
    type: String,
    trim: true
  },
  handlingInstructions: {
    type: String,
    trim: true
  },
  weight: {
    type: Number
  },
  dimensions: {
    length: Number,
    width: Number,
    height: Number
  },
  photoUrl: {
    type: String
  },
  signatureUrl: {
    type: String
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Add index for efficient queries
shipmentSchema.index({ trackingNumber: 1 });
shipmentSchema.index({ recipient: 1, status: 1 });
shipmentSchema.index({ receivedTime: 1 });

const Shipment = mongoose.model('Shipment', shipmentSchema);

module.exports = Shipment;
