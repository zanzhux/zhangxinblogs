const express = require('express');
const router = express.Router();
const chatController = require('../../controllers/chatController');
const { auth } = require('../../middleware/auth');

// 需要登录才能访问AI聊天
router.post('/', auth, (req, res) => {
    chatController.chatWithAI(req, res);
});

module.exports = router;