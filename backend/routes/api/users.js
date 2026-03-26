const express = require('express');
const router = express.Router();
const userController = require('../../controllers/userController');
const { auth, adminAuth } = require('../../middleware/auth');
const { pool } = require('../../config/db');
const bcrypt = require('bcryptjs');

// @route   POST /api/users/register
// @desc    Register a user
// @access  Public
router.post('/register', userController.register);

// @route   POST /api/users/login
// @desc    Login user & get token
// @access  Public
router.post('/login', userController.loginUser);

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', auth, userController.getProfile);

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', auth, userController.updateProfile);

// === 管理员路由 ===

// @route   GET /api/users
// @desc    Get all users
// @access  Admin
router.get('/', auth, adminAuth, userController.getAllUsers);

// @route   PUT /api/users/role
// @desc    Update user role
// @access  Admin
router.put('/role', auth, adminAuth, userController.updateUserRole);

// @route   DELETE /api/users/:id
// @desc    Delete user
// @access  Admin
router.delete('/:id', auth, adminAuth, userController.deleteUser);

// @route   GET /api/users/init-admin
// @desc    Initialize admin account
// @access  Public
router.get('/init-admin', async(req, res) => {
    try {
        // 生成密码哈希
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('123456', salt);

        // 先删除所有管理员账户
        await pool.query('DELETE FROM users WHERE role = ?', ['admin']);

        // 创建新的管理员账户
        const [result] = await pool.query(
            `INSERT INTO users (username, email, password, role) 
             VALUES (?, ?, ?, ?)`, ['admin', 'admin@admin.com', hashedPassword, 'admin']
        );

        res.json({
            message: '管理员账户已初始化',
            credentials: {
                email: 'admin@admin.com',
                password: '123456'
            }
        });
    } catch (error) {
        console.error('初始化管理员账户失败:', error);
        res.status(500).json({ message: '服务器错误' });
    }
});

module.exports = router;