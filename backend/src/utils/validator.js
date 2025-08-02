const { validationResult } = require('express-validator');

/**
 * Middleware to validate request using express-validator
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 * @returns {Object|void} - Returns validation error response or continues to next middleware
 */
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

/**
 * Creates validation rules for different resources
 */
const validationRules = {
  // User validation rules
  user: {
    register: [
      { field: 'name', rules: 'required', message: 'Name is required' },
      { field: 'email', rules: 'required|email', message: 'Please include a valid email' },
      { field: 'password', rules: 'required|min:6', message: 'Please enter a password with 6 or more characters' }
    ],
    login: [
      { field: 'email', rules: 'required|email', message: 'Please include a valid email' },
      { field: 'password', rules: 'required', message: 'Password is required' }
    ],
    update: [
      { field: 'name', rules: 'required', message: 'Name is required' },
      { field: 'email', rules: 'required|email', message: 'Please include a valid email' }
    ]
  },
  
  // Prediction validation rules
  prediction: {
    create: [
      { field: 'post_text', rules: 'required', message: 'Post text is required' },
      { field: 'media_type', rules: 'required|in:image,video,text', message: 'Media type must be image, video, or text' },
      { field: 'hashtags', rules: 'array', message: 'Hashtags must be an array' }
    ],
    updateActual: [
      { field: 'likes', rules: 'required|numeric', message: 'Likes must be a number' },
      { field: 'shares', rules: 'required|numeric', message: 'Shares must be a number' },
      { field: 'comments', rules: 'required|numeric', message: 'Comments must be a number' }
    ]
  }
};

module.exports = {
  validateRequest,
  validationRules
};