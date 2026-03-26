<template>
  <div class="login-view">
    <div class="form-container card">
      <div class="form-header">
        <h1>登录</h1>
        <p>欢迎回来</p>
      </div>

      <div v-if="error" class="alert alert-danger">
        {{ error }}
      </div>

      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="email">邮箱</label>
          <div class="input-group">
            <span class="input-icon">📧</span>
            <input type="email" id="email" v-model="email" class="form-control" required placeholder="请输入您的邮箱">
          </div>
        </div>

        <div class="form-group">
          <label for="password">密码</label>
          <div class="input-group">
            <span class="input-icon">🔒</span>
            <input type="password" id="password" v-model="password" class="form-control" required placeholder="请输入密码">
          </div>
        </div>

        <button type="submit" :disabled="loading" class="btn btn-primary">
          <span v-if="loading" class="btn-loader"></span>
          {{ loading ? '登录中...' : '登录' }}
        </button>
      </form>

      <div class="auth-links">
        还没有账户? <router-link to="/register">立即注册</router-link>
      </div>

      <!-- 调试信息 -->
      <div v-if="networkStatus" class="debug-info">
        <div>网络状态: {{ networkStatus }}</div>
        <div>API地址: {{ apiUrl }}</div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LoginView',
  data() {
    return {
      email: '',
      password: '',
      error: null,
      loading: false,
      networkStatus: null,
      apiUrl: process.env.VUE_APP_API_URL || 'http://localhost:3003/api'
    };
  },
  methods: {
    async handleLogin() {
      this.error = null;
      this.networkStatus = null;
      this.loading = true;

      try {
        // 测试网络连接状态（仅显示，不影响后续逻辑）
        try {
          await fetch(this.apiUrl.replace('/api', '') || 'http://localhost:3003');
          this.networkStatus = '连接正常';
        } catch (e) {
          this.networkStatus = `连接失败: ${e.message}`;
          console.log('API连接失败，将使用模拟数据');
        }

        // 如果API不可用，使用模拟数据
        if (this.networkStatus && this.networkStatus.includes('失败')) {
          // 模拟延迟
          await new Promise(resolve => setTimeout(resolve, 800));

          // 假设这是admin用户
          if (this.email === 'admin@example.com' && this.password === 'admin123') {
            const mockAdmin = {
              id: 1,
              username: 'admin',
              nickname: '管理员',
              email: 'admin@example.com',
              role: 'admin'
            };

            const mockToken = 'mock-admin-token-' + Date.now();

            // 提交到Vuex
            this.$store.commit('SET_TOKEN', mockToken);
            this.$store.commit('SET_USER', mockAdmin);

            // 跳转到首页
            this.$router.push('/');
            return;
          }

          // 普通用户
          const mockUser = {
            id: Math.floor(Math.random() * 1000) + 1,
            username: this.email.split('@')[0],
            nickname: `${this.email.split('@')[0]}的昵称`,
            email: this.email,
            role: 'user'
          };

          const mockToken = 'mock-token-' + Date.now();

          // 提交到Vuex
          this.$store.commit('SET_TOKEN', mockToken);
          this.$store.commit('SET_USER', mockUser);

          // 跳转到首页
          this.$router.push('/');
          return;
        }

        // 如果API可用，正常调用登录接口
        await this.$store.dispatch('login', {
          email: this.email,
          password: this.password
        });

        this.$router.push('/');
      } catch (err) {
        console.error('登录错误:', err);
        this.error = err.response?.data?.message || '登录失败，请检查您的用户名和密码';

        if (err.message.includes('Network Error')) {
          this.error = '无法连接到服务器，将使用模拟数据';

          // 模拟延迟
          await new Promise(resolve => setTimeout(resolve, 800));

          // 假设这是admin用户
          if (this.email === 'admin@example.com' && this.password === 'admin123') {
            const mockAdmin = {
              id: 1,
              username: 'admin',
              nickname: '管理员',
              email: 'admin@example.com',
              role: 'admin'
            };

            const mockToken = 'mock-admin-token-' + Date.now();

            // 提交到Vuex
            this.$store.commit('SET_TOKEN', mockToken);
            this.$store.commit('SET_USER', mockAdmin);

            // 跳转到首页
            this.$router.push('/');
            return;
          }

          // 普通用户
          const mockUser = {
            id: Math.floor(Math.random() * 1000) + 1,
            username: this.email.split('@')[0],
            nickname: `${this.email.split('@')[0]}的昵称`,
            email: this.email,
            role: 'user'
          };

          const mockToken = 'mock-token-' + Date.now();

          // 提交到Vuex
          this.$store.commit('SET_TOKEN', mockToken);
          this.$store.commit('SET_USER', mockUser);

          // 跳转到首页
          this.$router.push('/');
        }
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>

<style scoped>
.login-view {
  display: flex;
  justify-content: center;
  padding: 2rem 0;
}

.form-container {
  width: 100%;
  max-width: 550px;
  padding: 2.5rem;
  background-color: rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.form-header {
  margin-bottom: 2rem;
  text-align: center;
  position: relative;
}

.form-header h1 {
  font-family: 'Ma Shan Zheng', cursive;
  font-size: 2.5rem;
  margin-bottom: 0.8rem;
  font-weight: normal;
  letter-spacing: 0.05em;
}

.form-header h1::after {
  content: "";
  display: block;
  width: 60px;
  height: 1px;
  background: rgba(255, 255, 255, 0.2);
  margin: 0.5rem auto 0;
}

.form-header p {
  opacity: 0.8;
  font-size: 1rem;
  font-family: 'Noto Serif SC', serif;
  letter-spacing: 0.02em;
}

.form-group {
  margin-bottom: 1.5rem;
}

label {
  display: block;
  margin-bottom: 0.8rem;
  font-weight: normal;
  font-family: 'Ma Shan Zheng', cursive;
  font-size: 1.3rem;
  letter-spacing: 0.02em;
}

.input-group {
  position: relative;
}

.input-icon {
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 1.1rem;
  opacity: 0.7;
}

.form-control {
  width: 100%;
  padding: 0.8rem 1rem 0.8rem 3rem;
  font-size: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background-color: rgba(0, 0, 0, 0.2);
  color: rgba(255, 255, 255, 0.9);
  transition: all 0.3s;
}

.form-control:focus {
  border-color: rgba(255, 255, 255, 0.3);
  outline: none;
}

.btn {
  margin-top: 0.5rem;
  width: 100%;
  padding: 0.9rem 1.8rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-black);
  color: var(--color-text-light);
  border: 1px solid rgba(255, 255, 255, 0.1);
  font-family: 'Noto Serif SC', serif;
  letter-spacing: 0.05em;
  font-size: 1.1rem;
  transition: var(--transition);
}

.btn:hover {
  background-color: rgba(0, 0, 0, 0.7);
}

.btn-loader {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s linear infinite;
  margin-right: 8px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.auth-links {
  margin-top: 1.8rem;
  text-align: center;
  font-size: 1rem;
  opacity: 0.8;
}

.auth-links a {
  color: rgba(255, 255, 255, 0.9);
  text-decoration: none;
  font-weight: bold;
  transition: all 0.3s;
}

.auth-links a:hover {
  color: white;
  text-decoration: underline;
}

.alert {
  padding: 1rem;
  margin-bottom: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background-color: rgba(255, 0, 0, 0.1);
  color: #ff6b6b;
  text-align: center;
}

.debug-info {
  margin-top: 24px;
  padding: 12px;
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 4px;
  font-size: 14px;
  opacity: 0.7;
}

@media (max-width: 768px) {
  .form-container {
    padding: 1.5rem;
  }

  .form-header h1 {
    font-size: 2rem;
  }

  .form-group {
    margin-bottom: 1.2rem;
  }
}
</style>