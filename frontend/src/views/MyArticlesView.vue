<template>
  <div class="my-articles">
    <div class="container">
      <div class="section-header">
        <h1 class="page-title">我的文章</h1>
        <div class="decorative-line"></div>
        <div class="header-actions">
          <router-link to="/new-article" class="btn create-btn">
            创建新文章
          </router-link>
        </div>
        <div class="search-bar">
          <input type="text" v-model="searchQuery" placeholder="搜索我的文章..." class="search-input" @input="handleSearch">
        </div>
      </div>

      <div class="articles-content">
        <div v-if="isLoading" class="loading-container">
          <div class="loading-spinner"></div>
          <p>加载中...</p>
        </div>

        <div v-else-if="filteredArticles.length === 0" class="no-articles">
          <p v-if="searchQuery">没有找到匹配的文章</p>
          <p v-else>您还没有发布任何文章</p>
          <router-link to="/new-article" class="new-article-btn">写一篇新文章</router-link>
        </div>

        <div v-else class="articles-list">
          <div v-for="(article, index) in filteredArticles" :key="index" class="article-card">
            <div class="article-header">
              <h2 class="article-title">{{ article.title }}</h2>
              <div class="article-meta">
                <span class="date">{{ formatDate(article.created_at) }}</span>
                <span class="status">已发布</span>
              </div>
            </div>

            <div class="article-content">
              <p>{{ truncateContent(article.content) }}</p>
            </div>

            <div class="article-footer">
              <div class="article-stats">
                <span class="stat">阅读: {{ article.views_count || 0 }}</span>
                <span class="stat">评论: {{ article.comments_count || 0 }}</span>
                <span class="stat">点赞: {{ article.likes_count || 0 }}</span>
              </div>

              <div class="article-actions">
                <router-link :to="`/article/${article.id}`" class="action-btn view-btn">
                  查看
                </router-link>
                <router-link :to="`/edit-article/${article.id}`" class="action-btn edit-btn">
                  编辑
                </router-link>
                <button @click="confirmDelete(article)" class="action-btn delete-btn">
                  删除
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 删除确认对话框 -->
    <div v-if="showDeleteModal" class="modal-backdrop">
      <div class="modal">
        <h3>确认删除</h3>
        <p>确定要删除文章 "{{ articleToDelete ? articleToDelete.title : '' }}" 吗？此操作不可恢复。</p>
        <div class="modal-actions">
          <button @click="cancelDelete" class="cancel-btn">取消</button>
          <button @click="deleteArticle" class="confirm-delete-btn">确认删除</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MyArticlesView',
  data() {
    return {
      articles: [],
      isLoading: true,
      showDeleteModal: false,
      articleToDelete: null,
      searchQuery: '',
      filteredArticles: []
    }
  },
  methods: {
    async fetchUserArticles() {
      try {
        this.isLoading = true;
        // 获取当前用户的文章
        const allArticles = await this.$store.dispatch('fetchArticles');
        const currentUser = this.$store.getters.currentUser;

        // 只保留当前用户的文章
        this.articles = allArticles.filter(article =>
          article.user_id === currentUser.id
        );

        // 初始化过滤后的文章列表
        this.filteredArticles = [...this.articles];
      } catch (error) {
        console.error('获取用户文章失败:', error);
        this.articles = [];
        this.filteredArticles = [];
      } finally {
        this.isLoading = false;
      }
    },

    handleSearch() {
      if (!this.searchQuery.trim()) {
        // 如果搜索框为空，显示所有文章
        this.filteredArticles = [...this.articles];
        return;
      }

      const query = this.searchQuery.toLowerCase().trim();
      this.filteredArticles = this.articles.filter(article => {
        return (
          article.title.toLowerCase().includes(query) || // 搜索标题
          article.content.toLowerCase().includes(query) || // 搜索内容
          (article.tags && article.tags.some(tag => // 搜索标签
            tag.toLowerCase().includes(query)
          ))
        );
      });
    },

    truncateContent(content) {
      if (!content) return '';
      const plainText = content.replace(/<[^>]*>/g, '');
      return plainText.length > 150 ? plainText.substring(0, 150) + '...' : plainText;
    },

    formatDate(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    },

    confirmDelete(article) {
      this.articleToDelete = article;
      this.showDeleteModal = true;
    },

    cancelDelete() {
      this.showDeleteModal = false;
      this.articleToDelete = null;
    },

    async deleteArticle() {
      if (!this.articleToDelete) return;

      try {
        await this.$store.dispatch('deleteArticle', this.articleToDelete.id);
        this.articles = this.articles.filter(a => a.id !== this.articleToDelete.id);
        this.filteredArticles = this.filteredArticles.filter(a => a.id !== this.articleToDelete.id);
        this.showDeleteModal = false;
        this.articleToDelete = null;
      } catch (error) {
        console.error('删除文章失败:', error);
      }
    }
  },
  created() {
    this.fetchUserArticles();
  }
}
</script>

