const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Post = require('./models/Post');
const Comment = require('./models/Comment');
const Category = require('./models/Category');

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

const categories = [
  { name: 'Technology', description: 'Tech news, tutorials, and innovations', icon: '💻', color: '#667eea' },
  { name: 'Programming', description: 'Code tutorials and development tips', icon: '⚡', color: '#f093fb' },
  { name: 'Web Development', description: 'Frontend, backend, and full-stack', icon: '🌐', color: '#4facfe' },
  { name: 'Lifestyle', description: 'Life tips, health, and wellness', icon: '🌟', color: '#43e97b' },
  { name: 'Business', description: 'Entrepreneurship and business insights', icon: '💼', color: '#fa709a' },
  { name: 'Design', description: 'UI/UX and graphic design', icon: '🎨', color: '#30cfd0' },
  { name: 'Science', description: 'Scientific discoveries and research', icon: '🔬', color: '#a8edea' },
  { name: 'Travel', description: 'Travel guides and adventures', icon: '✈️', color: '#ffd89b' },
];

const sampleComments = [
  'Great article! Very informative.',
  'Thanks for sharing this. Really helpful!',
  'Interesting perspective. I learned a lot.',
  'This is exactly what I was looking for!',
  'Well written and easy to understand.',
  'Could you elaborate more on this topic?',
  'Fantastic post! Keep up the good work.',
  'I have a different opinion on this matter.',
  'This helped me solve my problem. Thank you!',
  'Amazing content! Looking forward to more.',
  'Very detailed explanation. Appreciated!',
  'This is a must-read for everyone.',
  'I bookmarked this for future reference.',
  'Clear and concise. Thanks!',
  'One of the best articles I\'ve read on this topic.',
];

const seedDatabase = async () => {
  try {
    await connectDB();

    // Clear existing data
    console.log('Clearing existing data...');
    await Category.deleteMany();
    await Comment.deleteMany();
    
    // Don't delete users and posts to preserve existing data
    // await User.deleteMany();
    // await Post.deleteMany();

    // Create categories
    console.log('Creating categories...');
    const createdCategories = await Category.insertMany(categories);
    console.log(`✅ Created ${createdCategories.length} categories`);

    // Get existing posts and users
    const posts = await Post.find().limit(20);
    const users = await User.find();

    if (posts.length === 0 || users.length === 0) {
      console.log('⚠️  No posts or users found. Please create some posts first.');
      process.exit(0);
    }

    // Assign random categories to existing posts
    console.log('Assigning categories to posts...');
    for (const post of posts) {
      const randomCategory = createdCategories[Math.floor(Math.random() * createdCategories.length)];
      post.category = randomCategory._id;
      
      // Add some random tags
      const tagSets = [
        ['tutorial', 'beginner', 'guide'],
        ['tips', 'productivity', 'workflow'],
        ['news', 'update', 'latest'],
        ['advanced', 'expert', 'deep-dive'],
        ['opinion', 'discussion', 'thoughts']
      ];
      post.tags = tagSets[Math.floor(Math.random() * tagSets.length)];
      
      await post.save();
    }
    console.log(`✅ Updated ${posts.length} posts with categories and tags`);

    // Create sample comments
    console.log('Creating sample comments...');
    const comments = [];
    
    for (const post of posts.slice(0, 10)) {
      const numComments = Math.floor(Math.random() * 5) + 1; // 1-5 comments per post
      
      for (let i = 0; i < numComments; i++) {
        const randomUser = users[Math.floor(Math.random() * users.length)];
        const randomComment = sampleComments[Math.floor(Math.random() * sampleComments.length)];
        
        comments.push({
          postId: post._id,
          userId: randomUser._id,
          text: randomComment,
          date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) // Random date within last 30 days
        });
      }
    }

    if (comments.length > 0) {
      await Comment.insertMany(comments);
      console.log(`✅ Created ${comments.length} comments`);
    }

    // Mark some posts as featured
    console.log('Setting featured posts...');
    const featuredPosts = posts.slice(0, 3);
    for (const post of featuredPosts) {
      post.isFeatured = true;
      await post.save();
    }
    console.log(`✅ Marked ${featuredPosts.length} posts as featured`);

    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📊 Summary:');
    console.log(`   Categories: ${createdCategories.length}`);
    console.log(`   Posts Updated: ${posts.length}`);
    console.log(`   Comments: ${comments.length}`);
    console.log(`   Featured Posts: ${featuredPosts.length}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
