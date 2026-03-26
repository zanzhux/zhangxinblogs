<template>
  <div class="admin-layout">
    <!-- 左侧边栏 -->
    <div class="sidebar">
      <div class="logo-container">
        <div class="logo-text">后台管理</div>
      </div>
      
      <nav class="nav-menu">
        <router-link to="/admin/dashboard" class="nav-item" active-class="active">
          <i class="fas fa-home"></i>
          <span>首页</span>
        </router-link>
        
        <router-link to="/admin/statistics" class="nav-item" active-class="active">
          <i class="fas fa-chart-bar"></i>
          <span>统计</span>
        </router-link>
        
        <router-link to="/admin/tags" class="nav-item" active-class="active">
          <i class="fas fa-tags"></i>
          <span>标签</span>
        </router-link>
        
        <router-link to="/admin/articles" class="nav-item" active-class="active">
          <i class="fas fa-newspaper"></i>
          <span>博客</span>
        </router-link>
      </nav>
      
      <div class="sidebar-footer">
        <button @click="logout" class="logout-btn">
          <i class="fas fa-sign-out-alt"></i>
          退出登录
        </button>
      </div>
    </div>
    
    <!-- 主内容区 -->
    <div class="main-content">
      <!-- 顶部导航栏 -->
      <header class="header">
        <div class="page-title">
          标签管理
        </div>
        
        <div class="header-actions">
          <button class="theme-toggle" @click="toggleTheme">
            <i :class="isDarkMode ? 'fas fa-sun' : 'fas fa-moon'"></i>
          </button>
          
          <div class="user-profile">
            <img :src="userAvatar" alt="用户头像" class="user-avatar">
          </div>
        </div>
      </header>
      
      <!-- 标签管理内容 -->
      <div class="tags-content">
        <div class="page-header">
          <h1>标签管理</h1>
          <button @click="showCreateTagModal = true" class="action-btn">
            <i class="fas fa-plus"></i> 创建标签
          </button>
        </div>
        
        <div class="filter-bar">
          <div class="search-box">
            <i class="fas fa-search"></i>
            <input 
              type="text" 
              v-model="searchQuery" 
              placeholder="搜索标签..." 
              @input="filterTags"
            >
          </div>
          
          <div class="filter-options">
            <select v-model="sortBy" @change="filterTags">
              <option value="name">按名称</option>
              <option value="date">按创建日期</option>
              <option value="count">按使用次数</option>
            </select>
            
            <button @click="sortOrder = sortOrder === 'asc' ? 'desc' : 'asc'; filterTags()">
              <i :class="sortOrder === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down'"></i>
            </button>
          </div>
        </div>
        
        <div class="tags-list-container">
          <div v-if="loading" class="loading-state">
            <i class="fas fa-circle-notch fa-spin"></i> 正在加载标签...
          </div>
          
          <div v-else-if="filteredTags.length === 0" class="empty-state">
            <i class="fas fa-tags"></i>
            <p>没有找到标签</p>
            <button @click="showCreateTagModal = true" class="action-btn">
              创建第一个标签
            </button>
          </div>
          
          <div v-else class="tags-list">
            <div v-for="tag in filteredTags" :key="tag.id" class="tag-item">
              <div class="tag-color" :style="{ backgroundColor: tag.color || '#3498db' }"></div>
              <div class="tag-info">
                <div class="tag-name">{{ tag.name }}</div>
                <div class="tag-meta">
                  <span class="tag-count">{{ tag.articlesCount || 0 }} 篇文章</span>
                  <span class="tag-date">创建于: {{ formatDate(tag.created_at) }}</span>
                </div>
              </div>
              <div class="tag-actions">
                <button @click="editTag(tag)" class="action-icon">
                  <i class="fas fa-edit"></i>
                </button>
                <button @click="deleteTag(tag.id)" class="action-icon danger">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 创建/编辑标签模态框 -->
      <div v-if="showCreateTagModal" class="modal-overlay" @click="showCreateTagModal = false">
        <div class="modal-container" @click.stop>
          <div class="modal-header">
            <h3>{{ editingTag ? '编辑标签' : '创建新标签' }}</h3>
            <button @click="showCreateTagModal = false" class="close-btn">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label for="tagName">标签名称</label>
              <input 
                type="text" 
                id="tagName" 
                v-model="newTag.name" 
                placeholder="输入标签名称"
                autofocus
              >
            </div>
            
            <div class="form-group">
              <label for="tagColor">标签颜色</label>
              <div class="color-picker">
                <div 
                  v-for="color in colorOptions" 
                  :key="color"
                  class="color-option"
                  :class="{ selected: newTag.color === color }"
                  :style="{ backgroundColor: color }"
                  @click="newTag.color = color"
                ></div>
              </div>
            </div>
            
            <div class="form-group">
              <label for="tagDescription">描述 (可选)</label>
              <textarea 
                id="tagDescription" 
                v-model="newTag.description" 
                placeholder="输入标签描述"
                rows="3"
              ></textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button @click="showCreateTagModal = false" class="cancel-btn">
              取消
            </button>
            <button @click="saveTag" class="save-btn" :disabled="!newTag.name">
              {{ editingTag ? '保存修改' : '创建标签' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AdminTagsView',
  data() {
    return {
      isDarkMode: true,
      loading: true,
      tags: [],
      filteredTags: [],
      searchQuery: '',
      sortBy: 'name',
      sortOrder: 'asc',
      showCreateTagModal: false,
      editingTag: null,
      newTag: {
        name: '',
        color: '#3498db',
        description: ''
      },
      colorOptions: [
        '#3498db', // 蓝色
        '#2ecc71', // 绿色
        '#e74c3c', // 红色
        '#f39c12', // 橙色
        '#9b59b6', // 紫色
        '#1abc9c', // 蓝绿色
        '#34495e', // 深蓝色
        '#e67e22', // 琥珀色
        '#d35400', // 朱红色
        '#27ae60'  // 翠绿色
      ]
    };
  },
  computed: {
    userAvatar() {
      return this.$store.getters.currentUser?.avatar || '/default-avatar.png';
    }
  },
  mounted() {
    this.fetchTags();
    // 加载Font Awesome图标
    this.loadFontAwesome();
  },
  methods: {
    loadFontAwesome() {
      // 动态加载Font Awesome
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css';
      document.head.appendChild(link);
    },
    toggleTheme() {
      this.isDarkMode = !this.isDarkMode;
    },
    async fetchTags() {
      this.loading = true;
      try {
        // 这里您需要实现一个获取标签的API
        // 这里暂时用模拟数据
        setTimeout(() => {
          this.tags = [
            { id: 1, name: '技术', color: '#3498db', articlesCount: 5, created_at: '2023-01-15' },
            { id: 2, name: '生活', color: '#2ecc71', articlesCount: 3, created_at: '2023-02-20' },
            { id: 3, name: '旅行', color: '#e74c3c', articlesCount: 2, created_at: '2023-03-05' },
            { id: 4, name: '美食', color: '#f39c12', articlesCount: 7, created_at: '2023-04-10' },
            { id: 5, name: '阅读', color: '#9b59b6', articlesCount: 1, created_at: '2023-05-25' }
          ];
          this.filteredTags = [...this.tags];
          this.loading = false;
        }, 500);
        
        // 实际实现:
        // const response = await axios.get('/api/tags');
        // this.tags = response.data;
        // this.filteredTags = [...this.tags];
      } catch (error) {
        console.error('获取标签失败:', error);
      } finally {
        this.loading = false;
      }
    },
    filterTags() {
      let result = [...this.tags];
      
      // 搜索过滤
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        result = result.filter(tag => 
          tag.name.toLowerCase().includes(query) || 
          (tag.description && tag.description.toLowerCase().includes(query))
        );
      }
      
      // 排序
      result.sort((a, b) => {
        let valueA, valueB;
        
        if (this.sortBy === 'name') {
          valueA = a.name.toLowerCase();
          valueB = b.name.toLowerCase();
        } else if (this.sortBy === 'date') {
          valueA = new Date(a.created_at);
          valueB = new Date(b.created_at);
        } else if (this.sortBy === 'count') {
          valueA = a.articlesCount || 0;
          valueB = b.articlesCount || 0;
        }
        
        if (this.sortOrder === 'asc') {
          return valueA > valueB ? 1 : -1;
        } else {
          return valueA < valueB ? 1 : -1;
        }
      });
      
      this.filteredTags = result;
    },
    formatDate(dateString) {
      const date = new Date(dateString);
      return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    },
    editTag(tag) {
      this.editingTag = tag;
      this.newTag = {
        name: tag.name,
        color: tag.color || '#3498db',
        description: tag.description || ''
      };
      this.showCreateTagModal = true;
    },
    async saveTag() {
      if (!this.newTag.name.trim()) {
        return;
      }
      
      try {
        if (this.editingTag) {
          // 更新标签
          // await axios.put(`/api/tags/${this.editingTag.id}`, this.newTag);
          
          // 模拟更新
          const index = this.tags.findIndex(t => t.id === this.editingTag.id);
          if (index !== -1) {
            this.tags[index] = {
              ...this.tags[index],
              ...this.newTag
            };
          }
        } else {
          // 创建新标签
          // const response = await axios.post('/api/tags', this.newTag);
          // this.tags.push(response.data);
          
          // 模拟创建
          const newId = Math.max(...this.tags.map(t => t.id), 0) + 1;
          this.tags.push({
            id: newId,
            ...this.newTag,
            articlesCount: 0,
            created_at: new Date().toISOString().split('T')[0]
          });
        }
        
        this.filterTags();
        this.showCreateTagModal = false;
        this.editingTag = null;
        this.newTag = {
          name: '',
          color: '#3498db',
          description: ''
        };
      } catch (error) {
        console.error('保存标签失败:', error);
      }
    },
    async deleteTag(id) {
      if (!confirm('确定要删除这个标签吗？这将解除该标签与所有文章的关联，但不会删除文章。')) {
        return;
      }
      
      try {
        // await axios.delete(`/api/tags/${id}`);
        
        // 模拟删除
        this.tags = this.tags.filter(tag => tag.id !== id);
        this.filterTags();
      } catch (error) {
        console.error('删除标签失败:', error);
      }
    },
    logout() {
      this.$store.dispatch('logout');
      this.$router.push('/login');
    }
  }
};
</script>

