const { pool } = require('../config/db');

// Get all articles
exports.getAllArticles = async(req, res) => {
    try {
        console.log('Fetching all articles...');
        const [articles] = await pool.query(`
            SELECT 
                a.*,
                '张鑫' as username,
                u.avatar,
                (SELECT COUNT(*) FROM comments WHERE article_id = a.id) AS comments_count,
                (SELECT COUNT(*) FROM likes WHERE article_id = a.id) AS likes_count,
                GROUP_CONCAT(DISTINCT t.name) as tags,
                a.cover_image
            FROM articles a
            JOIN users u ON a.user_id = u.id
            LEFT JOIN blog_tags bt ON a.id = bt.article_id
            LEFT JOIN tags t ON bt.tag_id = t.id
            GROUP BY a.id, a.title, a.content, a.category, a.user_id, a.created_at, a.cover_image
            ORDER BY a.created_at DESC
        `);

        console.log('Articles fetched:', articles.map(a => ({
            id: a.id,
            title: a.title,
            hasCoverImage: !!a.cover_image,
            coverImageLength: a.cover_image ? a.cover_image.length : 0
        })));

        // 为每篇文章添加作者对象并处理标签
        const articlesWithAuthor = articles.map(article => ({
            ...article,
            author: {
                username: '张鑫',
                avatar: article.avatar
            },
            tags: article.tags ? article.tags.split(',') : []
        }));

        res.json(articlesWithAuthor);
    } catch (error) {
        console.error('获取文章列表错误:', error);
        res.status(500).json({ message: '服务器错误' });
    }
};

// Get single article
exports.getArticleById = async(req, res) => {
    try {
        console.log('Getting article by ID:', req.params.id);
        console.log('User:', req.user);

        const [articles] = await pool.query(`
            SELECT 
                a.*,
                '张鑫' as username,
                u.avatar,
                (SELECT COUNT(*) FROM comments WHERE article_id = a.id) AS comments_count,
                (SELECT COUNT(*) FROM likes WHERE article_id = a.id) AS likes_count,
                GROUP_CONCAT(DISTINCT t.name) as tags
            FROM articles a
            JOIN users u ON a.user_id = u.id
            LEFT JOIN blog_tags bt ON a.id = bt.article_id
            LEFT JOIN tags t ON bt.tag_id = t.id
            WHERE a.id = ?
            GROUP BY a.id, a.title, a.content, a.category, a.user_id, a.created_at, a.cover_image
        `, [req.params.id]);

        console.log('Query result:', articles);

        if (articles.length === 0) {
            console.log('Article not found');
            return res.status(404).json({ message: '文章不存在' });
        }

        // Check if user has liked the article (if user is logged in)
        let userLiked = false;
        if (req.user) {
            const [likes] = await pool.query(
                'SELECT * FROM likes WHERE user_id = ? AND article_id = ?', [req.user.id, req.params.id]
            );
            userLiked = likes.length > 0;
        }

        // Get comments for the article
        const [comments] = await pool.query(`
            SELECT c.*, u.username, u.avatar
            FROM comments c
            JOIN users u ON c.user_id = u.id
            WHERE c.article_id = ?
            ORDER BY c.created_at DESC
        `, [req.params.id]);

        // Add author object to the article and process tags
        const article = articles[0];
        const articleWithAuthor = {
            ...article,
            author: {
                username: '张鑫',
                avatar: article.avatar
            },
            tags: article.tags ? article.tags.split(',') : [],
            comments,
            userLiked
        };

        console.log('Sending article response:', {
            id: articleWithAuthor.id,
            title: articleWithAuthor.title,
            hasContent: !!articleWithAuthor.content,
            hasCoverImage: !!articleWithAuthor.cover_image,
            tags: articleWithAuthor.tags
        });

        res.json(articleWithAuthor);
    } catch (error) {
        console.error('获取文章详情错误:', error);
        res.status(500).json({ message: '服务器错误' });
    }
};

