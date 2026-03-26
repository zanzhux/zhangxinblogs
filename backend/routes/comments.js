const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const { auth } = require('../middleware/auth');

// Get comments for an article
router.get('/article/:articleId', commentController.getCommentsByArticle);

// Create new comment (protected)
router.post('/', auth, commentController.createComment);

// Delete comment (protected)
router.delete('/:id', auth, commentController.deleteComment);

module.exports = router;