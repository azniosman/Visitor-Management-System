const Key = require("../models/Key");
const User = require("../models/User");
const { sendNotification } = require("../utils/notifications");

// Get all keys
exports.getAllKeys = async (req, res) => {
  try {
    const keys = await Key.find()
      .populate("assignedTo", "name email department")
      .populate("createdBy", "name")
      .populate("updatedBy", "name")
      .sort({ keyName: 1 });

    res.status(200).json(keys);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get key by ID
exports.getKeyById = async (req, res) => {
  try {
    const key = await Key.findById(req.params.id)
      .populate("assignedTo", "name email department")
      .populate("createdBy", "name")
      .populate("updatedBy", "name");

    if (!key) {
      return res.status(404).json({ message: "Key not found" });
    }

    res.status(200).json(key);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create new key
exports.createKey = async (req, res) => {
  try {
    // Check if user has permission to create keys
    if (!["Admin", "Security"].includes(req.user.role)) {
      return res.status(403).json({ message: "Permission denied" });
    }

    const key = new Key({
      ...req.body,
      createdBy: req.user._id,
    });

    await key.save();

    res.status(201).json(key);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update key
exports.updateKey = async (req, res) => {
  try {
    // Check if user has permission to update keys
    if (!["Admin", "Security"].includes(req.user.role)) {
      return res.status(403).json({ message: "Permission denied" });
    }

    const key = await Key.findById(req.params.id);

    if (!key) {
      return res.status(404).json({ message: "Key not found" });
    }

    // Update fields
    Object.keys(req.body).forEach((field) => {
      key[field] = req.body[field];
    });

    // Add updatedBy field
    key.updatedBy = req.user._id;

    await key.save();

    res.status(200).json(key);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete key
exports.deleteKey = async (req, res) => {
  try {
    // Check if user has permission to delete keys
    if (!["Admin", "Security"].includes(req.user.role)) {
      return res.status(403).json({ message: "Permission denied" });
    }

    const key = await Key.findById(req.params.id);

    if (!key) {
      return res.status(404).json({ message: "Key not found" });
    }

    // Don't allow deletion of checked-out keys
    if (key.status === "checked-out") {
      return res
        .status(400)
        .json({ message: "Cannot delete a checked-out key" });
    }

    await Key.deleteOne({ _id: req.params.id });

    res.status(200).json({ message: "Key deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Checkout key
exports.checkoutKey = async (req, res) => {
  try {
    const key = await Key.findById(req.params.id);

    if (!key) {
      return res.status(404).json({ message: "Key not found" });
    }

    // Check if key is available
    if (key.status !== "available") {
      return res
        .status(400)
        .json({ message: "Key is not available for checkout" });
    }

    // Check if user has permission to checkout this key
    if (key.authorizedRoles && key.authorizedRoles.length > 0) {
      if (!key.authorizedRoles.includes(req.user.role)) {
        return res
          .status(403)
          .json({ message: "You are not authorized to checkout this key" });
      }
    }

    // Get the user to assign the key to
    let assignedUserId = req.user._id;

    // If a different user ID is provided and the current user is Admin or Security
    if (req.body.assignedTo && ["Admin", "Security"].includes(req.user.role)) {
      assignedUserId = req.body.assignedTo;
    }

    // Update key status
    key.status = "checked-out";
    key.assignedTo = assignedUserId;
    key.checkoutTime = new Date();
    key.returnTime = null;
    key.updatedBy = req.user._id;

    // Set expected return time if provided
    if (req.body.expectedReturnTime) {
      key.expectedReturnTime = new Date(req.body.expectedReturnTime);
    }

    await key.save();

    // Notify security team if it's a high-access key
    if (["High", "Critical"].includes(key.accessLevel)) {
      try {
        const securityUsers = await User.find({
          role: "Security",
          status: "active",
        });

        for (const user of securityUsers) {
          const notificationData = {
            type: "key_checkout_alert",
            recipient: user,
            data: {
              keyId: key._id,
              keyName: key.keyName,
              keyNumber: key.keyNumber,
              assignedTo: await User.findById(assignedUserId).select("name"),
              checkoutTime: key.checkoutTime,
            },
          };

          await sendNotification(notificationData);
        }
      } catch (notificationError) {
        console.error("Error sending notification:", notificationError);
      }
    }

    res.status(200).json(key);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Return key
exports.returnKey = async (req, res) => {
  try {
    const key = await Key.findById(req.params.id);

    if (!key) {
      return res.status(404).json({ message: "Key not found" });
    }

    // Check if key is checked out
    if (key.status !== "checked-out") {
      return res.status(400).json({ message: "Key is not checked out" });
    }

    // Update key status
    key.status = "available";
    key.returnTime = new Date();
    key.updatedBy = req.user._id;

    // Keep the assignedTo field for record-keeping
    const previousAssignee = key.assignedTo;
    key.assignedTo = null;

    await key.save();

    // Notify the previous assignee
    try {
      const assignee = await User.findById(previousAssignee);

      if (assignee) {
        const notificationData = {
          type: "key_returned",
          recipient: assignee,
          data: {
            keyId: key._id,
            keyName: key.keyName,
            keyNumber: key.keyNumber,
            returnTime: key.returnTime,
          },
        };

        await sendNotification(notificationData);
      }
    } catch (notificationError) {
      console.error("Error sending notification:", notificationError);
    }

    res.status(200).json(key);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get keys by status
exports.getKeysByStatus = async (req, res) => {
  try {
    const keys = await Key.find({ status: req.params.status })
      .populate("assignedTo", "name email department")
      .populate("createdBy", "name")
      .sort({ keyName: 1 });

    res.status(200).json(keys);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get keys by assigned user
exports.getKeysByAssignedUser = async (req, res) => {
  try {
    const keys = await Key.find({ assignedTo: req.params.userId })
      .populate("assignedTo", "name email department")
      .populate("createdBy", "name")
      .sort({ checkoutTime: -1 });

    res.status(200).json(keys);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get keys by access level
exports.getKeysByAccessLevel = async (req, res) => {
  try {
    const keys = await Key.find({ accessLevel: req.params.level })
      .populate("assignedTo", "name email department")
      .populate("createdBy", "name")
      .sort({ keyName: 1 });

    res.status(200).json(keys);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
