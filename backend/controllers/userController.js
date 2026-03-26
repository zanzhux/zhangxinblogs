const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');

// Register new user
exports.register = async(req, res) => {
    const { username, email, password, role } = req.body;

    try {
        // Check if user already exists
        const [existingUsers] = await pool.query(
            'SELECT * FROM users WHERE email = ?', [email]
        );

        if (existingUsers.length > 0) {
            return res.status(400).json({ message: '该邮箱已被注册' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 如果请求的是作者角色，需要通过中间件检查
        const userRole = role === 'author' ? 'author' : 'user';

        // Insert new user
        const [result] = await pool.query(
            'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)', [username, email, hashedPassword, userRole]
        );

        // Generate JWT token
        const payload = {
            user: {
                id: result.insertId,
                username,
                email,
                role: userRole
            }
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.status(201).json({
            message: '注册成功',
            token,
            user: {
                id: result.insertId,
                username,
                email,
                role: userRole
            }
        });
    } catch (error) {
        console.error('注册错误:', error);
        res.status(500).json({ message: '服务器错误' });
    }
};

// @route   POST /api/users/login
// @desc    Login user & get token
// @access  Public
exports.loginUser = async(req, res) => {
    console.log('收到登录请求');
    console.log('请求头:', req.headers);
    console.log('请求体:', req.body);
    console.log('JWT_SECRET:', process.env.JWT_SECRET);

    const { email, password } = req.body;

    // 验证请求数据
    if (!email || !password) {
        console.log('缺少必要的登录信息:', {
            hasEmail: !!email,
            hasPassword: !!password
        });
        return res.status(400).json({
            message: '请提供邮箱和密码',
            details: {
                email: !email ? '邮箱不能为空' : null,
                password: !password ? '密码不能为空' : null
            }
        });
    }

    try {
        console.log('正在查询用户:', email);

        // 检查用户是否存在
        const [users] = await pool.query(
            'SELECT * FROM users WHERE email = ?', [email]
        );

        console.log('数据库查询结果:', {
            找到用户: users.length > 0,
            用户数量: users.length,
            用户角色: users[0] && users[0].role
        });

        if (users.length === 0) {
            console.log('用户不存在:', email);
            return res.status(400).json({ message: '用户不存在' });
        }

        const user = users[0];

        // 验证密码
        console.log('正在验证密码');
        const isMatch = await bcrypt.compare(password, user.password);
        console.log('密码验证结果:', isMatch);

        if (!isMatch) {
            console.log('密码不匹配');
            return res.status(400).json({ message: '邮箱或密码错误' });
        }

        // 创建JWT令牌
        console.log('正在生成JWT令牌');
        const payload = {
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        };

        console.log('Token payload:', JSON.stringify(payload, null, 2));
        console.log('Current timestamp:', Math.floor(Date.now() / 1000));
        console.log('Expiration in 24h:', Math.floor(Date.now() / 1000) + (24 * 60 * 60));

        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' });

        // 解码生成的token进行验证
        const decoded = jwt.decode(token);
        console.log('Generated token decoded:', JSON.stringify(decoded, null, 2));
        console.log('Token expiration time:', new Date(decoded.exp * 1000).toISOString());
        console.log('Time until expiration:', decoded.exp - Math.floor(Date.now() / 1000), 'seconds');

        // 返回不包含密码的用户信息和令牌
        const { password: _, ...userWithoutPassword } = user;
        console.log('登录成功，返回数据:', {
            userId: user.id,
            role: user.role,
            token: token.substring(0, 20) + '...',
            tokenExpiration: new Date(decoded.exp * 1000).toISOString()
        });

        res.json({
            token,
            user: userWithoutPassword
        });
    } catch (error) {
        console.error('登录过程中出现错误:', error);
        res.status(500).json({
            message: '服务器错误',
            details: error.message
        });
    }
};

// Get user profile
exports.getProfile = async(req, res) => {
    try {
        const [users] = await pool.query(
            'SELECT id, username, email, avatar, role, created_at FROM users WHERE id = ?', [req.user.id]
        );

        if (users.length === 0) {
            return res.status(404).json({ message: '用户不存在' });
        }

        res.json(users[0]);
    } catch (error) {
        console.error('获取个人资料错误:', error);
        res.status(500).json({ message: '服务器错误' });
    }
};

// Update user profile
exports.updateProfile = async(req, res) => {
    const { username, avatar } = req.body;

    try {
        await pool.query(
            'UPDATE users SET username = ?, avatar = ? WHERE id = ?', [username, avatar, req.user.id]
        );

        res.json({ message: '个人资料已更新' });
    } catch (error) {
        console.error('更新个人资料错误:', error);
        res.status(500).json({ message: '服务器错误' });
    }
};

// Admin: Get all users
exports.getAllUsers = async(req, res) => {
    try {
        const [users] = await pool.query(
            'SELECT id, username, email, avatar, role, created_at FROM users ORDER BY created_at DESC'
        );

        res.json(users);
    } catch (error) {
        console.error('获取用户列表错误:', error);
        res.status(500).json({ message: '服务器错误' });
    }
};

// Admin: Update user role
exports.updateUserRole = async(req, res) => {
    const { userId, role } = req.body;

    if (role !== 'author' && role !== 'user') {
        return res.status(400).json({ message: '无效的角色类型' });
    }

    try {
        // 如果要设置为作者角色，先检查是否已存在作者
        if (role === 'author') {
            const [authors] = await pool.query(
                'SELECT * FROM users WHERE role = ? AND id != ?', ['author', userId]
            );

            if (authors.length > 0) {
                return res.status(403).json({ message: '已存在作者账户，不能创建新的作者账户' });
            }
        }

        await pool.query(
            'UPDATE users SET role = ? WHERE id = ?', [role, userId]
        );

        res.json({ message: '用户角色已更新' });
    } catch (error) {
        console.error('更新用户角色错误:', error);
        res.status(500).json({ message: '服务器错误' });
    }
};

// Admin: Delete user
exports.deleteUser = async(req, res) => {
    const userId = req.params.id;

    try {
        // Check if trying to delete an admin
        const [user] = await pool.query(
            'SELECT role FROM users WHERE id = ?', [userId]
        );

        if (user.length > 0 && user[0].role === 'admin') {
            return res.status(403).json({ message: '不能删除管理员账户' });
        }

        await pool.query('DELETE FROM users WHERE id = ?', [userId]);
        res.json({ message: '用户已删除' });
    } catch (error) {
        console.error('删除用户错误:', error);
        res.status(500).json({ message: '服务器错误' });
    }
};

// Initialize admin user
exports.initializeAdmin = async(req, res) => {
    try {
        // 生成密码哈希
        const password = '123456';
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 删除现有管理员账户
        await pool.query('DELETE FROM users WHERE role = ?', ['admin']);

        // 创建新的管理员账户
        const [result] = await pool.query(
            'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)', ['admin', 'admin@admin.com', hashedPassword, 'admin']
        );

        console.log('管理员账户创建成功:', {
            id: result.insertId,
            email: 'admin@admin.com',
            role: 'admin'
        });

        res.json({ message: '管理员账户初始化成功' });
    } catch (error) {
        console.error('初始化管理员账户失败:', error);
        res.status(500).json({ message: '服务器错误' });
    }
};