const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');

// 初始化管理员账户
router.post('/init-admin', userController.initializeAdmin);

// Register a new user
router.post('/register', userController.register);

// Login user
router.post('/login', userController.loginUser);

// Get user profile (protected route)
router.get('/profile', auth, userController.getProfile);

// Update user profile (protected route)
router.put('/profile', auth, userController.updateProfile);

// Get all users (admin functionality)
router.get('/', auth, userController.getAllUsers);

// Update user role (admin functionality)
router.put('/:userId/role', auth, userController.updateUserRole);

module.exports = router;