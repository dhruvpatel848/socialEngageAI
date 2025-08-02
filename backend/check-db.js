const mongoose = require('mongoose');
const Post = require('./src/models/Post');

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/social_analytics')
  .then(async () => {
    try {
      const count = await Post.countDocuments();
      console.log(`Total posts in database: ${count}`);
      
      if (count > 0) {
        // Get a sample post to check data
        const samplePost = await Post.findOne().lean();
        console.log('Sample post data:', JSON.stringify(samplePost, null, 2));
      }
    } catch (err) {
      console.error('Error querying database:', err);
    } finally {
      mongoose.disconnect();
    }
  })
  .catch(err => console.error('Connection error:', err));