const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const db = require('./config/db');
const path = require('path');

// 加载环境变量
dotenv.config();

// 路由
const usersRoutes = require('./routes/api/users');
const articlesRoutes = require('./routes/api/articles');
const chatRoutes = require('./routes/api/chat');

// 创建Express应用
const app = express();

// 中间件
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 配置 CORS
app.use(cors({
    origin: ['http://localhost:8080', 'http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

// 静态文件服务 - 用于头像和封面图片等上传文件
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 路由
app.use('/api/users', usersRoutes);
app.use('/api/articles', articlesRoutes);
app.use('/api/chat', chatRoutes);

// 首页路由
app.get('/', (req, res) => {
    res.send('博客系统API服务正在运行');
});

// 错误处理中间件
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        message: '服务器错误',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// 启动服务器
const PORT = process.env.PORT || 3003;

// 初始化数据库并启动服务器
(async() => {
    try {
        // 测试数据库连接
        const connected = await db.testConnection();

        if (connected) {
            // 检查并初始化数据库
            await db.initDatabase();

            // 启动服务器
            app.listen(PORT, () => {
                console.log(`服务器运行在 http://localhost:${PORT}`);
            });
        } else {
            console.error('无法连接到数据库，服务器未启动');
            process.exit(1);
        }
    } catch (error) {
        console.error('启动服务器失败:', error);
        process.exit(1);
    }
})();