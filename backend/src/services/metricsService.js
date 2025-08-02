const Post = require('../models/Post');
const Prediction = require('../models/Prediction');
const { ApiError } = require('../utils/errorHandler');
const logger = require('../utils/logger');
const { getModelPerformance, getFeatureImportance, getContentAnalysis } = require('../utils/mlServiceClient');

/**
 * Metrics service for handling metrics-related operations
 */
class MetricsService {
  /**
   * Get model performance metrics
   * @returns {Promise<Object>} - Model performance metrics
   */
  static async getModelPerformance() {
    try {
      return await getModelPerformance();
    } catch (error) {
      logger.error(`Error getting model performance: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get feature importance metrics
   * @returns {Promise<Object>} - Feature importance metrics
   */
  static async getFeatureImportance() {
    try {
      return await getFeatureImportance();
    } catch (error) {
      logger.error(`Error getting feature importance: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get prediction accuracy metrics
   * @returns {Promise<Object>} - Prediction accuracy metrics
   */
  static async getPredictionAccuracy() {
    try {
      // Find predictions with actual engagement metrics
      const predictions = await Prediction.find({
        actual_likes: { $exists: true },
        actual_shares: { $exists: true },
        actual_comments: { $exists: true }
      });

      if (predictions.length === 0) {
        return {
          message: 'No predictions with actual metrics found',
          data: {
            count: 0,
            metrics: {}
          }
        };
      }

      // Calculate accuracy metrics
      let totalLikesError = 0;
      let totalSharesError = 0;
      let totalCommentsError = 0;
      let totalLikesAbsError = 0;
      let totalSharesAbsError = 0;
      let totalCommentsAbsError = 0;
      let correctEngagementLevel = 0;

      predictions.forEach(prediction => {
        // Calculate errors
        const likesError = prediction.predicted_likes - prediction.actual_likes;
        const sharesError = prediction.predicted_shares - prediction.actual_shares;
        const commentsError = prediction.predicted_comments - prediction.actual_comments;

        // Accumulate errors
        totalLikesError += likesError;
        totalSharesError += sharesError;
        totalCommentsError += commentsError;
        totalLikesAbsError += Math.abs(likesError);
        totalSharesAbsError += Math.abs(sharesError);
        totalCommentsAbsError += Math.abs(commentsError);

        // Determine actual engagement level
        const totalActualEngagement = prediction.actual_likes + prediction.actual_shares + prediction.actual_comments;
        let actualEngagementLevel;
        if (totalActualEngagement < 50) {
          actualEngagementLevel = 'low';
        } else if (totalActualEngagement < 200) {
          actualEngagementLevel = 'medium';
        } else {
          actualEngagementLevel = 'high';
        }

        // Check if predicted engagement level matches actual
        if (prediction.engagement_level === actualEngagementLevel) {
          correctEngagementLevel++;
        }
      });

      // Calculate average errors
      const count = predictions.length;
      const avgLikesError = totalLikesError / count;
      const avgSharesError = totalSharesError / count;
      const avgCommentsError = totalCommentsError / count;
      const avgLikesAbsError = totalLikesAbsError / count;
      const avgSharesAbsError = totalSharesAbsError / count;
      const avgCommentsAbsError = totalCommentsAbsError / count;
      const engagementLevelAccuracy = (correctEngagementLevel / count) * 100;

      return {
        data: {
          count,
          metrics: {
            likes: {
              mean_error: avgLikesError,
              mean_absolute_error: avgLikesAbsError
            },
            shares: {
              mean_error: avgSharesError,
              mean_absolute_error: avgSharesAbsError
            },
            comments: {
              mean_error: avgCommentsError,
              mean_absolute_error: avgCommentsAbsError
            },
            engagement_level: {
              accuracy: engagementLevelAccuracy
            }
          }
        }
      };
    } catch (error) {
      logger.error(`Error calculating prediction accuracy: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get best time to post recommendations
   * @returns {Promise<Object>} - Best time to post recommendations
   */
  static async getBestTimeToPost() {
    try {
      // Aggregate posts by hour and day to find best times
      const hourlyEngagement = await Post.aggregate([
        {
          $group: {
            _id: { hour: '$hour_of_day' },
            avg_likes: { $avg: '$likes' },
            avg_shares: { $avg: '$shares' },
            avg_comments: { $avg: '$comments' },
            total_engagement: { $avg: { $add: ['$likes', '$shares', '$comments'] } },
            count: { $sum: 1 }
          }
        },
        { $sort: { total_engagement: -1 } }
      ]);

      const dailyEngagement = await Post.aggregate([
        {
          $group: {
            _id: { day: '$day_of_week' },
            avg_likes: { $avg: '$likes' },
            avg_shares: { $avg: '$shares' },
            avg_comments: { $avg: '$comments' },
            total_engagement: { $avg: { $add: ['$likes', '$shares', '$comments'] } },
            count: { $sum: 1 }
          }
        },
        { $sort: { total_engagement: -1 } }
      ]);

      // Get best times by media type
      const bestTimesByMediaType = await Post.aggregate([
        {
          $group: {
            _id: { media_type: '$media_type', hour: '$hour_of_day', day: '$day_of_week' },
            avg_likes: { $avg: '$likes' },
            avg_shares: { $avg: '$shares' },
            avg_comments: { $avg: '$comments' },
            total_engagement: { $avg: { $add: ['$likes', '$shares', '$comments'] } },
            count: { $sum: 1 }
          }
        },
        { $sort: { total_engagement: -1 } },
        {
          $group: {
            _id: '$_id.media_type',
            best_time: { $first: { hour: '$_id.hour', day: '$_id.day' } },
            avg_engagement: { $first: '$total_engagement' },
            count: { $first: '$count' }
          }
        }
      ]);

      return {
        hourly_engagement: hourlyEngagement,
        daily_engagement: dailyEngagement,
        best_times_by_media_type: bestTimesByMediaType
      };
    } catch (error) {
      logger.error(`Error calculating best time to post: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get hashtag performance metrics
   * @returns {Promise<Object>} - Hashtag performance metrics
   */
  static async getHashtagPerformance() {
    try {
      // Unwind hashtags and group by hashtag to calculate average engagement
      const hashtagPerformance = await Post.aggregate([
        { $unwind: '$hashtags' },
        {
          $group: {
            _id: '$hashtags',
            avg_likes: { $avg: '$likes' },
            avg_shares: { $avg: '$shares' },
            avg_comments: { $avg: '$comments' },
            total_engagement: { $avg: { $add: ['$likes', '$shares', '$comments'] } },
            count: { $sum: 1 }
          }
        },
        { $match: { count: { $gt: 1 } } }, // Only include hashtags used more than once
        { $sort: { total_engagement: -1 } },
        { $limit: 20 } // Top 20 hashtags
      ]);

      return {
        hashtag_performance: hashtagPerformance
      };
    } catch (error) {
      logger.error(`Error calculating hashtag performance: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get content analysis metrics
   * @returns {Promise<Object>} - Content analysis metrics
   */
  static async getContentAnalysis() {
    try {
      return await getContentAnalysis();
    } catch (error) {
      logger.error(`Error getting content analysis: ${error.message}`);
      throw error;
    }
  }
}

module.exports = MetricsService;