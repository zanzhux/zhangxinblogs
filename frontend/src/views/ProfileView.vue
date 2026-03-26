<template>
  <div class="profile-view">
    <section class="hero-section">
      <div class="container">
        <div class="hero-content">
          <h1 class="page-title">个人资料</h1>
          <p class="page-subtitle">在此管理您的个人信息与设置</p>
          <div class="decorative-line"></div>
        </div>
      </div>
    </section>

    <div class="main-content">
      <div class="container">
        <div class="profile-container card vintage-texture">
          <div v-if="error" class="alert alert-danger">
            {{ error }}
          </div>
          
          <div v-if="success" class="alert alert-success">
            {{ success }}
          </div>
          
          <div class="profile-content">
            <div class="profile-sidebar">
              <div class="avatar-section">
                <div class="avatar-wrapper">
                  <img :src="avatarPreview || avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(username) + '&background=random'" 
                    alt="用户头像" class="avatar-img">
                  <div class="avatar-upload-overlay" @click="triggerFileUpload">
                    <span class="upload-icon">+</span>
                    <span class="upload-text">更换头像</span>
                  </div>
                </div>
                <input
                  type="file"
                  ref="fileInput"
                  @change="handleFileUpload"
                  accept="image/*"
                  class="file-input"
                >
                <div class="user-status">
                  <div class="status-item">
                    <span class="status-label">注册于</span>
                    <span class="status-value">{{ formattedJoinDate }}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="profile-main">
              <form @submit.prevent="updateProfile" class="profile-form">
                <div class="form-section">
                  <h3 class="section-title">基本信息</h3>
                  
                  <div class="form-group">
                    <label for="username">用户名</label>
                    <input
                      type="text"
                      id="username"
                      v-model="username"
                      class="form-input"
                      required
                    >
                  </div>
                  
                  <div class="form-group">
                    <label for="email">邮箱地址</label>
                    <input
                      type="email"
                      id="email"
                      v-model="email"
                      class="form-input disabled"
                      disabled
                    >
                    <small class="form-text">邮箱地址不可更改</small>
                  </div>
                </div>
                
                <div class="form-section">
                  <h3 class="section-title">个性化设置</h3>
                  
                  <div class="form-group">
                    <label for="nickname">昵称</label>
                    <input
                      type="text"
                      id="nickname"
                      v-model="nickname"
                      class="form-input"
                      placeholder="设置您的显示昵称"
                    >
                    <small class="form-text">昵称将显示在您的文章和评论中</small>
                  </div>
                </div>
                
                <div class="form-actions">
                  <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
                    <span v-if="isSubmitting" class="btn-loader"></span>
                    {{ isSubmitting ? '更新中...' : '保存更改' }}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ProfileView',
  data() {
    return {
      username: '',
      email: '',
      avatar: '',
      avatarPreview: null,
      avatarFile: null,
      nickname: '',
      joinedDate: '',
      isSubmitting: false,
      error: null,
      success: null
    }
  },
  computed: {
    currentUser() {
      return this.$store.getters.currentUser;
    },
    formattedJoinDate() {
      if (!this.joinedDate) return '未知';
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(this.joinedDate).toLocaleDateString('zh-CN', options);
    }
  },
  methods: {
    triggerFileUpload() {
      this.$refs.fileInput.click();
    },
    handleFileUpload(event) {
      const file = event.target.files[0];
      if (file) {
        this.avatarFile = file;
        // 创建预览URL
        this.avatarPreview = URL.createObjectURL(file);
      }
    },
    async fetchUserProfile() {
      try {
        // 使用store中的当前用户数据预填表单
        if (this.currentUser) {
          this.username = this.currentUser.username;
          this.email = this.currentUser.email;
          this.avatar = this.currentUser.avatar || '';
          this.nickname = this.currentUser.nickname || '';
          this.joinedDate = this.currentUser.created_at || new Date().toISOString();
        }
      } catch (error) {
        console.error('获取用户资料失败:', error);
        this.error = '加载用户资料失败';
      }
    },
    async updateProfile() {
      this.isSubmitting = true;
      this.error = null;
      this.success = null;
      
      try {
        let avatarUrl = this.avatar;
        
        // 处理头像文件上传
        if (this.avatarFile) {
          avatarUrl = await this.uploadAvatar();
        }
        
        // 调用updateProfile action但不保存结果
        await this.$store.dispatch('updateProfile', {
          username: this.username,
          avatar: avatarUrl,
          nickname: this.nickname
        });
        
        // 确保Vuex store和localStorage中的用户信息已更新
        const currentStoreUser = this.$store.getters.currentUser;
        const updatedUser = {
          ...currentStoreUser,
          username: this.username,
          avatar: avatarUrl,
          nickname: this.nickname
        };
        
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        // 在某些情况下，store可能没有正确更新，手动提交一次
        this.$store.commit('SET_USER', updatedUser);
        
        // 更新成功消息和状态
        this.success = '个人资料已成功更新';
        
        // 重新获取用户信息，确保数据一致性
        await this.fetchUserProfile();
      } catch (error) {
        console.error('更新资料时出错:', error);
        this.error = error.response?.data?.message || error.message || '更新资料失败';
      } finally {
        this.isSubmitting = false;
      }
    },
    async uploadAvatar() {
      // 在实际环境中，这里应该调用API上传图片
      // 这里我们使用FileReader将图片转为base64作为替代方案
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          resolve(e.target.result); // 返回base64格式的图片数据
        };
        reader.onerror = () => {
          this.processImg.error = true;
          this.processImg.loading = false;
          reject('图片上传失败');
        };
        reader.readAsDataURL(this.avatarFile);
      });
    }
  },
  created() {
    this.fetchUserProfile();
  }
}
</script>

