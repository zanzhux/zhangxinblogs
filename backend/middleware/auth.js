const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');

// 基本认证中间件
exports.auth = async(req, res, next) => {
    try {
        console.log('\n=== Auth Middleware Start ===');
        console.log('Request URL:', req.originalUrl);
        console.log('Request Method:', req.method);
        console.log('Request Headers:', JSON.stringify(req.headers, null, 2));
        console.log('JWT_SECRET:', process.env.JWT_SECRET);
        console.log('NODE_ENV:', process.env.NODE_ENV);

        // Get token from header
        const authHeader = req.headers.authorization;
        console.log('Authorization header:', authHeader);

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            console.log('No token provided or invalid format');
            return res.status(401).json({
                message: '需要登录',
                details: 'No token provided or invalid format'
            });
        }

        const token = authHeader.split(' ')[1];
        console.log('Token:', token);

        // Verify token
        try {
            console.log('Verifying token with secret...');
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            console.log('Token verified successfully');
            console.log('Decoded token:', JSON.stringify(decoded, null, 2));

            // 从数据库获取完整的用户信息
            console.log('Querying database for user:', decoded.user.id);
            const [users] = await pool.query(
                'SELECT id, username, email, role FROM users WHERE id = ?', [decoded.user.id]
            );
            console.log('Database query result:', JSON.stringify(users, null, 2));

            if (users.length === 0) {
                console.log('User not found in database');
                return res.status(401).json({
                    message: '用户不存在',
                    details: 'User not found in database'
                });
            }

            // Add complete user info to request
            req.user = users[0];
            console.log('User set on request:', JSON.stringify(req.user, null, 2));
            console.log('User role:', req.user.role);
            console.log('=== Auth Middleware End ===\n');

            // 如果是需要管理员权限的路由，检查用户角色
            if (req.originalUrl.includes('/articles') &&
                !req.originalUrl.includes('/comments') && // 排除评论相关的路由
                !req.originalUrl.includes('/like') && // 排除点赞相关的路由
                (req.method === 'POST' || req.method === 'PUT' || req.method === 'DELETE')) {
                if (req.user.role !== 'admin') {
                    console.log('Access denied: User is not an admin');
                    return res.status(403).json({ message: '只有管理员可以执行此操作' });
                }
                console.log('Admin access granted');
            }

            next();
        } catch (jwtError) {
            console.error('JWT verification error:', {
                name: jwtError.name,
                message: jwtError.message,
                stack: jwtError.stack,
                token: token,
                secret: process.env.JWT_SECRET
            });

            return res.status(401).json({
                message: '无效的令牌',
                details: jwtError.message
            });
        }
    } catch (error) {
        console.error('Auth middleware error:', {
            name: error.name,
            message: error.message,
            stack: error.stack
        });
        return res.status(500).json({
            message: '服务器错误',
            details: error.message
        });
    }
};

// 管理员权限中间件
exports.adminAuth = async(req, res, next) => {
    try {
        console.log('\n=== Admin Auth Middleware Start ===');
        console.log('Request Method:', req.method);
        console.log('Request URL:', req.originalUrl);
        console.log('User from auth middleware:', req.user);

        // 检查用户是否存在（应该由 auth 中间件设置）
        if (!req.user) {
            console.log('No user found in request');
            return res.status(401).json({ message: '需要登录' });
        }

        // 检查用户角色
        console.log('User role:', req.user.role);
        if (req.user.role !== 'admin') {
            console.log('Access denied: User is not an admin');
            return res.status(403).json({ message: '只有管理员可以执行此操作' });
        }

        console.log('Admin access granted');
        console.log('=== Admin Auth Middleware End ===\n');
        next();
    } catch (error) {
        console.error('Admin auth middleware error:', error);
        console.error('Stack trace:', error.stack);
        return res.status(500).json({ message: '服务器错误' });
    }
};

// 作者权限中间件
exports.authorAuth = async(req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: '需要登录' });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 从数据库获取完整的用户信息
        const [users] = await pool.query(
            'SELECT id, username, email, role FROM users WHERE id = ?', [decoded.user.id]
        );

        if (users.length === 0) {
            return res.status(401).json({ message: '用户不存在' });
        }

        // 检查是否是作者或管理员
        if (users[0].role !== 'author' && users[0].role !== 'admin') {
            return res.status(403).json({ message: '您没有权限执行此操作' });
        }

        req.user = users[0];
        next();
    } catch (error) {
        console.error('认证错误:', error);
        return res.status(401).json({ message: '无效的令牌' });
    }
};

// 检查是否已存在作者账户的中间件
exports.checkAuthorExists = async(req, res, next) => {
    try {
        const [authors] = await pool.query('SELECT * FROM users WHERE role = ?', ['author']);

        if (authors.length > 0) {
            return res.status(403).json({ message: '已存在作者账户，不能创建新的作者账户' });
        }

        next();
    } catch (error) {
        return res.status(500).json({ message: '服务器错误' });
    }
};