<style scoped>
.admin-layout {
  display: flex;
  min-height: 100vh;
  background-color: #121212;
  color: #e0e0e0;
}

/* 侧边栏样式 - 与DashboardView相同 */
.sidebar {
  width: 240px;
  background-color: #1e1e1e;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #2c2c2c;
}

.logo-container {
  padding: 24px 20px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid #2c2c2c;
}

.logo-text {
  font-size: 20px;
  font-weight: 600;
  color: #ffffff;
}

.nav-menu {
  padding: 20px 0;
  flex: 1;
}

.nav-item {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  color: #a0a0a0;
  text-decoration: none;
  transition: all 0.3s ease;
}

.nav-item i {
  width: 20px;
  margin-right: 12px;
  text-align: center;
}

.nav-item:hover {
  background-color: #2c2c2c;
  color: #ffffff;
}

.nav-item.active {
  background-color: #2c2c2c;
  color: #3498db;
  border-left: 3px solid #3498db;
}

.sidebar-footer {
  padding: 20px;
  border-top: 1px solid #2c2c2c;
}

.logout-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px;
  background-color: #e74c3c;
  color: #ffffff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.logout-btn i {
  margin-right: 8px;
}

.logout-btn:hover {
  background-color: #c0392b;
}

/* 主内容区样式 */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
}

