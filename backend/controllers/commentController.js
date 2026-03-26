const { pool } = require('../config/db');

// Get comments for an article
exports.getCommentsByArticle = async(req, res) => {
    try {
        const [comments] = await pool.query(`
      SELECT c.*, u.username, u.avatar 
      FROM comments c 
      JOIN users u ON c.user_id = u.id 
      WHERE c.article_id = ? 
      ORDER BY c.created_at DESC
    `, [req.params.articleId]);

        res.json(comments);
    } catch (error) {
        console.error('Get comments by article error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Create new comment
exports.createComment = async(req, res) => {
    const { article_id, content } = req.body;

    try {
        // Check if article exists
        const [articles] = await pool.query(
            'SELECT * FROM articles WHERE id = ?', [article_id]
        );

        if (articles.length === 0) {
            return res.status(404).json({ message: 'Article not found' });
        }

        // Create comment
        const [result] = await pool.query(
            'INSERT INTO comments (article_id, user_id, content) VALUES (?, ?, ?)', [article_id, req.user.id, content]
        );

        // Get the newly created comment with user info
        const [comments] = await pool.query(`
      SELECT c.*, u.username, u.avatar 
      FROM comments c 
      JOIN users u ON c.user_id = u.id 
      WHERE c.id = ?
    `, [result.insertId]);

        res.status(201).json({
            message: 'Comment created successfully',
            comment: comments[0]
        });
    } catch (error) {
        console.error('Create comment error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Delete comment
exports.deleteComment = async(req, res) => {
    try {
        // Check if comment exists and belongs to user
        const [comments] = await pool.query(
            'SELECT * FROM comments WHERE id = ?', [req.params.id]
        );

        if (comments.length === 0) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        if (comments[0].user_id !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to delete this comment' });
        }

        // Delete comment
        await pool.query(
            'DELETE FROM comments WHERE id = ?', [req.params.id]
        );

        res.json({ message: 'Comment deleted successfully' });
    } catch (error) {
        console.error('Delete comment error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};