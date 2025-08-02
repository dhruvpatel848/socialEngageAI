const User = require('../models/User');
const { ApiError } = require('../utils/errorHandler');
const logger = require('../utils/logger');

/**
 * User service for handling user-related operations
 */
class UserService {
  /**
   * Register a new user
   * @param {Object} userData - User data (name, email, password)
   * @returns {Promise<Object>} - Created user object
   */
  static async registerUser(userData) {
    try {
      // Check if user already exists
      const existingUser = await User.findOne({ email: userData.email });
      if (existingUser) {
        throw new ApiError(400, 'User already exists');
      }

      // Create new user
      const user = new User(userData);
      await user.save();

      // Return user without password
      return user.toObject({ transform: (doc, ret) => {
        delete ret.password;
        return ret;
      }});
    } catch (error) {
      logger.error(`Error registering user: ${error.message}`);
      throw error;
    }
  }

  /**
   * Authenticate a user
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} - Authenticated user object
   */
  static async authenticateUser(email, password) {
    try {
      // Find user by email
      const user = await User.findOne({ email });
      if (!user) {
        throw new ApiError(401, 'Invalid credentials');
      }

      // Check password
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        throw new ApiError(401, 'Invalid credentials');
      }

      // Update last login
      user.lastLogin = Date.now();
      await user.save();

      // Return user without password
      return user.toObject({ transform: (doc, ret) => {
        delete ret.password;
        return ret;
      }});
    } catch (error) {
      logger.error(`Error authenticating user: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get user by ID
   * @param {string} userId - User ID
   * @returns {Promise<Object>} - User object
   */
  static async getUserById(userId) {
    try {
      const user = await User.findById(userId).select('-password');
      if (!user) {
        throw new ApiError(404, 'User not found');
      }
      return user;
    } catch (error) {
      logger.error(`Error getting user by ID: ${error.message}`);
      throw error;
    }
  }

  /**
   * Update user profile
   * @param {string} userId - User ID
   * @param {Object} updateData - Data to update (name, email, password)
   * @returns {Promise<Object>} - Updated user object
   */
  static async updateUser(userId, updateData) {
    try {
      // Find user
      const user = await User.findById(userId);
      if (!user) {
        throw new ApiError(404, 'User not found');
      }

      // Check if email is already taken by another user
      if (updateData.email && updateData.email !== user.email) {
        const existingUser = await User.findOne({ email: updateData.email });
        if (existingUser) {
          throw new ApiError(400, 'Email is already taken');
        }
      }

      // Update user fields
      if (updateData.name) user.name = updateData.name;
      if (updateData.email) user.email = updateData.email;
      if (updateData.password) user.password = updateData.password;

      // Save updated user
      await user.save();

      // Return user without password
      return await User.findById(userId).select('-password');
    } catch (error) {
      logger.error(`Error updating user: ${error.message}`);
      throw error;
    }
  }

  /**
   * Delete user
   * @param {string} userId - User ID
   * @returns {Promise<boolean>} - Success status
   */
  static async deleteUser(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new ApiError(404, 'User not found');
      }

      await user.deleteOne();
      return true;
    } catch (error) {
      logger.error(`Error deleting user: ${error.message}`);
      throw error;
    }
  }
}

module.exports = UserService;