// Create new article
exports.createArticle = async(req, res) => {
    console.log('=== Article Creation Start ===');
    console.log('Request body:', {
        title: req.body.title,
        category: req.body.category,
        tags: req.body.tags,
        hasContent: !!req.body.content,
        hasCoverImage: !!req.body.cover_image,
        coverImageLength: req.body.cover_image ? req.body.cover_image.length : 0,
        coverImageType: req.body.cover_image ? req.body.cover_image.substring(0, 50) + '...' : null
    });
    console.log('User object:', req.user);

    const { title, content, category, tags, cover_image } = req.body;
    const userId = req.user.user ? req.user.user.id : req.user.id;

    // 验证图片数据
    if (cover_image) {
        console.log('Validating cover image:', {
            isBase64: cover_image.startsWith('data:image'),
            length: cover_image.length,
            preview: cover_image.substring(0, 50) + '...'
        });

        // 验证图片大小（base64字符串长度）
        const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
        if (cover_image.length > MAX_IMAGE_SIZE) {
            return res.status(400).json({
                error: '图片大小不能超过5MB'
            });
        }

        // 验证图片格式
        if (!cover_image.startsWith('data:image/')) {
            return res.status(400).json({
                error: '不支持的图片格式'
            });
        }
    }

    // 验证必填字段
    if (!title || !content || !category) {
        console.log('Validation failed:', { hasTitle: !!title, hasContent: !!content, hasCategory: !!category });
        return res.status(400).json({
            error: '标题、内容和分类都是必填项'
        });
    }

    // 验证标签格式
    if (tags && !Array.isArray(tags)) {
        console.log('Invalid tags format:', tags);
        return res.status(400).json({
            error: '标签必须是数组格式'
        });
    }

    const conn = await pool.getConnection();

    try {
        await conn.beginTransaction();
        console.log('Starting transaction...');

        // 首先确保用户名为"张鑫"
        await conn.query(
            'UPDATE users SET username = ? WHERE id = ?', ['张鑫', userId]
        );

        // 插入文章
        console.log('Inserting article with data:', {
            title,
            contentLength: content.length,
            category,
            userId,
            hasCoverImage: !!cover_image,
            coverImageType: cover_image ? typeof cover_image : null,
            coverImagePreview: cover_image ? cover_image.substring(0, 50) + '...' : null
        });

        const [articleResult] = await conn.query(
            'INSERT INTO articles (title, content, category, user_id, cover_image) VALUES (?, ?, ?, ?, ?)', [title, content, category, userId, cover_image]
        );
        const articleId = articleResult.insertId;
        console.log('Article inserted successfully, ID:', articleId);

        // 验证图片是否正确保存
        const [savedArticle] = await conn.query(
            'SELECT cover_image FROM articles WHERE id = ?', [articleId]
        );
        console.log('Saved article cover image:', {
            exists: !!savedArticle[0].cover_image,
            length: savedArticle[0].cover_image ? savedArticle[0].cover_image.length : 0,
            preview: savedArticle[0].cover_image ? savedArticle[0].cover_image.substring(0, 50) + '...' : null
        });

        // 处理标签
        if (tags && tags.length > 0) {
            console.log('Processing tags:', tags);
            for (const tagName of tags) {
                // 尝试插入标签（如果不存在）
                console.log('Inserting/getting tag:', tagName);
                await conn.query(
                    'INSERT IGNORE INTO tags (name) VALUES (?)', [tagName]
                );

                // 获取标签ID
                const [tagRows] = await conn.query(
                    'SELECT id FROM tags WHERE name = ?', [tagName]
                );
                console.log('Tag query result:', tagRows);

                if (tagRows.length > 0) {
                    // 创建文章和标签的关联
                    console.log('Creating article-tag association:', { articleId, tagId: tagRows[0].id });
                    await conn.query(
                        'INSERT INTO blog_tags (article_id, tag_id) VALUES (?, ?)', [articleId, tagRows[0].id]
                    );
                }
            }
        }

        await conn.commit();
        console.log('Transaction committed');

        // 获取完整的文章信息，包括标签
        const [articles] = await conn.query(`
            SELECT 
                a.*,
                GROUP_CONCAT(t.name) as tags
            FROM articles a
            LEFT JOIN blog_tags bt ON a.id = bt.article_id
            LEFT JOIN tags t ON bt.tag_id = t.id
            WHERE a.id = ?
            GROUP BY a.id, a.title, a.content, a.category, a.user_id, a.created_at
        `, [articleId]);

        const article = articles[0];
        if (article) {
            article.tags = article.tags ? article.tags.split(',') : [];
        }

        console.log('Sending response:', { article });
        res.status(201).json({ article });
    } catch (error) {
        await conn.rollback();
        console.error('Error creating article:', error);
        res.status(500).json({
            error: 'Failed to create article',
            details: error.message
        });
    } finally {
        conn.release();
    }
};

