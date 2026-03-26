<template>
  <div class="admin-layout">
    <!-- 左侧边栏 -->
    <div class="sidebar">
      <div class="logo-container">
        <div class="logo-text">博客管理</div>
      </div>

      <nav class="nav-menu">
        <router-link to="/admin" class="nav-item" active-class="active">
          <span>首页</span>
        </router-link>

        <router-link to="/admin/articles" class="nav-item" active-class="active">
          <span>文章管理</span>
        </router-link>

        <a href="/" class="nav-item" target="_blank">
          <span>前往网站</span>
        </a>
      </nav>

      <div class="sidebar-footer">
        <button @click="logout" class="logout-btn">
          退出登录
        </button>
      </div>
    </div>

    <!-- 主内容区 -->
    <div class="main-content">
      <div class="dashboard-content">
        <div class="welcome-section">
          <h1>欢迎使用博客管理系统</h1>

          <div class="quick-actions">
            <router-link to="/admin/new-article" class="quick-action-button">
              <i class="fas fa-plus"></i>
              发布文章
            </router-link>

            <router-link to="/admin/articles" class="action-btn">
              管理文章
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AdminDashboardView',
  methods: {
    logout() {
      this.$store.dispatch('logout');
      this.$router.push('/admin/login');
    }
  }
};
</script>

<style scoped>
.admin-layout {
  display: flex;
  min-height: 100vh;
  background-color: transparent;
}

.sidebar {
  width: 240px;
  background-color: rgba(0, 0, 0, 0.2);
  border-right: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  flex-direction: column;
}

.logo-container {
  padding: 2rem 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.logo-text {
  font-family: 'Ma Shan Zheng', cursive;
  font-size: 1.8rem;
  font-weight: normal;
  color: rgba(255, 255, 255, 0.9);
  text-align: center;
  letter-spacing: 0.05em;
}

.nav-menu {
  padding: 2rem 0;
  flex: 1;
}

.nav-item {
  display: block;
  padding: 1rem 1.5rem;
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  transition: all 0.3s;
  font-family: 'Noto Serif SC', serif;
  letter-spacing: 0.05em;
}

.nav-item:hover {
  background-color: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 1);
}

.nav-item.active {
  background-color: rgba(0, 0, 0, 0.3);
  color: #fff;
  border-right: 3px solid rgba(255, 255, 255, 0.2);
}

.sidebar-footer {
  padding: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.logout-btn {
  width: 100%;
  padding: 0.8rem;
  background-color: rgba(255, 59, 48, 0.2);
  color: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0;
  cursor: pointer;
  font-family: 'Noto Serif SC', serif;
  letter-spacing: 0.05em;
  transition: all 0.3s;
}

.logout-btn:hover {
  background-color: rgba(255, 59, 48, 0.3);
  border-color: rgba(255, 255, 255, 0.2);
}

.main-content {
  flex: 1;
  padding: 2rem;
}

.welcome-section {
  background-color: rgba(0, 0, 0, 0.15);
  padding: 2.5rem;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.welcome-section h1 {
  font-family: 'Ma Shan Zheng', cursive;
  font-size: 2.5rem;
  margin-bottom: 2rem;
  font-weight: normal;
  letter-spacing: 0.05em;
  text-align: center;
  position: relative;
  color: rgba(255, 255, 255, 0.9);
}

.welcome-section h1::after {
  content: "";
  display: block;
  width: 60px;
  height: 1px;
  background: rgba(255, 255, 255, 0.2);
  margin: 0.5rem auto 0;
}

.quick-actions {
  display: flex;
  gap: 1.5rem;
  justify-content: center;
  margin-top: 3rem;
}

.action-btn,
.quick-action-button {
  padding: 0.8rem 2rem;
  background-color: rgba(0, 0, 0, 0.3);
  color: rgba(255, 255, 255, 0.9);
  text-decoration: none;
  border: 1px solid rgba(255, 255, 255, 0.1);
  font-family: 'Noto Serif SC', serif;
  letter-spacing: 0.05em;
  transition: all 0.3s;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.action-btn:hover,
.quick-action-button:hover {
  background-color: rgba(0, 0, 0, 0.5);
  border-color: rgba(255, 255, 255, 0.2);
  color: #fff;
}

.quick-action-button i {
  font-size: 1.1rem;
}

@media (max-width: 768px) {
  .admin-layout {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  }

  .nav-menu {
    padding: 1rem 0;
  }

  .nav-item {
    padding: 0.8rem 1rem;
    text-align: center;
  }

  .main-content {
    padding: 1rem;
  }

  .welcome-section {
    padding: 1.5rem;
  }

  .welcome-section h1 {
    font-size: 2rem;
  }

  .quick-actions {
    flex-direction: column;
    gap: 1rem;
  }

  .action-btn,
  .quick-action-button {
    text-align: center;
    justify-content: center;
  }
}
</style>