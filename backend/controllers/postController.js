const Post = require('../models/Post');
const { uploadToCloudinary } = require('../middleware/upload');

// @desc    Get all posts with pagination
// @route   GET /api/posts
// @access  Public
exports.getPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';
    const category = req.query.category || '';
    const tag = req.query.tag || '';
    const featured = req.query.featured === 'true';

    // Build query
    let query = {};

    // Search in title and content
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }

    // Filter by category
    if (category) {
      query.category = category;
    }

    // Filter by tag
    if (tag) {
      query.tags = { $in: [tag] };
    }

    // Filter featured posts
    if (featured) {
      query.isFeatured = true;
    }

    const total = await Post.countDocuments(query);
    const posts = await Post.find(query)
      .populate('authorId', 'username email')
      .populate('category', 'name slug color icon')
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      success: true,
      count: posts.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: posts
    });
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// @desc    Get single post
// @route   GET /api/posts/:id
// @access  Public
exports.getPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('authorId', 'username email');

    if (!post) {
      return res.status(404).json({ 
        success: false, 
        message: 'Post not found' 
      });
    }

    // Increment view count
    post.views = (post.views || 0) + 1;
    await post.save();

    res.json({
      success: true,
      data: post
    });
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// @desc    Create post
// @route   POST /api/posts
// @access  Private
exports.createPost = async (req, res) => {
  try {
    const { title, content, category, tags } = req.body;
    let imageUrl = '';

    // Upload image to Cloudinary if provided
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer);
      imageUrl = result.secure_url;
    }

    // Parse tags if it's a JSON string
    let tagsArray = [];
    if (tags) {
      try {
        tagsArray = typeof tags === 'string' ? JSON.parse(tags) : tags;
      } catch (e) {
        tagsArray = typeof tags === 'string' ? tags.split(',').map(t => t.trim()) : tags;
      }
    }

    const postData = {
      title,
      content,
      image: imageUrl,
      authorId: req.user._id
    };

    if (category) postData.category = category;
    if (tagsArray.length > 0) postData.tags = tagsArray;

    const post = await Post.create(postData);

    const populatedPost = await Post.findById(post._id)
      .populate('authorId', 'username email')
      .populate('category', 'name slug color icon');

    res.status(201).json({
      success: true,
      data: populatedPost
    });
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// @desc    Update post
// @route   PUT /api/posts/:id
// @access  Private
exports.updatePost = async (req, res) => {
  try {
    let post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ 
        success: false, 
        message: 'Post not found' 
      });
    }

    // Check if user is the author or admin
    if (post.authorId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to update this post' 
      });
    }

    const { title, content, category, tags } = req.body;
    let updateData = { title, content };

    // Parse tags if it's a JSON string
    if (tags !== undefined) {
      try {
        updateData.tags = typeof tags === 'string' ? JSON.parse(tags) : tags;
      } catch (e) {
        updateData.tags = typeof tags === 'string' ? tags.split(',').map(t => t.trim()) : tags;
      }
    }

    // Update category
    if (category !== undefined) {
      updateData.category = category || null;
    }

    // Upload new image if provided
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer);
      updateData.image = result.secure_url;
    }

    post = await Post.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('authorId', 'username email')
      .populate('category', 'name slug color icon');

    res.json({
      success: true,
      data: post
    });
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// @desc    Delete post
// @route   DELETE /api/posts/:id
// @access  Private
exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ 
        success: false, 
        message: 'Post not found' 
      });
    }

    // Check if user is the author or admin
    if (post.authorId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to delete this post' 
      });
    }

    await Post.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Post deleted successfully'
    });
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// @desc    Get trending posts (most commented)
// @route   GET /api/posts/trending
// @access  Public
exports.getTrendingPosts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;

    // Get admin-marked trending posts first, then high-view posts
    const posts = await Post.find()
      .populate('authorId', 'username email')
      .sort({ isTrending: -1, views: -1 })
      .limit(limit);

    res.json({
      success: true,
      count: posts.length,
      data: posts
    });
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// @desc    Get posts sorted by views (Admin only)
// @route   GET /api/posts/admin/stats
// @access  Private/Admin
exports.getPostStats = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('authorId', 'username email')
      .sort({ views: -1 })
      .select('title views isTrending authorId date');

    res.json({
      success: true,
      count: posts.length,
      data: posts
    });
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// @desc    Toggle trending status (Admin only)
// @route   PUT /api/posts/:id/trending
// @access  Private/Admin
exports.toggleTrending = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ 
        success: false, 
        message: 'Post not found' 
      });
    }

    post.isTrending = !post.isTrending;
    await post.save();

    const updatedPost = await Post.findById(post._id)
      .populate('authorId', 'username email');

    res.json({
      success: true,
      data: updatedPost,
      message: post.isTrending ? 'Post marked as trending' : 'Post removed from trending'
    });
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// @desc    Get user's posts
// @route   GET /api/posts/user/:userId
// @access  Public
exports.getUserPosts = async (req, res) => {
  try {
    const posts = await Post.find({ authorId: req.params.userId })
      .populate('authorId', 'username email')
      .sort({ date: -1 });

    res.json({
      success: true,
      count: posts.length,
      data: posts
    });
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      message: error.message 
    });
  }
};