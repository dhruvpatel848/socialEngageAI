const DataService = require('../services/dataService');
const { sendSuccess, sendError, createPaginationMeta } = require('../utils/responseHandler');
const logger = require('../utils/logger');

/**
 * Data controller for handling data-related routes
 */
class DataController {
  /**
   * Upload and process CSV file
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  static async uploadCsv(req, res, next) {
    try {
      if (!req.file) {
        return sendError(res, 400, 'No file uploaded');
      }

      const result = await DataService.importFromCsv(req.file.path, req.user.id);
      sendSuccess(res, 200, result.message, result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get posts with pagination and filtering
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  static async getPosts(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      // Build filter
      const filter = {};
      if (req.query.media_type) {
        filter.media_type = req.query.media_type;
      }
      if (req.query.user_id) {
        filter.user_id = req.query.user_id;
      }
      if (req.query.start_date && req.query.end_date) {
        filter.timestamp = {
          $gte: new Date(req.query.start_date),
          $lte: new Date(req.query.end_date)
        };
      }

      const result = await DataService.getPosts(filter, page, limit);
      sendSuccess(res, 200, 'Posts retrieved successfully', result.posts, result.pagination);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get post by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  static async getPostById(req, res, next) {
    try {
      const post = await DataService.getPostById(req.params.id);
      sendSuccess(res, 200, 'Post retrieved successfully', post);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete post by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  static async deletePost(req, res, next) {
    try {
      await DataService.deletePost(req.params.id, req.user.id, req.user.role === 'admin');
      sendSuccess(res, 200, 'Post removed successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get data statistics
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  static async getDataStats(req, res, next) {
    try {
      const stats = await DataService.getDataStatistics();
      sendSuccess(res, 200, 'Data statistics retrieved successfully', stats);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = DataController;