<style scoped>
.profile-view {
  width: 100%;
}

/* 英雄区域 */
.hero-section {
  padding: var(--spacing-lg) 0;
  margin-bottom: var(--spacing-lg);
  text-align: center;
}

.hero-content {
  max-width: 800px;
  margin: 0 auto;
}

.page-title {
  font-size: 3rem;
  margin-bottom: var(--spacing-sm);
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
  font-family: var(--font-family-heading);
  color: var(--dark-green);
}

.page-subtitle {
  font-size: 1.2rem;
  opacity: 0.8;
  margin-bottom: var(--spacing-md);
  font-family: var(--font-family-main);
}

.decorative-line {
  height: 1px;
  width: 120px;
  margin: 0 auto;
  background: linear-gradient(to right, transparent, var(--moss-green), transparent);
  opacity: 0.6;
}

/* 主内容区域 */
.main-content {
  padding-bottom: var(--spacing-xl);
}

.profile-container {
  background-color: var(--gray-white);
  border: 1px solid var(--border-color);
  box-shadow: 0 4px 12px var(--shadow-color);
  padding: 0;
  overflow: hidden;
  margin-bottom: var(--spacing-lg);
}

.profile-content {
  display: flex;
  gap: 0;
}

/* 侧边栏 */
.profile-sidebar {
  flex: 0 0 280px;
  background-color: rgba(44, 55, 41, 0.03);
  padding: var(--spacing-lg);
  border-right: 1px solid var(--border-color);
}

.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.avatar-wrapper {
  width: 180px;
  height: 180px;
  border-radius: 50%;
  overflow: hidden;
  margin-bottom: var(--spacing-md);
  border: 3px solid var(--cream-white);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  position: relative;
  cursor: pointer;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.avatar-upload-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  color: white;
}

.avatar-wrapper:hover .avatar-upload-overlay {
  opacity: 1;
}

.upload-icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.upload-text {
  font-size: 0.9rem;
}

.file-input {
  display: none;
}

.avatar-wrapper:hover .avatar-img {
  transform: scale(1.05);
}

.user-status {
  width: 100%;
  margin-top: var(--spacing-lg);
  padding-top: var(--spacing-md);
  border-top: 1px dashed var(--border-color);
}

.status-item {
  margin-bottom: var(--spacing-sm);
  display: flex;
  flex-direction: column;
  text-align: center;
}

.status-label {
  font-size: 0.9rem;
  color: var(--text-muted);
  margin-bottom: 0.25rem;
}

.status-value {
  font-family: var(--font-family-main);
  color: var(--dark-green);
}

/* 主要内容区域 */
.profile-main {
  flex: 1;
  padding: var(--spacing-lg);
}

.profile-form {
  max-width: 100%;
}

.form-section {
  margin-bottom: var(--spacing-lg);
  padding-bottom: var(--spacing-md);
  border-bottom: 1px solid var(--border-color);
}

.section-title {
  font-family: var(--font-family-heading);
  font-size: 1.6rem;
  color: var(--moss-green);
  margin-bottom: var(--spacing-md);
  font-weight: normal;
  position: relative;
  padding-left: var(--spacing-sm);
}

.section-title::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 70%;
  background-color: var(--moss-green);
  border-radius: 2px;
}

.form-group {
  margin-bottom: var(--spacing-md);
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--text-dark);
}

.form-input {
  width: 100%;
  padding: 0.8rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background-color: var(--cream-white);
  font-family: var(--font-family-main);
  color: var(--text-dark);
  transition: all 0.3s ease;
}

.form-input:focus {
  outline: none;
  border-color: var(--moss-green);
  box-shadow: 0 0 0 2px rgba(74, 93, 76, 0.15);
}

.form-input.disabled {
  background-color: rgba(0, 0, 0, 0.05);
  color: var(--text-muted);
  cursor: not-allowed;
}

.form-text {
  display: block;
  margin-top: 0.5rem;
  font-size: 0.85rem;
  color: var(--text-muted);
}

/* 按钮和操作区域 */
.form-actions {
  margin-top: var(--spacing-lg);
  display: flex;
  justify-content: flex-end;
}

.btn {
  min-width: 120px;
  padding: 0.8rem 1.5rem;
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: none;
  border-radius: 4px;
  font-family: var(--font-family-main);
  transition: all 0.3s ease;
}

.btn-primary {
  background-color: var(--moss-green);
  color: white;
}

.btn-primary:hover {
  background-color: var(--dark-green);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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

/* 提示样式 */
.alert {
  padding: var(--spacing-md);
  margin-bottom: var(--spacing-md);
  border-radius: 4px;
}

.alert-danger {
  background-color: rgba(220, 53, 69, 0.1);
  border: 1px solid rgba(220, 53, 69, 0.2);
  color: #721c24;
}

.alert-success {
  background-color: rgba(40, 167, 69, 0.1);
  border: 1px solid rgba(40, 167, 69, 0.2);
  color: #155724;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 响应式样式 */
@media (max-width: 992px) {
  .profile-content {
    flex-direction: column;
  }
  
  .profile-sidebar {
    flex: none;
    width: 100%;
    border-right: none;
    border-bottom: 1px solid var(--border-color);
    padding-bottom: var(--spacing-md);
  }
  
  .avatar-section {
    margin-bottom: var(--spacing-sm);
  }
}

@media (max-width: 768px) {
  .page-title {
    font-size: 2.2rem;
  }
  
  .section-title {
    font-size: 1.4rem;
  }
  
  .profile-main {
    padding: var(--spacing-md);
  }
  
  .profile-sidebar {
    padding: var(--spacing-md);
  }
  
  .avatar-wrapper {
    width: 150px;
    height: 150px;
  }
}
</style> 