.header {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  background-color: #1a1a1a;
  border-bottom: 1px solid #2c2c2c;
}

.page-title {
  font-size: 18px;
  font-weight: 500;
}

.header-actions {
  display: flex;
  align-items: center;
}

.theme-toggle {
  background: none;
  border: none;
  color: #a0a0a0;
  font-size: 18px;
  margin-right: 16px;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.theme-toggle:hover {
  background-color: #2c2c2c;
  color: #ffffff;
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  cursor: pointer;
  background-color: #3498db;
}

/* 标签管理内容样式 */
.tags-content {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-header h1 {
  font-size: 24px;
  font-weight: 600;
  margin: 0;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  padding: 10px 16px;
  background-color: #3498db;
  color: #ffffff;
  border: none;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.action-btn i {
  margin-right: 8px;
}

.action-btn:hover {
  background-color: #2980b9;
}

.filter-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  background-color: #1e1e1e;
  border-radius: 8px;
  padding: 12px 16px;
}

.search-box {
  display: flex;
  align-items: center;
  flex: 1;
}

.search-box i {
  color: #a0a0a0;
  margin-right: 8px;
}

.search-box input {
  flex: 1;
  background: none;
  border: none;
  color: #e0e0e0;
  font-size: 16px;
  outline: none;
}

.filter-options {
  display: flex;
  align-items: center;
}

.filter-options select {
  background-color: #2c2c2c;
  color: #e0e0e0;
  border: none;
  padding: 8px 12px;
  border-radius: 4px;
  margin-right: 8px;
}

.filter-options button {
  background-color: #2c2c2c;
  color: #e0e0e0;
  border: none;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
}

.tags-list-container {
  background-color: #1e1e1e;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  overflow: hidden;
}

.loading-state {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px 0;
  color: #a0a0a0;
}

.loading-state i {
  margin-right: 8px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 60px 0;
  color: #a0a0a0;
}

.empty-state i {
  font-size: 48px;
  margin-bottom: 16px;
}

.empty-state p {
  margin-bottom: 24px;
}

.tags-list {
  padding: 8px;
}

.tag-item {
  display: flex;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #2c2c2c;
  transition: background-color 0.3s ease;
}

.tag-item:last-child {
  border-bottom: none;
}

.tag-item:hover {
  background-color: #2c2c2c;
}

.tag-color {
  width: 16px;
  height: 16px;
  border-radius: 4px;
  margin-right: 16px;
}

.tag-info {
  flex: 1;
}

.tag-name {
  font-weight: 500;
  margin-bottom: 4px;
}

.tag-meta {
  display: flex;
  font-size: 14px;
  color: #a0a0a0;
}

.tag-count {
  margin-right: 16px;
}

.tag-actions {
  display: flex;
  gap: 12px;
}

.action-icon {
  background: none;
  border: none;
  color: #a0a0a0;
  font-size: 16px;
  cursor: pointer;
  padding: 4px;
  transition: color 0.3s ease;
}

.action-icon:hover {
  color: #3498db;
}

.action-icon.danger:hover {
  color: #e74c3c;
}

/* 模态框样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-container {
  width: 100%;
  max-width: 500px;
  background-color: #1e1e1e;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #2c2c2c;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  color: #a0a0a0;
  font-size: 16px;
  cursor: pointer;
  padding: 4px;
  transition: color 0.3s ease;
}

.close-btn:hover {
  color: #e74c3c;
}

.modal-body {
  padding: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group:last-child {
  margin-bottom: 0;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
}

.form-group input,
.form-group textarea {
  width: 100%;
  background-color: #2c2c2c;
  border: 1px solid #3c3c3c;
  border-radius: 4px;
  padding: 10px 12px;
  color: #e0e0e0;
  font-size: 16px;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #3498db;
}

.color-picker {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.color-option {
  width: 32px;
  height: 32px;
  border-radius: 4px;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.color-option:hover {
  transform: scale(1.1);
}

.color-option.selected {
  box-shadow: 0 0 0 2px #ffffff;
}

.modal-footer {
  padding: 16px 20px;
  border-top: 1px solid #2c2c2c;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.cancel-btn {
  padding: 10px 16px;
  background-color: #2c2c2c;
  color: #e0e0e0;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.cancel-btn:hover {
  background-color: #3c3c3c;
}

.save-btn {
  padding: 10px 16px;
  background-color: #3498db;
  color: #ffffff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.save-btn:hover {
  background-color: #2980b9;
}

.save-btn:disabled {
  background-color: #95a5a6;
  cursor: not-allowed;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .admin-layout {
    flex-direction: column;
  }
  
  .sidebar {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid #2c2c2c;
  }
  
  .filter-bar {
    flex-direction: column;
    gap: 12px;
  }
  
  .filter-options {
    width: 100%;
    justify-content: space-between;
  }
  
  .tag-meta {
    flex-direction: column;
    gap: 4px;
  }
}
</style> 