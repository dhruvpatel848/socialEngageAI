const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const axios = require('axios');
const Prediction = require('../models/Prediction');
const auth = require('../middleware/auth');

// ML service URL
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

// @route   POST api/predict
// @desc    Predict engagement for a post
// @access  Private
router.post('/', [
  auth,
  body('post_text', 'Post text is required').not().isEmpty(),
  body('media_type', 'Media type is required').isIn(['image', 'video', 'text'])
], async (req, res) => {
  // Validate request
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const {
      post_text,
      media_type,
      hashtags,
      user_id,
      followers_count,
      following_count,
      account_age,
      timestamp
    } = req.body;

    // Prepare data for ML service
    const predictionData = {
      post_text,
      media_type,
      hashtags: Array.isArray(hashtags) ? hashtags.join(',') : hashtags,
      timestamp: timestamp || new Date().toISOString(),
      user_id: user_id || 'unknown',
      followers_count: followers_count || 0,
      following_count: following_count || 0,
      account_age: account_age || 0,
      text_length: post_text.length,
      hour_of_day: new Date(timestamp || Date.now()).getHours(),
      day_of_week: new Date(timestamp || Date.now()).getDay()
    };

    // Call ML service for prediction
    const mlResponse = await axios.post(`${ML_SERVICE_URL}/predict`, predictionData);
    const prediction = mlResponse.data;

    // Save prediction to database
    const newPrediction = new Prediction({
      post_text,
      media_type,
      hashtags: Array.isArray(hashtags) ? hashtags : hashtags.split(',').map(tag => tag.trim()).filter(tag => tag),
      timestamp: new Date(timestamp || Date.now()),
      user_id,
      followers_count,
      following_count,
      account_age,
      predicted_likes: prediction.likes,
      predicted_shares: prediction.shares,
      predicted_comments: prediction.comments,
      engagement_level: prediction.engagement_level,
      feature_importance: prediction.feature_importance,
      confidence_score: prediction.confidence_score,
      recommended_post_time: prediction.recommended_post_time,
      createdBy: req.user.id
    });

    await newPrediction.save();

    res.json({
      prediction: {
        id: newPrediction._id,
        likes: prediction.likes,
        shares: prediction.shares,
        comments: prediction.comments,
        engagement_level: prediction.engagement_level,
        feature_importance: prediction.feature_importance,
        confidence_score: prediction.confidence_score,
        recommended_post_time: prediction.recommended_post_time
      }
    });
  } catch (err) {
    console.error('Prediction error:', err.message);
    if (err.response && err.response.data) {
      return res.status(err.response.status).json(err.response.data);
    }
    res.status(500).send('Server error');
  }
});

// @route   GET api/predict/history
// @desc    Get prediction history for a user
// @access  Private
router.get('/history', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Get predictions with pagination
    const predictions = await Prediction.find({ createdBy: req.user.id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const total = await Prediction.countDocuments({ createdBy: req.user.id });

    res.json({
      predictions,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/predict/:id
// @desc    Get prediction by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const prediction = await Prediction.findById(req.params.id);
    if (!prediction) {
      return res.status(404).json({ msg: 'Prediction not found' });
    }

    // Check if user is authorized to view
    if (prediction.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    res.json(prediction);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Prediction not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   PUT api/predict/:id/actual
// @desc    Update prediction with actual engagement metrics
// @access  Private
router.put('/:id/actual', [
  auth,
  body('likes', 'Likes must be a number').isNumeric(),
  body('shares', 'Shares must be a number').isNumeric(),
  body('comments', 'Comments must be a number').isNumeric()
], async (req, res) => {
  // Validate request
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const prediction = await Prediction.findById(req.params.id);
    if (!prediction) {
      return res.status(404).json({ msg: 'Prediction not found' });
    }

    // Check if user is authorized to update
    if (prediction.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    // Update prediction with actual metrics
    prediction.actual_likes = req.body.likes;
    prediction.actual_shares = req.body.shares;
    prediction.actual_comments = req.body.comments;

    await prediction.save();

    res.json(prediction);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Prediction not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   DELETE api/predict/:id
// @desc    Delete prediction
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const prediction = await Prediction.findById(req.params.id);
    if (!prediction) {
      return res.status(404).json({ msg: 'Prediction not found' });
    }

    // Check if user is authorized to delete
    if (prediction.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    await prediction.deleteOne();
    res.json({ msg: 'Prediction removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Prediction not found' });
    }
    res.status(500).send('Server error');
  }
});

module.exports = router;