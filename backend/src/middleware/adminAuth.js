const jwt = require('jsonwebtoken');

/**
 * Middleware to check if user has admin role
 * This middleware should be used after the auth middleware
 */
module.exports = function(req, res, next) {
  // Check if user exists and has admin role
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ msg: 'Access denied. Admin privileges required.' });
  }
  
  next();
};