// Update article
exports.updateArticle = async(req, res) => {
    const { title, content, cover_image } = req.body;
    const articleId = req.params.id;

    try {
        // 更新文章
        await pool.query(
            'UPDATE articles SET title = ?, content = ?, cover_image = ? WHERE id = ?', [title, content, cover_image, articleId]
        );

        // 获取更新后的文章数据
        const [articles] = await pool.query(`
            SELECT 
                a.*,
                '张鑫' as username,
                u.avatar,
                (SELECT COUNT(*) FROM comments WHERE article_id = a.id) AS comments_count,
                (SELECT COUNT(*) FROM likes WHERE article_id = a.id) AS likes_count
            FROM articles a
            JOIN users u ON a.user_id = u.id
            WHERE a.id = ?
        `, [articleId]);

        if (articles.length === 0) {
            return res.status(404).json({ message: '文章不存在' });
        }

        // 添加作者信息
        const updatedArticle = {
            ...articles[0],
            author: {
                username: '张鑫',
                avatar: articles[0].avatar
            }
        };

        res.json(updatedArticle);
    } catch (error) {
        console.error('更新文章错误:', error);
        res.status(500).json({ message: '服务器错误' });
    }
};

// Delete article
exports.deleteArticle = async(req, res) => {
    const articleId = req.params.id;
    const conn = await pool.getConnection();

    try {
        console.log('Starting article deletion process...');
        console.log('Article ID:', articleId);
        console.log('User:', req.user);

        // 开始事务
        await conn.beginTransaction();

        // 检查文章是否存在
        const [article] = await conn.query('SELECT * FROM articles WHERE id = ?', [articleId]);

        if (article.length === 0) {
            await conn.rollback();
            return res.status(404).json({ message: '文章不存在' });
        }

        console.log('Article found:', article[0]);

        // 首先删除相关的评论和点赞
        console.log('Deleting related comments...');
        await conn.query('DELETE FROM comments WHERE article_id = ?', [articleId]);

        console.log('Deleting related likes...');
        await conn.query('DELETE FROM likes WHERE article_id = ?', [articleId]);

        console.log('Deleting related tags...');
        await conn.query('DELETE FROM blog_tags WHERE article_id = ?', [articleId]);

        // 然后删除文章
        console.log('Deleting the article...');
        const [deleteResult] = await conn.query('DELETE FROM articles WHERE id = ?', [articleId]);

        if (deleteResult.affectedRows === 0) {
            await conn.rollback();
            return res.status(404).json({ message: '文章删除失败' });
        }

        // 提交事务
        await conn.commit();
        console.log('Article deletion successful');

        res.json({ message: '文章删除成功' });
    } catch (error) {
        console.error('删除文章错误:', error);
        await conn.rollback();
        res.status(500).json({ message: '服务器错误', error: error.message });
    } finally {
        conn.release();
    }
};

// Add comment
exports.addComment = async(req, res) => {
    try {
        const articleId = req.params.id;
        const userId = req.user.id;
        const { content } = req.body;

        if (!content) {
            return res.status(400).json({ msg: '评论内容不能为空' });
        }

        // 检查文章是否存在
        const [article] = await pool.query(
            'SELECT * FROM articles WHERE id = ?', [articleId]
        );

        if (article.length === 0) {
            return res.status(404).json({ msg: '文章不存在' });
        }

        // 添加评论
        const [result] = await pool.query(
            'INSERT INTO comments (article_id, user_id, content) VALUES (?, ?, ?)', [articleId, userId, content]
        );

        // 获取新添加的评论（包括用户信息）
        const [newComment] = await pool.query(
            `SELECT c.*, u.username, u.avatar 
             FROM comments c
             JOIN users u ON c.user_id = u.id
             WHERE c.id = ?`, [result.insertId]
        );

        return res.status(201).json(newComment[0]);
    } catch (error) {
        console.error('添加评论错误:', error);
        if (!res.headersSent) {
            return res.status(500).json({ msg: '服务器错误' });
        }
    }
};

