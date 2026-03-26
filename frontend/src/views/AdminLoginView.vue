<template>
  <div class="admin-login-view">
    <div class="container">
      <div class="section-header">
        <h1 class="page-title">管理员登录</h1>
        <div class="decorative-line"></div>
      </div>

      <div class="login-content">
        <form @submit.prevent="handleLogin" class="login-form">
          <div class="form-group">
            <label for="email">邮箱</label>
            <input type="email" id="email" v-model="email" placeholder="请输入管理员邮箱" required autocomplete="email">
          </div>

          <div class="form-group">
            <label for="password">密码</label>
            <input type="password" id="password" v-model="password" placeholder="请输入密码" required
              autocomplete="current-password">
          </div>

          <div v-if="error" class="error-message">
            {{ error }}
          </div>

          <button type="submit" class="submit-btn" :disabled="loading">
            <span v-if="loading">登录中...</span>
            <span v-else>登录</span>
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'AdminLoginView',
  data() {
    return {
      email: '',
      password: '',
      loading: false,
      error: null
    }
  },
  computed: {
    ...mapGetters(['isAuthenticated', 'currentUser'])
  },
  mounted() {
    // 如果已经登录且是管理员，直接跳转到后台
    if (this.isAuthenticated && this.currentUser && this.currentUser.role === 'admin') {
      this.$router.push('/admin');
    }
  },
  methods: {
    async handleLogin() {
      this.loading = true;
      this.error = null;

      try {
        const loginData = {
          email: this.email.trim(),
          password: this.password
        };

        // 详细的请求信息日志
        console.log('发送登录请求:', {
          url: '/users/login',
          data: loginData,
          headers: this.$axios.defaults.headers
        });

        const response = await this.$axios.post('/users/login', loginData);
        console.log('登录响应:', response.data);

        const { token, user } = response.data;

        if (!user || !user.role) {
          console.error('响应中缺少用户信息或角色:', response.data);
          throw new Error('无效的响应数据');
        }

        // 验证是否是管理员
        if (user.role !== 'admin') {
          console.log('用户不是管理员:', user.role);
          this.error = '您不是管理员，无法访问管理系统';
          return;
        }

        console.log('管理员验证通过，保存认证信息');

        // 存储认证信息
        localStorage.setItem('token', token);
        this.$store.commit('SET_TOKEN', token);
        this.$store.commit('SET_USER', user);

        // 设置 axios 默认 header
        this.$axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        console.log('认证信息已保存，准备跳转');
        this.$router.push('/admin');
      } catch (error) {
        console.error('登录失败:', error);

        if (error.response) {
          const errorData = error.response.data;
          console.error('服务器错误响应:', {
            status: error.response.status,
            message: errorData.message,
            data: errorData
          });
          this.error = errorData.message || '登录失败，请检查邮箱和密码';
        } else if (error.request) {
          console.error('请求未收到响应:', error.request);
          this.error = '无法连接到服务器，请稍后重试';
        } else {
          console.error('请求配置错误:', error.message);
          this.error = '登录过程出现错误，请稍后重试';
        }
      } finally {
        this.loading = false;
      }
    }
  }
}
</script>

<style scoped>
.admin-login-view {
  padding-bottom: var(--spacing-xl);
}

.section-header {
  text-align: center;
  margin-bottom: var(--spacing-xl);
}

.page-title {
  margin-bottom: var(--spacing-sm);
}

.decorative-line {
  height: 1px;
  width: 120px;
  margin: 0 auto;
  background: linear-gradient(to right, transparent, rgba(255, 255, 255, 0.5), transparent);
}

.login-content {
  max-width: 400px;
  margin: 0 auto;
}

.login-form {
  background-color: rgba(0, 0, 0, 0.2);
  padding: var(--spacing-lg);
  border-radius: 5px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.form-group {
  margin-bottom: var(--spacing-md);
}

.form-group label {
  display: block;
  margin-bottom: var(--spacing-xs);
  font-weight: 500;
}

.form-group input {
  width: 100%;
  padding: 10px;
  background-color: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  color: var(--color-light);
  font-size: 1rem;
}

.form-group input:focus {
  outline: none;
  border-color: rgba(255, 255, 255, 0.3);
}

.error-message {
  background-color: rgba(203, 53, 53, 0.2);
  color: #f5a8a8;
  padding: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
  border-radius: 4px;
  text-align: center;
}

.submit-btn {
  width: 100%;
  padding: 12px;
  background-color: var(--color-black);
  color: var(--color-light);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.submit-btn:hover:not(:disabled) {
  background-color: rgba(0, 0, 0, 0.5);
  border-color: rgba(255, 255, 255, 0.4);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>