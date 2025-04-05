/**
 * Admin authentication middleware
 * Checks if the authenticated user has admin role
 * Must be used after the auth middleware
 */
const adminAuth = async (req, res, next) => {
  try {
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }
    
    next();
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = adminAuth;
