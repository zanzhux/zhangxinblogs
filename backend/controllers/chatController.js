const OpenAI = require('openai');

const openai = new OpenAI({
    baseURL: 'https://api.deepseek.com',
    apiKey: process.env.DEEPSEEK_API_KEY
});

const chatWithAI = async(req, res) => {
    try {
        const { message } = req.body;
        if (!message) {
            return res.status(400).json({ error: '消息不能为空' });
        }

        const completion = await openai.chat.completions.create({
            messages: [
                { role: "system", content: "You are a helpful assistant." },
                { role: "user", content: message }
            ],
            model: "deepseek-chat",
            temperature: 0.7,
            max_tokens: 2000
        });

        const reply = completion.choices[0].message.content;
        res.json({ reply });
    } catch (error) {
        console.error('AI聊天错误:', error);
        const errorMessage = error.response && error.response.data ? error.response.data : error.message;
        res.status(500).json({
            error: '与AI助手通信时出现错误',
            details: errorMessage
        });
    }
};

module.exports = { chatWithAI };