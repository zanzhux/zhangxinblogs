<template>
    <div class="chat-container">
        <div class="chat-header">
            <h1>AI 助手</h1>
            <div class="settings">
                <label class="deep-thinking">
                    <input type="checkbox" v-model="deepThinking">
                    深度思考模式
                    <span class="tooltip">开启后，AI 将进行更深入的思考，回答更加全面</span>
                </label>
            </div>
        </div>
        <div class="chat-box">
            <div class="messages" ref="messagesContainer">
                <div v-if="messages.length === 0" class="welcome-message">
                    <div class="welcome-content">
                        <h2>欢迎使用 AI 助手</h2>
                        <p>您可以问我任何问题，我会尽力为您解答。</p>
                        <div class="suggested-questions">
                            <h3>建议的问题：</h3>
                            <button v-for="(question, index) in suggestedQuestions" :key="index"
                                @click="askSuggestedQuestion(question)" class="suggested-question-btn">
                                {{ question }}
                            </button>
                        </div>
                    </div>
                </div>
                <div v-for="(message, index) in messages" :key="index"
                    :class="['message', message.role === 'user' ? 'user-message' : 'ai-message']">
                    <div class="message-content">
                        <div class="message-text" v-html="formatMessage(message.content)"></div>
                        <div class="message-time">{{ message.time }}</div>
                    </div>
                </div>
                <div v-if="isLoading" class="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
            <div class="input-area">
                <textarea v-model="userInput" @keyup.enter.exact="handleSend" @keydown.enter.exact.prevent
                    placeholder="输入您的问题..." :disabled="isLoading" rows="3"></textarea>
                <button @click="handleSend" :disabled="isLoading || !userInput.trim()">
                    {{ isLoading ? '思考中...' : '发送' }}
                </button>
            </div>
        </div>
    </div>
</template>

<script>
import axios from 'axios';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

export default {
    name: 'AIChatView',
    data() {
        return {
            messages: [],
            userInput: '',
            isLoading: false,
            deepThinking: false,
            suggestedQuestions: [
                "你能帮我分析一下这篇文章的主要观点吗？",
                "如何提高写作水平？",
                "请推荐一些经典的文学作品",
                "如何培养良好的阅读习惯？"
            ]
        };
    },
    methods: {
        formatMessage(content) {
            // 使用 marked 将 Markdown 转换为 HTML，并使用 DOMPurify 清理
            return DOMPurify.sanitize(marked(content));
        },
        getCurrentTime() {
            const now = new Date();
            return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        },
        async handleSend() {
            if (!this.userInput.trim() || this.isLoading) return;

            const userMessage = this.userInput.trim();
            this.messages.push({
                role: 'user',
                content: userMessage,
                time: this.getCurrentTime()
            });
            this.userInput = '';
            this.isLoading = true;
            this.scrollToBottom();

            try {
                const apiBase = (process.env.VUE_APP_API_URL || '').replace(/\/$/, '');
                // 本地开发统一走 devServer 代理 /api -> 3003，避免浏览器直连 3003 未启动时报错
                const chatUrl = process.env.NODE_ENV === 'development'
                    ? '/api/chat'
                    : (apiBase ? `${apiBase}/chat` : '/api/chat');
                const headers = { 'Content-Type': 'application/json' };
                const token = this.$store.state.token;
                if (token) {
                    headers.Authorization = `Bearer ${token}`;
                }
                const response = await axios.post(chatUrl, {
                    message: userMessage,
                    deepThinking: this.deepThinking
                }, { headers });

                this.messages.push({
                    role: 'assistant',
                    content: response.data.reply,
                    time: this.getCurrentTime()
                });
            } catch (error) {
                console.error('聊天请求失败:', error);
                const status = error.response && error.response.status;
                const data = error.response && error.response.data;
                const serverMsg = data && (data.details || data.error || data.message);
                const isNetwork = !error.response && (error.code === 'ERR_NETWORK' || error.message === 'Network Error');
                let hint = '';
                if (status === 503 && serverMsg) {
                    hint = serverMsg;
                } else if (isNetwork) {
                    hint = '（请另开终端：cd backend && npm start，并配置 backend/.env 中的 DEEPSEEK_API_KEY；前端保持 npm run serve）';
                } else if (serverMsg) {
                    hint = String(serverMsg);
                }
                this.messages.push({
                    role: 'assistant',
                    content: hint ? `抱歉：${hint}` : '抱歉，AI 服务暂时不可用。',
                    time: this.getCurrentTime()
                });
            } finally {
                this.isLoading = false;
                this.$nextTick(() => {
                    this.scrollToBottom();
                });
            }
        },
        scrollToBottom() {
            const container = this.$refs.messagesContainer;
            container.scrollTop = container.scrollHeight;
        },
        askSuggestedQuestion(question) {
            this.userInput = question;
            this.handleSend();
        }
    }
};
</script>

<style scoped>
.chat-container {
    max-width: 1000px;
    margin: 20px auto;
    padding: 20px;
}

.chat-header {
    text-align: center;
    margin-bottom: 20px;
}

