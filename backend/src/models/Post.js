const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
  post_id: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
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
    required: true
  },
  user_id: {
    type: String,
    required: true,
    trim: true
  },
  followers_count: {
    type: Number,
    required: true,
    min: 0
  },
  following_count: {
    type: Number,
    required: true,
    min: 0
  },
  account_age: {
    type: Number, // in days
    required: true,
    min: 0
  },
  likes: {
    type: Number,
    required: true,
    min: 0
  },
  shares: {
    type: Number,
    required: true,
    min: 0
  },
  comments: {
    type: Number,
    required: true,
    min: 0
  },
  // Additional fields for feature extraction
  text_length: {
    type: Number,
    min: 0
  },
  sentiment_score: {
    type: Number
  },
  hour_of_day: {
    type: Number,
    min: 0,
    max: 23
  },
  day_of_week: {
    type: Number,
    min: 0,
    max: 6
  },
  // Reference to the user who uploaded this data
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Index for faster queries
PostSchema.index({ post_id: 1 });
PostSchema.index({ user_id: 1 });
PostSchema.index({ timestamp: 1 });
PostSchema.index({ media_type: 1 });

module.exports = mongoose.model('Post', PostSchema);