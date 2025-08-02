const Prediction = require('../models/Prediction');
const { ApiError } = require('../utils/errorHandler');
const logger = require('../utils/logger');
const { makePrediction } = require('../utils/mlServiceClient');

/**
 * Prediction service for handling prediction-related operations
 */
class PredictionService {
  /**
   * Create a new prediction
   * @param {Object} predictionData - Prediction data
   * @param {string} userId - User ID
   * @returns {Promise<Object>} - Created prediction object
   */
  static async createPrediction(predictionData, userId) {
    try {
      // Prepare data for ML service
      const mlData = {
        post_text: predictionData.post_text,
        media_type: predictionData.media_type,
        hashtags: predictionData.hashtags.join(','),
        timestamp: predictionData.timestamp || new Date().toISOString(),
        user_id: predictionData.user_id || 'unknown',
        followers_count: predictionData.followers_count || 0,
        following_count: predictionData.following_count || 0,
        account_age: predictionData.account_age || 0,
        text_length: predictionData.post_text.length,
        hour_of_day: new Date(predictionData.timestamp || Date.now()).getHours(),
        day_of_week: new Date(predictionData.timestamp || Date.now()).getDay()
      };

      // Call ML service for prediction
      const prediction = await makePrediction(mlData);

      // Save prediction to database
      const newPrediction = new Prediction({
        post_text: predictionData.post_text,
        media_type: predictionData.media_type,
        hashtags: predictionData.hashtags,
        timestamp: new Date(predictionData.timestamp || Date.now()),
        user_id: predictionData.user_id,
        followers_count: predictionData.followers_count,
        following_count: predictionData.following_count,
        account_age: predictionData.account_age,
        predicted_likes: prediction.likes,
        predicted_shares: prediction.shares,
        predicted_comments: prediction.comments,
        engagement_level: prediction.engagement_level,
        feature_importance: prediction.feature_importance,
        confidence_score: prediction.confidence_score,
        recommended_post_time: prediction.recommended_post_time,
        createdBy: userId
      });

      await newPrediction.save();

      return {
        id: newPrediction._id,
        likes: prediction.likes,
        shares: prediction.shares,
        comments: prediction.comments,
        engagement_level: prediction.engagement_level,
        feature_importance: prediction.feature_importance,
        confidence_score: prediction.confidence_score,
        recommended_post_time: prediction.recommended_post_time
      };
    } catch (error) {
      logger.error(`Error creating prediction: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get prediction history for a user
   * @param {string} userId - User ID
   * @param {number} page - Page number
   * @param {number} limit - Items per page
   * @returns {Promise<Object>} - Predictions with pagination
   */
  static async getPredictionHistory(userId, page = 1, limit = 10) {
    try {
      const skip = (page - 1) * limit;

      // Get predictions with pagination
      const predictions = await Prediction.find({ createdBy: userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      // Get total count for pagination
      const total = await Prediction.countDocuments({ createdBy: userId });

      return {
        predictions,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
          hasNextPage: page < Math.ceil(total / limit),
          hasPrevPage: page > 1
        }
      };
    } catch (error) {
      logger.error(`Error getting prediction history: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get prediction by ID
   * @param {string} predictionId - Prediction ID
   * @param {string} userId - User ID
   * @param {boolean} isAdmin - Whether the user is an admin
   * @returns {Promise<Object>} - Prediction object
   */
  static async getPredictionById(predictionId, userId, isAdmin = false) {
    try {
      const prediction = await Prediction.findById(predictionId);
      if (!prediction) {
        throw new ApiError(404, 'Prediction not found');
      }

      // Check if user is authorized to view
      if (prediction.createdBy.toString() !== userId && !isAdmin) {
        throw new ApiError(403, 'Not authorized');
      }

      return prediction;
    } catch (error) {
      logger.error(`Error getting prediction by ID: ${error.message}`);
      throw error;
    }
  }

  /**
   * Update prediction with actual engagement metrics
   * @param {string} predictionId - Prediction ID
   * @param {Object} actualData - Actual engagement data
   * @param {string} userId - User ID
   * @param {boolean} isAdmin - Whether the user is an admin
   * @returns {Promise<Object>} - Updated prediction object
   */
  static async updateActualEngagement(predictionId, actualData, userId, isAdmin = false) {
    try {
      const prediction = await Prediction.findById(predictionId);
      if (!prediction) {
        throw new ApiError(404, 'Prediction not found');
      }

      // Check if user is authorized to update
      if (prediction.createdBy.toString() !== userId && !isAdmin) {
        throw new ApiError(403, 'Not authorized');
      }

      // Update prediction with actual metrics
      prediction.actual_likes = actualData.likes;
      prediction.actual_shares = actualData.shares;
      prediction.actual_comments = actualData.comments;

      await prediction.save();

      return prediction;
    } catch (error) {
      logger.error(`Error updating actual engagement: ${error.message}`);
      throw error;
    }
  }

  /**
   * Delete prediction
   * @param {string} predictionId - Prediction ID
   * @param {string} userId - User ID
   * @param {boolean} isAdmin - Whether the user is an admin
   * @returns {Promise<boolean>} - Success status
   */
  static async deletePrediction(predictionId, userId, isAdmin = false) {
    try {
      const prediction = await Prediction.findById(predictionId);
      if (!prediction) {
        throw new ApiError(404, 'Prediction not found');
      }

      // Check if user is authorized to delete
      if (prediction.createdBy.toString() !== userId && !isAdmin) {
        throw new ApiError(403, 'Not authorized');
      }

      await prediction.deleteOne();
      return true;
    } catch (error) {
      logger.error(`Error deleting prediction: ${error.message}`);
      throw error;
    }
  }
}

module.exports = PredictionService;