.chat-header h1 {
    font-family: 'Ma Shan Zheng', cursive;
    font-size: 2.5rem;
    color: var(--color-text-light);
    margin-bottom: 1rem;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.settings {
    margin: 1rem 0;
}

.deep-thinking {
    position: relative;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 20px;
    color: var(--color-text-light);
    transition: var(--transition);
}

.deep-thinking:hover {
    background: rgba(255, 255, 255, 0.15);
}

.deep-thinking input {
    margin-right: 8px;
    width: auto;
}

.tooltip {
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    background: var(--color-black);
    color: var(--color-text-light);
    padding: 8px 12px;
    border-radius: 4px;
    font-size: 0.9rem;
    opacity: 0;
    visibility: hidden;
    transition: var(--transition);
    width: max-content;
    margin-bottom: 8px;
}

.deep-thinking:hover .tooltip {
    opacity: 1;
    visibility: visible;
}

.chat-box {
    background: rgba(0, 0, 0, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    box-shadow: var(--shadow-md);
    display: flex;
    flex-direction: column;
    height: 70vh;
    overflow: hidden;
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
}

.messages {
    flex-grow: 1;
    overflow-y: auto;
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    background: rgba(0, 0, 0, 0.1);
}

.welcome-message {
    text-align: center;
    padding: 40px 20px;
}

.welcome-content {
    max-width: 600px;
    margin: 0 auto;
}

.welcome-content h2 {
    font-family: 'Ma Shan Zheng', cursive;
    font-size: 2rem;
    margin-bottom: 1rem;
    color: var(--color-text-light);
}

.welcome-content p {
    color: var(--color-text-light);
    margin-bottom: 2rem;
}

.suggested-questions {
    margin-top: 2rem;
}

.suggested-questions h3 {
    font-size: 1.1rem;
    margin-bottom: 1rem;
    color: var(--color-text-muted);
}

.suggested-question-btn {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    padding: 8px 16px;
    margin: 4px;
    border-radius: 20px;
    cursor: pointer;
    transition: var(--transition);
    color: var(--color-text-light);
    font-family: 'Noto Serif SC', serif;
}

.suggested-question-btn:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: translateY(-1px);
}

.message {
    max-width: 85%;
    padding: 12px 16px;
    border-radius: 12px;
    position: relative;
    font-family: 'Noto Serif SC', serif;
}

.user-message {
    align-self: flex-end;
    background: var(--color-brown);
    color: var(--color-text-light);
    border: 1px solid rgba(255, 255, 255, 0.1);
}

.ai-message {
    align-self: flex-start;
    background: rgba(255, 255, 255, 0.1);
    color: var(--color-text-light);
    border: 1px solid rgba(255, 255, 255, 0.2);
}

.message-content {
    position: relative;
}

.message-text {
    line-height: 1.6;
    white-space: pre-wrap;
}

.message-text :deep(code) {
    background: rgba(0, 0, 0, 0.2);
    padding: 2px 4px;
    border-radius: 4px;
    font-family: monospace;
}

.message-text :deep(pre) {
    background: rgba(0, 0, 0, 0.2);
    padding: 12px;
    border-radius: 8px;
    overflow-x: auto;
    margin: 8px 0;
}

.message-time {
    font-size: 0.8rem;
    opacity: 0.7;
    margin-top: 4px;
    text-align: right;
}

.typing-indicator {
    display: flex;
    gap: 4px;
    padding: 12px 16px;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 12px;
    width: fit-content;
    align-self: flex-start;
}

.typing-indicator span {
    width: 8px;
    height: 8px;
    background: var(--color-text-light);
    border-radius: 50%;
    animation: typing 1s infinite ease-in-out;
}

.typing-indicator span:nth-child(2) {
    animation-delay: 0.2s;
}

.typing-indicator span:nth-child(3) {
    animation-delay: 0.4s;
}

.input-area {
    padding: 20px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    display: flex;
    gap: 10px;
    background: rgba(0, 0, 0, 0.2);
}

textarea {
    flex-grow: 1;
    padding: 12px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 8px;
    resize: none;
    font-size: 14px;
    line-height: 1.5;
    background: rgba(255, 255, 255, 0.1);
    color: var(--color-text-light);
    font-family: 'Noto Serif SC', serif;
}

textarea:focus {
    outline: none;
    border-color: rgba(255, 255, 255, 0.3);
    background: rgba(255, 255, 255, 0.15);
}

button {
    padding: 0 24px;
    background: var(--color-brown);
    color: var(--color-text-light);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 8px;
    cursor: pointer;
    transition: var(--transition);
    font-size: 14px;
    min-width: 100px;
    font-family: 'Ma Shan Zheng', cursive;
}

button:hover:not(:disabled) {
    background: var(--color-brown-dark);
    transform: translateY(-1px);
}

button:disabled {
    background: rgba(255, 255, 255, 0.1);
    cursor: not-allowed;
    opacity: 0.7;
}

@keyframes typing {

    0%,
    100% {
        transform: translateY(0);
    }

    50% {
        transform: translateY(-5px);
    }
}

/* 响应式设计 */
@media (max-width: 768px) {
    .chat-container {
        margin: 10px;
        padding: 10px;
    }

    .message {
        max-width: 92%;
    }

    .chat-header h1 {
        font-size: 2rem;
    }

    .chat-box {
        height: 75vh;
    }

    .input-area {
        flex-direction: column;
        padding: 12px;
        gap: 8px;
    }

    textarea {
        rows: 2;
        font-size: 16px; /* 防止 iOS 自动缩放 */
    }

    button {
        width: 100%;
        padding: 12px;
        font-size: 1rem;
    }

    .welcome-message {
        padding: 20px 10px;
    }

    .welcome-content h2 {
        font-size: 1.5rem;
    }

    .suggested-question-btn {
        font-size: 0.85rem;
        padding: 6px 12px;
    }
}

@media (max-width: 480px) {
    .chat-container {
        margin: 6px;
        padding: 8px;
    }

    .chat-header {
        flex-direction: column;
        gap: 8px;
        align-items: flex-start;
    }

    .chat-header h1 {
        font-size: 1.6rem;
        margin: 0;
    }

    .chat-box {
        height: 78vh;
    }

    .messages {
        padding: 12px;
        gap: 10px;
    }

    .message {
        max-width: 95%;
        padding: 10px 12px;
        font-size: 0.9rem;
    }

    .deep-thinking {
        font-size: 0.85rem;
    }
}
</style>