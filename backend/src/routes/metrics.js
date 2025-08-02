const express = require('express');
const router = express.Router();
const axios = require('axios');
const Prediction = require('../models/Prediction');
const Post = require('../models/Post');
const auth = require('../middleware/auth');

// ML service URL
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

// @route   GET api/metrics/performance
// @desc    Get model performance metrics
// @access  Private
router.get('/performance', auth, async (req, res) => {
  try {
    // Get model performance metrics from ML service
    const response = await axios.get(`${ML_SERVICE_URL}/metrics/performance`);
    res.json(response.data);
  } catch (err) {
    console.error('Error fetching model performance:', err.message);
    if (err.response && err.response.data) {
      return res.status(err.response.status).json(err.response.data);
    }
    res.status(500).send('Server error');
  }
});

// @route   GET api/metrics/feature-importance
// @desc    Get feature importance metrics
// @access  Private
router.get('/feature-importance', auth, async (req, res) => {
  try {
    // Get feature importance from ML service
    const response = await axios.get(`${ML_SERVICE_URL}/metrics/feature-importance`);
    res.json(response.data);
  } catch (err) {
    console.error('Error fetching feature importance:', err.message);
    if (err.response && err.response.data) {
      return res.status(err.response.status).json(err.response.data);
    }
    res.status(500).send('Server error');
  }
});

// @route   GET api/metrics/prediction-accuracy
// @desc    Get prediction accuracy metrics
// @access  Private
router.get('/prediction-accuracy', auth, async (req, res) => {
  try {
    // Find predictions with actual engagement metrics
    const predictions = await Prediction.find({
      actual_likes: { $exists: true },
      actual_shares: { $exists: true },
      actual_comments: { $exists: true }
    });

    if (predictions.length === 0) {
      return res.json({
        message: 'No predictions with actual metrics found',
        data: {
          count: 0,
          metrics: {}
        }
      });
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

    res.json({
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
    });
  } catch (err) {
    console.error('Error calculating prediction accuracy:', err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/metrics/best-time-to-post
// @desc    Get best time to post recommendations
// @access  Private
router.get('/best-time-to-post', auth, async (req, res) => {
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

    res.json({
      hourly_engagement: hourlyEngagement,
      daily_engagement: dailyEngagement,
      best_times_by_media_type: bestTimesByMediaType
    });
  } catch (err) {
    console.error('Error calculating best time to post:', err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/metrics/hashtag-performance
// @desc    Get hashtag performance metrics
// @access  Private
router.get('/hashtag-performance', auth, async (req, res) => {
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

    res.json({
      hashtag_performance: hashtagPerformance
    });
  } catch (err) {
    console.error('Error calculating hashtag performance:', err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/metrics/content-analysis
// @desc    Get content analysis metrics
// @access  Private
router.get('/content-analysis', auth, async (req, res) => {
  try {
    // Get content analysis from ML service
    const response = await axios.get(`${ML_SERVICE_URL}/metrics/content-analysis`);
    res.json(response.data);
  } catch (err) {
    console.error('Error fetching content analysis:', err.message);
    if (err.response && err.response.data) {
      return res.status(err.response.status).json(err.response.data);
    }
    res.status(500).send('Server error');
  }
});

module.exports = router;