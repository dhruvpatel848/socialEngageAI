const mongoose = require('mongoose');

const PredictionSchema = new mongoose.Schema({
  post_text: {
    type: String,
    required: true
  },
  media_type: {
    type: String,
    enum: ['image', 'video', 'text'],
    required: true
  },
  hashtags: [{
    type: String,
    trim: true
  }],
  timestamp: {
    type: Date,
    required: true,
    default: Date.now
  },
  user_id: {
    type: String,
    trim: true
  },
  followers_count: {
    type: Number,
    min: 0
  },
  following_count: {
    type: Number,
    min: 0
  },
  account_age: {
    type: Number, // in days
    min: 0
  },
  // Predicted engagement metrics
  predicted_likes: {
    type: Number,
    required: true,
    min: 0
  },
  predicted_shares: {
    type: Number,
    required: true,
    min: 0
  },
  predicted_comments: {
    type: Number,
    required: true,
    min: 0
  },
  engagement_level: {
    type: String,
    enum: ['low', 'medium', 'high'],
    required: true
  },
  // Feature importance scores
  feature_importance: {
    type: Map,
    of: Number
  },
  // Confidence score of the prediction
  confidence_score: {
    type: Number,
    required: true,
    min: 0,
    max: 1
  },
  // Best time to post recommendation
  recommended_post_time: {
    type: Date
  },
  // Reference to the user who made this prediction
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // If this prediction is based on an actual post, reference it
  actual_post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post'
  },
  // If the post was actually published, store the actual engagement metrics
  actual_likes: {
    type: Number,
    min: 0
  },
  actual_shares: {
    type: Number,
    min: 0
  },
  actual_comments: {
    type: Number,
    min: 0
  }
}, {
  timestamps: true
});

// Index for faster queries
PredictionSchema.index({ createdBy: 1 });
PredictionSchema.index({ timestamp: 1 });
PredictionSchema.index({ engagement_level: 1 });

module.exports = mongoose.model('Prediction', PredictionSchema);