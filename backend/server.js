const path = require('path');
const fs = require('fs');

const envPath = path.join(__dirname, '.env');
require('dotenv').config({ path: envPath });

if (!fs.existsSync(envPath)) {
    console.warn('[chat-api] 未找到', envPath);
    console.warn('[chat-api] 请复制 backend/.env.example 为 backend/.env，并填写 DEEPSEEK_API_KEY');
} else {
    const hasKey = !!(process.env.DEEPSEEK_API_KEY && String(process.env.DEEPSEEK_API_KEY).trim()) ||
        !!(process.env.OPENAI_API_KEY && String(process.env.OPENAI_API_KEY).trim());
    console.log('[chat-api] 已加载', envPath);
    console.log('[chat-api] API Key 已配置:', hasKey ? '是' : '否（将返回 503）');
}

const express = require('express');
const cors = require('cors');
const chatRoutes = require('./routes/chat');

const app = express();
const PORT = process.env.PORT || 3003;

app.use(cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

app.get('/health', (req, res) => {
    res.json({ ok: true, service: 'chat-api' });
});

app.use('/api/chat', chatRoutes);

app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: '服务器错误', message: err.message });
});

app.listen(PORT, () => {
    console.log(`AI 聊天接口: http://localhost:${PORT}/api/chat`);
});
