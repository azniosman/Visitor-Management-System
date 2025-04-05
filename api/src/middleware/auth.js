const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Authentication middleware
 * Verifies the JWT token in the request header and attaches the user to the request
 */
const auth = async (req, res, next) => {
  try {
    // Get the token from the Authorization header
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const token = authHeader.replace('Bearer ', '');
    
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find the user with the correct ID and token
    const user = await User.findOne({ 
      _id: decoded._id,
      'tokens.token': token,
      status: 'active'
    });
    
    if (!user) {
      throw new Error();
    }
    
    // Attach the token and user to the request for use in route handlers
    req.token = token;
    req.user = user;
    
    next();
  } catch (error) {
    res.status(401).json({ message: 'Authentication failed' });
  }
};

module.exports = auth;
