const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
  // Get token from header - check both x-auth-token and Authorization headers
  let token = req.header('x-auth-token');
  
  // If no x-auth-token, try Authorization header
  if (!token && req.header('Authorization')) {
    // Extract token from Bearer format
    const authHeader = req.header('Authorization');
    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
  }

  // Check if no token
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');

    // Add user from payload to request
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};