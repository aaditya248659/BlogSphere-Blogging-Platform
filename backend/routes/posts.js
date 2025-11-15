const express = require('express');
const router = express.Router();
const {
  getPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
  getUserPosts,
  getTrendingPosts,
  getPostStats,
  toggleTrending
} = require('../controllers/postController');
const { protect, admin, optionalAuth } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

router.get('/', optionalAuth, getPosts);
router.get('/trending', getTrendingPosts);
router.get('/admin/stats', protect, admin, getPostStats);
router.get('/:id', getPost);
router.get('/user/:userId', getUserPosts);
router.post('/', protect, upload.single('image'), createPost);
router.put('/:id', protect, upload.single('image'), updatePost);
router.put('/:id/trending', protect, admin, toggleTrending);
router.delete('/:id', protect, deletePost);

module.exports = router;