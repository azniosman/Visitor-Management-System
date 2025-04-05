const User = require("../models/User");
const bcrypt = require("bcryptjs");

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("-password -tokens")
      .sort({ name: 1 });

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get user by ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password -tokens");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Only allow users to view their own profile or admins to view any profile
    if (
      req.user.role !== "Admin" &&
      req.user._id.toString() !== req.params.id
    ) {
      return res.status(403).json({ message: "Permission denied" });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create new user
exports.createUser = async (req, res) => {
  try {
    // Check if email already exists
    const existingUser = await User.findOne({ email: req.body.email });

    if (existingUser) {
      return res.status(400).json({ message: "Email already in use" });
    }

    const user = new User(req.body);

    await user.save();

    // Remove sensitive data before sending response
    const userResponse = user.toObject();
    delete userResponse.password;
    delete userResponse.tokens;

    res.status(201).json(userResponse);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update user
exports.updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Only allow users to update their own profile or admins to update any profile
    if (
      req.user.role !== "Admin" &&
      req.user._id.toString() !== req.params.id
    ) {
      return res.status(403).json({ message: "Permission denied" });
    }

    // Don't allow role changes unless admin
    if (req.body.role && req.user.role !== "Admin") {
      return res.status(403).json({ message: "Only admins can change roles" });
    }

    // Update allowed fields
    const allowedUpdates = [
      "name",
      "email",
      "department",
      "phone",
      "profilePicture",
      "notificationPreferences",
    ];

    // Admins can update additional fields
    if (req.user.role === "Admin") {
      allowedUpdates.push("role", "status");
    }

    const updates = Object.keys(req.body);

    updates.forEach((update) => {
      if (allowedUpdates.includes(update)) {
        user[update] = req.body[update];
      }
    });

    await user.save();

    // Remove sensitive data before sending response
    const userResponse = user.toObject();
    delete userResponse.password;
    delete userResponse.tokens;

    res.status(200).json(userResponse);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await User.deleteOne({ _id: req.params.id });

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get current user profile
exports.getCurrentUser = async (req, res) => {
  try {
    // User is already attached to req by auth middleware
    const userResponse = req.user.toObject();
    delete userResponse.password;
    delete userResponse.tokens;

    res.status(200).json(userResponse);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update current user profile
exports.updateCurrentUser = async (req, res) => {
  try {
    const user = req.user;

    // Update allowed fields
    const allowedUpdates = [
      "name",
      "email",
      "department",
      "phone",
      "profilePicture",
      "notificationPreferences",
    ];
    const updates = Object.keys(req.body);

    updates.forEach((update) => {
      if (allowedUpdates.includes(update)) {
        user[update] = req.body[update];
      }
    });

    await user.save();

    // Remove sensitive data before sending response
    const userResponse = user.toObject();
    delete userResponse.password;
    delete userResponse.tokens;

    res.status(200).json(userResponse);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update user password
exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: "Current password and new password are required" });
    }

    // Verify current password
    const isMatch = await req.user.isValidPassword(currentPassword);

    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    // Update password
    req.user.password = newPassword;
    await req.user.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update notification preferences
exports.updateNotificationPreferences = async (req, res) => {
  try {
    const user = req.user;

    user.notificationPreferences = {
      ...user.notificationPreferences,
      ...req.body,
    };

    await user.save();

    res.status(200).json(user.notificationPreferences);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get users by role
exports.getUsersByRole = async (req, res) => {
  try {
    const users = await User.find({ role: req.params.role })
      .select("-password -tokens")
      .sort({ name: 1 });

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get users by department
exports.getUsersByDepartment = async (req, res) => {
  try {
    const users = await User.find({ department: req.params.department })
      .select("-password -tokens")
      .sort({ name: 1 });

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
