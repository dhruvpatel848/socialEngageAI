const jwt = require('jsonwebtoken');
const UserService = require('../services/userService');
const { ApiError } = require('../utils/errorHandler');
const { sendSuccess, sendError } = require('../utils/responseHandler');
const logger = require('../utils/logger');

/**
 * Auth controller for handling authentication-related routes
 */
class AuthController {
  /**
   * Register a new user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  static async register(req, res, next) {
    try {
      const { name, email, password } = req.body;

      // Register user
      const user = await UserService.registerUser({ name, email, password });

      // Create JWT payload
      const payload = {
        user: {
          id: user._id,
          role: user.role
        }
      };

      // Sign token
      jwt.sign(
        payload,
        process.env.JWT_SECRET || 'secret',
        { expiresIn: process.env.JWT_EXPIRE || '24h' },
        (err, token) => {
          if (err) throw new ApiError(500, 'Error generating token');
          sendSuccess(res, 201, 'User registered successfully', { token });
        }
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Login user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  static async login(req, res, next) {
    try {
      const { email, password } = req.body;

      // Authenticate user
      const user = await UserService.authenticateUser(email, password);

      // Create JWT payload
      const payload = {
        user: {
          id: user._id,
          role: user.role
        }
      };

      // Sign token
      jwt.sign(
        payload,
        process.env.JWT_SECRET || 'secret',
        { expiresIn: process.env.JWT_EXPIRE || '24h' },
        (err, token) => {
          if (err) throw new ApiError(500, 'Error generating token');
          sendSuccess(res, 200, 'Login successful', { token });
        }
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get current user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  static async getCurrentUser(req, res, next) {
    try {
      const user = await UserService.getUserById(req.user.id);
      sendSuccess(res, 200, 'User retrieved successfully', user);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update user profile
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  static async updateProfile(req, res, next) {
    try {
      const { name, email, password } = req.body;
      const updatedUser = await UserService.updateUser(req.user.id, { name, email, password });
      sendSuccess(res, 200, 'Profile updated successfully', updatedUser);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AuthController;