const express = require('express');
const router = express.Router();
const axios = require('axios');
const auth = require('../middleware/auth');

router.post('/', auth, async(req, res) => {
    try {
        const { message, deepThinking } = req.body;

        if (!message || typeof message !== 'string') {
            return res.status(400).json({ error: '消息内容不能为空' });
        }

        // 构建 prompt
        let prompt = message;
        if (deepThinking) {
            prompt = `请深入思考以下问题，从多个角度进行分析，并给出详细的论述：\n\n${message}`;
        }

        const response = await axios.post('https://api.deepseek.com/v1/chat/completions', {
            model: "deepseek-chat",
            messages: [{
                    role: "system",
                    content: deepThinking ?
                        "你是一个深度思考者，会从多个角度分析问题，给出深入的见解和建议。回答时要条理清晰，论述充分。" : "你是一个友好的助手，会简洁明了地回答问题。"
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            temperature: deepThinking ? 0.8 : 0.7,
            max_tokens: deepThinking ? 2000 : 1000,
            top_p: 1,
            frequency_penalty: 0,
            presence_penalty: 0
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        const reply = response.data.choices[0].message.content;
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