<style scoped>
.my-articles {
  padding-bottom: var(--spacing-xl);
}

.container {
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
  padding: 0 var(--spacing-md);
}

.section-header {
  margin-bottom: var(--spacing-lg);
  text-align: center;
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--spacing-md);
}

.page-title {
  font-family: 'Ma Shan Zheng', cursive;
  font-size: 2.5rem;
  margin-bottom: var(--spacing-xs);
  font-weight: normal;
}

.decorative-line {
  height: 1px;
  width: 80px;
  margin: var(--spacing-xs) auto var(--spacing-md);
  background: rgba(255, 255, 255, 0.3);
}

.header-actions {
  margin-top: var(--spacing-md);
}

.create-btn {
  display: inline-block;
  background-color: var(--color-black);
  color: var(--color-light);
  padding: 0.7rem 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: var(--transition);
  font-family: 'Noto Serif SC', serif;
  text-decoration: none;
}

.create-btn:hover {
  background-color: rgba(0, 0, 0, 0.7);
  transform: translateY(-2px);
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  border-top-color: rgba(255, 255, 255, 0.7);
  animation: spin 1s linear infinite;
  margin-bottom: var(--spacing-md);
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.no-articles {
  text-align: center;
  padding: var(--spacing-xl) 0;
}

.no-articles p {
  margin-bottom: var(--spacing-md);
  opacity: 0.8;
}

.articles-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.article-card {
  background-color: rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.05);
  padding: var(--spacing-md);
  transition: var(--transition);
}

.article-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  background-color: rgba(0, 0, 0, 0.25);
}

.article-header {
  margin-bottom: var(--spacing-sm);
}

.article-title {
  font-family: 'Ma Shan Zheng', cursive;
  font-size: 1.8rem;
  margin-bottom: var(--spacing-xs);
  font-weight: normal;
}

.article-meta {
  display: flex;
  justify-content: space-between;
  margin-bottom: var(--spacing-sm);
  font-size: 0.85rem;
  opacity: 0.7;
}

.status {
  padding: 0.2em 0.5em;
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
}

.article-content {
  margin-bottom: var(--spacing-md);
  line-height: 1.6;
  opacity: 0.9;
}

.article-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
}

.article-stats {
  display: flex;
  gap: var(--spacing-md);
  font-size: 0.85rem;
  opacity: 0.7;
}

.article-actions {
  display: flex;
  gap: var(--spacing-xs);
}

.action-btn {
  padding: 0.4rem 0.8rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background-color: rgba(0, 0, 0, 0.2);
  color: var(--color-light);
  font-size: 0.9rem;
  cursor: pointer;
  transition: var(--transition);
  text-decoration: none;
}

.action-btn:hover {
  background-color: rgba(0, 0, 0, 0.4);
}

.view-btn {
  background-color: rgba(0, 0, 0, 0.2);
}

.edit-btn {
  background-color: rgba(0, 0, 0, 0.3);
}

.delete-btn {
  color: #ff6b6b;
}

/* 模态对话框 */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal {
  background-color: var(--color-brown);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: var(--spacing-lg);
  max-width: 500px;
  width: 90%;
}

.modal h3 {
  font-family: 'Ma Shan Zheng', cursive;
  margin-bottom: var(--spacing-md);
  font-weight: normal;
  font-size: 1.8rem;
}

.modal p {
  margin-bottom: var(--spacing-lg);
  line-height: 1.6;
}

.modal-actions {
  display: flex;
  justify-content: center;
  gap: var(--spacing-md);
}

.cancel-btn,
.confirm-delete-btn {
  padding: 0.6rem 1.2rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  cursor: pointer;
  transition: var(--transition);
}

.cancel-btn {
  background-color: rgba(0, 0, 0, 0.3);
}

.confirm-delete-btn {
  background-color: var(--color-black);
  color: #ff6b6b;
}

@media (max-width: 768px) {
  .article-footer {
    flex-direction: column;
    align-items: flex-start;
  }

  .article-actions {
    width: 100%;
    justify-content: space-between;
  }
}

.search-bar {
  flex: 1;
  max-width: 400px;
}

.search-input {
  width: 100%;
  padding: 0.8rem 1.2rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  background-color: rgba(0, 0, 0, 0.2);
  color: #fff;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: rgba(255, 255, 255, 0.3);
  background-color: rgba(0, 0, 0, 0.3);
}

.search-input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.new-article-btn {
  display: inline-block;
  margin-top: var(--spacing-md);
  padding: 0.8rem 1.5rem;
  background-color: var(--primary-color);
  color: #fff;
  border-radius: 4px;
  text-decoration: none;
  transition: background-color 0.3s ease;
}

.new-article-btn:hover {
  background-color: var(--primary-color-dark);
}
</style>