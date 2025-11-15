const Comment = require('../models/Comment');
const Post = require('../models/Post');

// @desc    Get comments by post
// @route   GET /api/comments/:postId
// @access  Public
exports.getCommentsByPost = async (req, res) => {
  try {
    // Check if post exists
    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ 
        success: false, 
        message: 'Post not found' 
      });
    }

    const comments = await Comment.find({ postId: req.params.postId })
      .populate('userId', 'username email')
      .sort({ date: -1 });

    res.json({
      success: true,
      count: comments.length,
      data: comments
    });
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// @desc    Create comment
// @route   POST /api/comments
// @access  Private
exports.createComment = async (req, res) => {
  try {
    const { postId, text } = req.body;

    // Check if post exists
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ 
        success: false, 
        message: 'Post not found' 
      });
    }

    const comment = await Comment.create({
      postId,
      userId: req.user._id,
      text
    });

    const populatedComment = await Comment.findById(comment._id)
      .populate('userId', 'username email');

    res.status(201).json({
      success: true,
      data: populatedComment
    });
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// @desc    Update comment
// @route   PUT /api/comments/:id
// @access  Private
exports.updateComment = async (req, res) => {
  try {
    let comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ 
        success: false, 
        message: 'Comment not found' 
      });
    }

    // Check if user is the comment author or admin
    if (comment.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to update this comment' 
      });
    }

    comment = await Comment.findByIdAndUpdate(
      req.params.id,
      { text: req.body.text },
      { new: true, runValidators: true }
    ).populate('userId', 'username email');

    res.json({
      success: true,
      data: comment
    });
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// @desc    Delete comment
// @route   DELETE /api/comments/:id
// @access  Private
exports.deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ 
        success: false, 
        message: 'Comment not found' 
      });
    }

    // Check if user is the comment author or admin
    if (comment.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to delete this comment' 
      });
    }

    await Comment.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Comment deleted successfully'
    });
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      message: error.message 
    });
  }
};