// Delete comment (comment owner or admin)
exports.deleteComment = async(req, res) => {
    try {
        const commentId = req.params.commentId;
        const userId = req.user.id;

        // 获取评论
        const [comment] = await pool.query(
            'SELECT * FROM comments WHERE id = ?', [commentId]
        );

        if (comment.length === 0) {
            return res.status(404).json({ msg: '评论不存在' });
        }

        // 检查是否是评论作者或管理员
        if (comment[0].user_id !== userId && req.user.role !== 'admin') {
            return res.status(403).json({ msg: '无权删除此评论' });
        }

        // 删除评论
        await pool.query('DELETE FROM comments WHERE id = ?', [commentId]);

        return res.json({ msg: '评论删除成功' });
    } catch (error) {
        console.error('删除评论错误:', error);
        if (!res.headersSent) {
            return res.status(500).json({ msg: '服务器错误' });
        }
    }
};

// Like article
exports.likeArticle = async(req, res) => {
    try {
        const articleId = req.params.id;
        const userId = req.user.id;

        // 检查文章是否存在
        const [article] = await pool.query(
            'SELECT * FROM articles WHERE id = ?', [articleId]
        );

        if (article.length === 0) {
            return res.status(404).json({ msg: '文章不存在' });
        }

        // 检查用户是否已经点赞
        const [existingLike] = await pool.query(
            'SELECT * FROM likes WHERE article_id = ? AND user_id = ?', [articleId, userId]
        );

        if (existingLike.length > 0) {
            // 用户已点赞，取消点赞
            await pool.query(
                'DELETE FROM likes WHERE article_id = ? AND user_id = ?', [articleId, userId]
            );
            return res.json({ msg: '取消点赞成功', liked: false });
        } else {
            // 用户未点赞，添加点赞
            await pool.query(
                'INSERT INTO likes (article_id, user_id) VALUES (?, ?)', [articleId, userId]
            );
            return res.json({ msg: '点赞成功', liked: true });
        }
    } catch (error) {
        console.error('点赞操作错误:', error);
        // 确保只在未发送响应的情况下发送错误响应
        if (!res.headersSent) {
            return res.status(500).json({ msg: '服务器错误' });
        }
    }
};

// Admin: Get dashboard stats
exports.getDashboardStats = async(req, res) => {
    try {
        const [articlesCount] = await pool.query('SELECT COUNT(*) as count FROM articles');
        const [commentsCount] = await pool.query('SELECT COUNT(*) as count FROM comments');
        const [usersCount] = await pool.query('SELECT COUNT(*) as count FROM users');
        const [likesCount] = await pool.query('SELECT COUNT(*) as count FROM likes');

        // 最近的5篇文章
        const [recentArticles] = await pool.query(`
            SELECT 
                a.*,
                '张鑫' as username,
                u.avatar
            FROM articles a
            JOIN users u ON a.user_id = u.id
            ORDER BY a.created_at DESC
            LIMIT 5
        `);

        // 为每篇文章添加作者对象
        const recentArticlesWithAuthor = recentArticles.map(article => ({
            ...article,
            author: {
                username: '张鑫',
                avatar: article.avatar
            }
        }));

        // 最近的5条评论
        const [recentComments] = await pool.query(`
            SELECT 
                c.*,
                '张鑫' as username,
                u.avatar,
                a.title as article_title
            FROM comments c
            JOIN users u ON c.user_id = u.id
            JOIN articles a ON c.article_id = a.id
            ORDER BY c.created_at DESC
            LIMIT 5
        `);

        res.json({
            counts: {
                articles: articlesCount[0].count,
                comments: commentsCount[0].count,
                users: usersCount[0].count,
                likes: likesCount[0].count
            },
            recentArticles: recentArticlesWithAuthor,
            recentComments
        });
    } catch (error) {
        console.error('获取统计数据错误:', error);
        res.status(500).json({ message: '服务器错误' });
    }
};

// Get articles by user ID
exports.getArticlesByUser = async(req, res) => {
    try {
        const [articles] = await pool.query(`
            SELECT 
                a.*,
                '张鑫' as username,
                u.avatar
            FROM articles a
            JOIN users u ON a.user_id = u.id
            WHERE a.user_id = ?
            ORDER BY a.created_at DESC
        `, [req.params.userId]);

        // 为每篇文章添加作者对象
        const articlesWithAuthor = articles.map(article => ({
            ...article,
            author: {
                username: '张鑫',
                avatar: article.avatar
            }
        }));

        res.json(articlesWithAuthor);
    } catch (error) {
        console.error('Get articles by user error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};