const mongoose = require('mongoose');
const fs = require('fs');
const csv = require('csv-parser');
const bcrypt = require('bcryptjs');
const Post = require('./src/models/Post');
const User = require('./src/models/User');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/social_analytics')
  .then(async () => {
    try {
      console.log('Connected to MongoDB');
      
      // Check if there are already posts in the database
      const existingCount = await Post.countDocuments();
      console.log(`Current post count: ${existingCount}`);
      
      if (existingCount > 0) {
        console.log('Database already has posts. Skipping import.');
        mongoose.disconnect();
        return;
      }
      
      // Create or find admin user
      let adminUser = await User.findOne({ email: 'admin@example.com' });
      
      if (!adminUser) {
        console.log('Creating admin user...');
        adminUser = new User({
          name: 'Admin User',
          email: 'admin@example.com',
          password: 'password123', // This will be hashed by the pre-save hook
          role: 'admin'
        });
        
        await adminUser.save();
        console.log(`Admin user created with ID: ${adminUser._id}`);
      } else {
        console.log(`Using existing admin user with ID: ${adminUser._id}`);
      }
      
      // Path to sample data
      const sampleDataPath = '../ml/data/sample_data.csv';
      
      // Check if file exists
      if (!fs.existsSync(sampleDataPath)) {
        console.error(`Sample data file not found at ${sampleDataPath}`);
        mongoose.disconnect();
        return;
      }
      
      const results = [];
      
      // Read and parse CSV file
      fs.createReadStream(sampleDataPath)
        .pipe(csv())
        .on('data', (data) => {
          results.push(data);
        })
        .on('end', async () => {
          console.log(`Parsed ${results.length} rows from CSV`);
          
          // Process each row
          let successCount = 0;
          let errorCount = 0;
          
          for (const row of results) {
            try {
              // Parse hashtags
              let hashtags = [];
              if (row.hashtags) {
                hashtags = row.hashtags.replace(/"/g, '').split(',').map(tag => tag.trim());
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
                uploadedBy: adminUser._id // Use the admin user's ID
              });
              
              await post.save();
              successCount++;
            } catch (err) {
              console.error(`Error processing row ${row.post_id}: ${err.message}`);
              errorCount++;
            }
          }
          
          console.log(`Import complete: ${successCount} posts imported, ${errorCount} errors`);
          
          // Verify import
          const finalCount = await Post.countDocuments();
          console.log(`Final post count: ${finalCount}`);
          
          mongoose.disconnect();
        });
    } catch (err) {
      console.error('Error:', err);
      mongoose.disconnect();
    }
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  });