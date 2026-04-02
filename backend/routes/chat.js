const express = require('express');
const OpenAI = require('openai');

const router = express.Router();

/** DeepSeek 兼容 OpenAI SDK：必须传入非空 apiKey；未配置时不在启动阶段 new OpenAI，避免 OPENAI_API_KEY 报错 */
function getApiKey() {
    const key = process.env.DEEPSEEK_API_KEY || process.env.OPENAI_API_KEY;
    return typeof key === 'string' ? key.trim() : '';
}

function getOpenAI() {
    const apiKey = getApiKey();
    if (!apiKey) return null;
    return new OpenAI({
        baseURL: 'https://api.deepseek.com',
        apiKey
    });
}

router.post('/', async (req, res) => {
    try {
        const openai = getOpenAI();
        if (!openai) {
            return res.status(503).json({
                error: '未配置 AI 密钥',
                details: '请在 backend/.env 中设置 DEEPSEEK_API_KEY（或 OPENAI_API_KEY），然后重启 npm start'
            });
        }

        const { message, deepThinking } = req.body;

        if (!message || typeof message !== 'string') {
            return res.status(400).json({ error: '消息内容不能为空' });
        }

        let userContent = message;
        if (deepThinking) {
            userContent = `请深入思考以下问题，从多个角度进行分析，并给出详细的论述：\n\n${message}`;
        }

        const systemContent = deepThinking
            ? '你是一个深度思考者，会从多个角度分析问题，给出深入的见解和建议。回答时要条理清晰，论述充分。'
            : '你是一个友好的助手，会简洁明了地回答问题。';

        const completion = await openai.chat.completions.create({
            model: 'deepseek-chat',
            messages: [
                { role: 'system', content: systemContent },
                { role: 'user', content: userContent }
            ],
            temperature: deepThinking ? 0.8 : 0.7,
            max_tokens: deepThinking ? 2000 : 1000
        });

        const reply = completion.choices[0].message.content;
        res.json({ reply });
    } catch (error) {
        console.error('Chat API error:', error);
        res.status(500).json({
            error: '与 AI 助手通信时出现错误',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

module.exports = router;
