const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = require("../src/models/User");

/**
 * Create a test user
 * @param {Object} userData - User data
 * @returns {Promise<Object>} - Created user and auth token
 */
const createTestUser = async (userData = {}) => {
  // Default user data
  const defaultUserData = {
    name: "Test User",
    email: "test@example.com",
    password: "SecureP@ss123",
    role: "Admin",
    department: "IT",
    status: "active",
  };

  // Create user with provided data or defaults
  const user = new User({
    ...defaultUserData,
    ...userData,
  });

  await user.save();

  // Generate auth token
  const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "1h",
  });

  // Add token to user's tokens array
  user.tokens = user.tokens || [];
  user.tokens.push({ token });
  await user.save();

  return { user, token };
};

/**
 * Generate a random MongoDB ID
 * @returns {string} - Random MongoDB ID
 */
const generateRandomId = () => {
  return new mongoose.Types.ObjectId().toString();
};

module.exports = {
  createTestUser,
  generateRandomId,
};
