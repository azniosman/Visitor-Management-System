const Shipment = require("../models/Shipment");
const User = require("../models/User");
const { sendNotification } = require("../utils/notifications");

// Get all shipments
exports.getAllShipments = async (req, res) => {
  try {
    const shipments = await Shipment.find()
      .populate("recipient", "name email department")
      .populate("createdBy", "name")
      .populate("updatedBy", "name")
      .sort({ receivedTime: -1 });

    res.status(200).json(shipments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get shipment by ID
exports.getShipmentById = async (req, res) => {
  try {
    const shipment = await Shipment.findById(req.params.id)
      .populate("recipient", "name email department")
      .populate("createdBy", "name")
      .populate("updatedBy", "name");

    if (!shipment) {
      return res.status(404).json({ message: "Shipment not found" });
    }

    res.status(200).json(shipment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create new shipment
exports.createShipment = async (req, res) => {
  try {
    const shipment = new Shipment({
      ...req.body,
      createdBy: req.user._id,
    });

    await shipment.save();

    // Notify recipient
    try {
      const recipient = await User.findById(shipment.recipient);

      if (recipient) {
        const notificationData = {
          type: "shipment_received",
          recipient: recipient,
          data: {
            shipmentId: shipment._id,
            trackingNumber: shipment.trackingNumber,
            sender: shipment.sender,
          },
        };

        await sendNotification(notificationData);
      }
    } catch (notificationError) {
      console.error("Error sending notification:", notificationError);
    }

    res.status(201).json(shipment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update shipment
exports.updateShipment = async (req, res) => {
  try {
    const shipment = await Shipment.findById(req.params.id);

    if (!shipment) {
      return res.status(404).json({ message: "Shipment not found" });
    }

    // Update fields
    Object.keys(req.body).forEach((key) => {
      shipment[key] = req.body[key];
    });

    // Add updatedBy field
    shipment.updatedBy = req.user._id;

    await shipment.save();

    res.status(200).json(shipment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete shipment
exports.deleteShipment = async (req, res) => {
  try {
    const shipment = await Shipment.findById(req.params.id);

    if (!shipment) {
      return res.status(404).json({ message: "Shipment not found" });
    }

    await Shipment.deleteOne({ _id: req.params.id });

    res.status(200).json({ message: "Shipment deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mark shipment as in-transit
exports.markInTransit = async (req, res) => {
  try {
    const shipment = await Shipment.findById(req.params.id);

    if (!shipment) {
      return res.status(404).json({ message: "Shipment not found" });
    }

    shipment.status = "in-transit";
    shipment.updatedBy = req.user._id;

    await shipment.save();

    res.status(200).json(shipment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Mark shipment as delivered
exports.markDelivered = async (req, res) => {
  try {
    const shipment = await Shipment.findById(req.params.id);

    if (!shipment) {
      return res.status(404).json({ message: "Shipment not found" });
    }

    shipment.status = "delivered";
    shipment.deliveredTime = new Date();
    shipment.updatedBy = req.user._id;

    // Add signature if provided
    if (req.body.signatureUrl) {
      shipment.signatureUrl = req.body.signatureUrl;
    }

    await shipment.save();

    // Notify recipient
    try {
      const recipient = await User.findById(shipment.recipient);

      if (recipient) {
        const notificationData = {
          type: "shipment_delivered",
          recipient: recipient,
          data: {
            shipmentId: shipment._id,
            trackingNumber: shipment.trackingNumber,
            deliveredTime: shipment.deliveredTime,
          },
        };

        await sendNotification(notificationData);
      }
    } catch (notificationError) {
      console.error("Error sending notification:", notificationError);
    }

    res.status(200).json(shipment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get shipments by recipient
exports.getShipmentsByRecipient = async (req, res) => {
  try {
    const shipments = await Shipment.find({ recipient: req.params.recipientId })
      .populate("recipient", "name email department")
      .populate("createdBy", "name")
      .sort({ receivedTime: -1 });

    res.status(200).json(shipments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get shipments by status
exports.getShipmentsByStatus = async (req, res) => {
  try {
    const shipments = await Shipment.find({ status: req.params.status })
      .populate("recipient", "name email department")
      .populate("createdBy", "name")
      .sort({ receivedTime: -1 });

    res.status(200).json(shipments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
