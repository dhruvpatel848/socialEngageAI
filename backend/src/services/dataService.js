const fs = require('fs');
const csv = require('csv-parser');
const Post = require('../models/Post');
const { ApiError } = require('../utils/errorHandler');
const logger = require('../utils/logger');

/**
 * Data service for handling data-related operations
 */
class DataService {
  /**
   * Process CSV file and import data
   * @param {string} filePath - Path to CSV file
   * @param {string} userId - User ID
   * @returns {Promise<Object>} - Import results
   */
  static async importFromCsv(filePath, userId) {
    return new Promise((resolve, reject) => {
      const results = [];
      const errors = [];
      let processedCount = 0;

      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (data) => {
          results.push(data);
        })
        .on('end', async () => {
          try {
            // Process each row
            for (const row of results) {
              try {
                // Check if post already exists
                const existingPost = await Post.findOne({ post_id: row.post_id });
                if (existingPost) {
                  errors.push(`Post with ID ${row.post_id} already exists`);
                  continue;
                }

                // Parse hashtags
                let hashtags = [];
                if (row.hashtags) {
                  hashtags = row.hashtags.split(',').map(tag => tag.trim());
                }

                // Create new post
                const post = new Post({
                  post_id: row.post_id,
                  post_text: row.post_text,
                  media_type: row.media_type,
                  hashtags: hashtags,
                  timestamp: new Date(row.timestamp),
                  user_id: row.user_id,
                  followers_count: parseInt(row.followers_count),
                  following_count: parseInt(row.following_count),
                  account_age: parseInt(row.account_age),
                  likes: parseInt(row.likes),
                  shares: parseInt(row.shares),
                  comments: parseInt(row.comments),
                  // Calculate additional features
                  text_length: row.post_text ? row.post_text.length : 0,
                  hour_of_day: new Date(row.timestamp).getHours(),
                  day_of_week: new Date(row.timestamp).getDay(),
                  uploadedBy: userId
                });

                await post.save();
                processedCount++;
              } catch (err) {
                errors.push(`Error processing row: ${err.message}`);
              }
            }

            // Delete the uploaded file
            fs.unlinkSync(filePath);

            resolve({ 
              message: `Processed ${processedCount} posts successfully`, 
              total: results.length,
              processed: processedCount,
              errors: errors.length > 0 ? errors : undefined
            });
          } catch (error) {
            reject(error);
          }
        })
        .on('error', (error) => {
          reject(error);
        });
    });
  }

  /**
   * Get posts with pagination and filtering
   * @param {Object} filter - Filter criteria
   * @param {number} page - Page number
   * @param {number} limit - Items per page
   * @returns {Promise<Object>} - Posts with pagination
   */
  static async getPosts(filter = {}, page = 1, limit = 10) {
    try {
      const skip = (page - 1) * limit;

      // Get posts with pagination
      const posts = await Post.find(filter)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit);

      // Get total count for pagination
      const total = await Post.countDocuments(filter);

      return {
        posts,
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
      logger.error(`Error getting posts: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get post by ID
   * @param {string} postId - Post ID
   * @returns {Promise<Object>} - Post object
   */
  static async getPostById(postId) {
    try {
      const post = await Post.findOne({ post_id: postId });
      if (!post) {
        throw new ApiError(404, 'Post not found');
      }
      return post;
    } catch (error) {
      logger.error(`Error getting post by ID: ${error.message}`);
      throw error;
    }
  }

  /**
   * Delete post by ID
   * @param {string} postId - Post ID
   * @param {string} userId - User ID
   * @param {boolean} isAdmin - Whether the user is an admin
   * @returns {Promise<boolean>} - Success status
   */
  static async deletePost(postId, userId, isAdmin = false) {
    try {
      const post = await Post.findOne({ post_id: postId });
      if (!post) {
        throw new ApiError(404, 'Post not found');
      }

      // Check if user is authorized to delete
      if (post.uploadedBy.toString() !== userId && !isAdmin) {
        throw new ApiError(403, 'Not authorized');
      }

      await post.deleteOne();
      return true;
    } catch (error) {
      logger.error(`Error deleting post: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get data statistics
   * @returns {Promise<Object>} - Data statistics
   */
  static async getDataStatistics() {
    try {
      // Total posts count
      const totalPosts = await Post.countDocuments();

      // Posts by media type
      const postsByMediaType = await Post.aggregate([
        { $group: { _id: '$media_type', count: { $sum: 1 } } }
      ]);

      // Average engagement by media type
      const avgEngagementByMediaType = await Post.aggregate([
        { 
          $group: { 
            _id: '$media_type', 
            avgLikes: { $avg: '$likes' },
            avgShares: { $avg: '$shares' },
            avgComments: { $avg: '$comments' },
            count: { $sum: 1 }
          } 
        }
      ]);

      // Posts by day of week
      const postsByDayOfWeek = await Post.aggregate([
        { $group: { _id: '$day_of_week', count: { $sum: 1 } } }
      ]);

      // Posts by hour of day
      const postsByHourOfDay = await Post.aggregate([
        { $group: { _id: '$hour_of_day', count: { $sum: 1 } } }
      ]);

      // Top hashtags
      const topHashtags = await Post.aggregate([
        { $unwind: '$hashtags' },
        { $group: { _id: '$hashtags', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]);

      return {
        totalPosts,
        postsByMediaType,
        avgEngagementByMediaType,
        postsByDayOfWeek,
        postsByHourOfDay,
        topHashtags
      };
    } catch (error) {
      logger.error(`Error getting data statistics: ${error.message}`);
      throw error;
    }
  }
}

module.exports = DataService;