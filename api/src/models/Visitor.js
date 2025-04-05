const mongoose = require("mongoose");
const { fieldEncryption } = require("../utils/encryption");

const visitorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    company: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    host: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    purpose: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: [
        "pre-registered",
        "approved",
        "rejected",
        "checked-in",
        "checked-out",
      ],
      default: "pre-registered",
    },
    visitDate: {
      type: Date,
      required: true,
    },
    checkInTime: {
      type: Date,
    },
    checkOutTime: {
      type: Date,
    },
    photoUrl: {
      type: String,
    },
    idScanUrl: {
      type: String,
    },
    notes: {
      type: String,
      trim: true,
    },
    aiAnalysis: {
      sentiment: {
        type: Object,
      },
      securityConcerns: [String],
      watchlistMatch: {
        type: Boolean,
        default: false,
      },
    },
    badgePrinted: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Apply field encryption to PII fields
visitorSchema.plugin(fieldEncryption(["name", "email", "phone"]));

// Add index for efficient queries
visitorSchema.index({ host: 1, status: 1 });
visitorSchema.index({ visitDate: 1 });

const Visitor = mongoose.model("Visitor", visitorSchema);

module.exports = Visitor;
