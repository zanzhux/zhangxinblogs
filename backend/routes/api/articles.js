const express = require('express');
const router = express.Router();
const articleController = require('../../controllers/articleController');
const { auth, adminAuth } = require('../../middleware/auth');
const { pool } = require('../../config/db');

// 应用全局认证中间件
router.use((req, res, next) => {
    console.log('\n=== Route Handler Start ===');
    console.log('Request URL:', req.originalUrl);
    console.log('Request Method:', req.method);
    console.log('Request Headers:', req.headers);
    next();
});

// @route   GET /api/articles
// @desc    Get all articles
// @access  Public
router.get('/', articleController.getAllArticles);

// @route   GET /api/articles/:id
// @desc    Get article by ID
// @access  Public
router.get('/:id', articleController.getArticleById);

// @route   POST /api/articles
// @desc    Create a new article
// @access  Admin only
router.post('/', auth, articleController.createArticle);

// @route   PUT /api/articles/:id
// @desc    Update article
// @access  Admin only
router.put('/:id', auth, articleController.updateArticle);

// @route   DELETE /api/articles/:id
// @desc    Delete article
// @access  Admin only
router.delete('/:id', auth, articleController.deleteArticle);

// @route   POST /api/articles/:id/comments
// @desc    Add comment to article
// @access  Private
router.post('/:id/comments', auth, articleController.addComment);

// @route   DELETE /api/articles/:id/comments/:commentId
// @desc    Delete comment
// @access  Private
router.delete('/:id/comments/:commentId', auth, articleController.deleteComment);

// @route   POST /api/articles/:id/like
// @desc    Like/unlike article
// @access  Private
router.post('/:id/like', auth, articleController.likeArticle);

// @route   GET /api/articles/dashboard/stats
// @desc    Get dashboard statistics
// @access  Admin only
router.get('/dashboard/stats', auth, articleController.getDashboardStats);

// @route   GET /api/articles/test-db
// @desc    Test database connection
// @access  Public
router.get('/test-db', async(req, res) => {
    try {
        const connection = await pool.getConnection();
        console.log('数据库连接测试成功');

        // 测试查询
        const [result] = await connection.query('SELECT 1');
        connection.release();

        res.json({
            message: '数据库连接正常',
            dbConfig: {
                host: process.env.DB_HOST,
                user: process.env.DB_USER,
                database: process.env.DB_NAME
            }
        });
    } catch (error) {
        console.error('数据库连接测试失败:', error);
        res.status(500).json({
            message: '数据库连接失败',
            error: error.message
        });
    }
});

module.exports = router;