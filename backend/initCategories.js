const mongoose = require('mongoose');
const dotenv = require('dotenv');
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
  { name: 'Technology', slug: 'technology', description: 'Tech news, tutorials, and innovations', icon: '💻', color: '#667eea' },
  { name: 'Programming', slug: 'programming', description: 'Code tutorials and development tips', icon: '⚡', color: '#f093fb' },
  { name: 'Web Development', slug: 'web-development', description: 'Frontend, backend, and full-stack', icon: '🌐', color: '#4facfe' },
  { name: 'Lifestyle', slug: 'lifestyle', description: 'Life tips, health, and wellness', icon: '🌟', color: '#43e97b' },
  { name: 'Business', slug: 'business', description: 'Entrepreneurship and business insights', icon: '💼', color: '#fa709a' },
  { name: 'Design', slug: 'design', description: 'UI/UX and graphic design', icon: '🎨', color: '#30cfd0' },
  { name: 'Science', slug: 'science', description: 'Scientific discoveries and research', icon: '🔬', color: '#a8edea' },
  { name: 'Travel', slug: 'travel', description: 'Travel guides and adventures', icon: '✈️', color: '#ffd89b' },
];

const initializeCategories = async () => {
  try {
    await connectDB();

    // Check if categories already exist
    const existingCount = await Category.countDocuments();
    
    if (existingCount > 0) {
      console.log(`ℹ️  ${existingCount} categories already exist. Skipping initialization.`);
      console.log('To reset categories, delete them manually and run this script again.');
      process.exit(0);
    }

    // Create categories
    console.log('Creating categories...');
    const createdCategories = await Category.insertMany(categories);
    console.log(`✅ Successfully created ${createdCategories.length} categories!`);
    
    console.log('\nCreated categories:');
    createdCategories.forEach(cat => {
      console.log(`  ${cat.icon} ${cat.name} (${cat.slug})`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error initializing categories:', error);
    process.exit(1);
  }
};

initializeCategories();
