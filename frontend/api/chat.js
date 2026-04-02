const OpenAI = require('openai');

function getOpenAI() {
  const apiKey = (process.env.DEEPSEEK_API_KEY || '').trim();
  if (!apiKey) return null;
  return new OpenAI({
    baseURL: 'https://api.deepseek.com',
    apiKey
  });
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const openai = getOpenAI();
  if (!openai) {
    return res.status(503).json({
      error: '未配置 AI 密钥',
      details: '请在 Vercel 控制台的 Environment Variables 中添加 DEEPSEEK_API_KEY'
    });
  }

  const { message, deepThinking } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: '消息内容不能为空' });
  }

  try {
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
    return res.status(200).json({ reply });
  } catch (error) {
    console.error('Chat API error:', error);
    return res.status(500).json({
      error: '与 AI 助手通信时出现错误',
      details: error.message
    });
  }
};
