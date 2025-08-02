const express = require('express');
const router = express.Router();
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');
const Post = require('../models/Post');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    const uploadDir = path.join(__dirname, '../../uploads');
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function(req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: function(req, file, cb) {
    // Accept only CSV files
    if (file.mimetype !== 'text/csv' && !file.originalname.endsWith('.csv')) {
      return cb(new Error('Only CSV files are allowed'), false);
    }
    cb(null, true);
  }
});

// @route   POST api/data/upload
// @desc    Upload social media data from CSV
// @access  Admin
router.post('/upload', [auth, adminAuth], upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ msg: 'No file uploaded' });
    }

    const results = [];
    const errors = [];
    let processedCount = 0;

    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on('data', (data) => {
        results.push(data);
      })
      .on('end', async () => {
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
              uploadedBy: req.user.id
            });

            await post.save();
            processedCount++;
          } catch (err) {
            errors.push(`Error processing row: ${err.message}`);
          }
        }

        // Delete the uploaded file
        fs.unlinkSync(req.file.path);

        res.json({ 
          msg: `Processed ${processedCount} posts successfully`, 
          total: results.length,
          processed: processedCount,
          errors: errors.length > 0 ? errors : undefined
        });
      });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/data/posts
// @desc    Get all posts with pagination
// @access  Admin
router.get('/posts', [auth, adminAuth], async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Filter options
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

    // Get posts with pagination
    const posts = await Post.find(filter)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const total = await Post.countDocuments(filter);

    res.json({
      posts,
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

// @route   GET api/data/posts/:id
// @desc    Get post by ID
// @access  Admin
router.get('/posts/:id', [auth, adminAuth], async (req, res) => {
  try {
    const post = await Post.findOne({ post_id: req.params.id });
    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }
    res.json(post);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   DELETE api/data/posts/:id
// @desc    Delete post by ID
// @access  Admin
router.delete('/posts/:id', [auth, adminAuth], async (req, res) => {
  try {
    const post = await Post.findOne({ post_id: req.params.id });
    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }

    // Only admins can delete posts (already checked by adminAuth middleware)

    await post.deleteOne();
    res.json({ msg: 'Post removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/data/stats
// @desc    Get data statistics
// @access  Admin
router.get('/stats', [auth, adminAuth], async (req, res) => {
  try {
    // Total posts count
    const totalPosts = await Post.countDocuments();

    // Posts by media type
    const postsByMediaTypeRaw = await Post.aggregate([
      { $group: { _id: '$media_type', count: { $sum: 1 } } }
    ]);
    
    // Format posts by media type to match frontend expectations
    const postsByMediaType = postsByMediaTypeRaw.map(item => ({
      mediaType: item._id,
      count: item.count
    }));

    // Average engagement by media type
    const avgEngagementByMediaTypeRaw = await Post.aggregate([
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
    
    // Format average engagement to match frontend expectations
    const avgEngagementByMediaType = avgEngagementByMediaTypeRaw.map(item => ({
      mediaType: item._id,
      avgLikes: item.avgLikes || 0,
      avgShares: item.avgShares || 0,
      avgComments: item.avgComments || 0,
      count: item.count
    }));

    // Posts by day of week
    const postsByDayOfWeekRaw = await Post.aggregate([
      { $group: { _id: '$day_of_week', count: { $sum: 1 } } }
    ]);
    
    // Map day numbers to day names and format for frontend
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const postsByDay = postsByDayOfWeekRaw.map(item => ({
      day: dayNames[item._id],
      count: item.count
    }));

    // Posts by hour of day
    const postsByHourOfDayRaw = await Post.aggregate([
      { $group: { _id: '$hour_of_day', count: { $sum: 1 } } }
    ]);
    
    // Format hours for frontend
    const postsByHour = postsByHourOfDayRaw.map(item => ({
      hour: item._id,
      count: item.count
    }));

    // Top hashtags
    const topHashtagsRaw = await Post.aggregate([
      { $unwind: '$hashtags' },
      { $group: { _id: '$hashtags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
    
    // Format hashtags for frontend
    const topHashtags = topHashtagsRaw.map(item => ({
      hashtag: item._id,
      count: item.count
    }));

    res.json({
      totalPosts,
      postsByMediaType,
      avgEngagementByMediaType,
      postsByDay,
      postsByHour,
      topHashtags
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;