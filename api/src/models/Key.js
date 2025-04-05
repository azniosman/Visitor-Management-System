const mongoose = require('mongoose');

const keySchema = new mongoose.Schema({
  keyName: {
    type: String,
    required: true,
    trim: true
  },
  keyNumber: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  area: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['available', 'checked-out'],
    default: 'available'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  checkoutTime: {
    type: Date
  },
  returnTime: {
    type: Date
  },
  expectedReturnTime: {
    type: Date
  },
  notes: {
    type: String,
    trim: true
  },
  accessLevel: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Low'
  },
  authorizedRoles: [{
    type: String,
    enum: ['Admin', 'Security', 'Employee', 'Reception']
  }],
  location: {
    type: String,
    trim: true
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
keySchema.index({ keyNumber: 1 });
keySchema.index({ status: 1 });
keySchema.index({ assignedTo: 1 });

const Key = mongoose.model('Key', keySchema);

module.exports = Key;
