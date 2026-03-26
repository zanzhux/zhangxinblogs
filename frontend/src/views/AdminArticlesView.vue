<template>
  <div class="admin-articles">
    <h1 class="title">文章管理</h1>

    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>加载中...</p>
    </div>

    <div v-else>
      <div class="action-bar">
        <div class="search-box">
          <input type="text" v-model="searchQuery" placeholder="搜索文章标题..." @input="filterArticles" />
        </div>
        <router-link to="/admin/new-article" class="new-btn">新建文章</router-link>
      </div>

      <!-- 添加错误信息显示 -->
      <div v-if="error" class="error-message">
        {{ error }}
      </div>

      <table class="articles-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>标题</th>
            <th>日期</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="article in filteredArticles" :key="article.id">
            <td>{{ article.id }}</td>
            <td class="title-cell">
              <router-link :to="`/article/${article.id}`">{{ article.title }}</router-link>
            </td>
            <td>{{ formatDate(article.created_at) }}</td>
            <td class="actions">
              <router-link :to="`/admin/edit-article/${article.id}`" class="action-link">编辑</router-link>
              <button @click="deleteArticle(article.id)" class="action-link delete">删除</button>
            </td>
          </tr>
          <tr v-if="filteredArticles.length === 0">
            <td colspan="4" class="no-results">没有找到文章</td>
          </tr>
        </tbody>
      </table>

      <div class="pagination" v-if="totalPages > 1">
        <button class="page-btn" :disabled="currentPage === 1" @click="changePage(currentPage - 1)">
          上一页
        </button>

        <span class="page-info">{{ currentPage }} / {{ totalPages }}</span>

        <button class="page-btn" :disabled="currentPage === totalPages" @click="changePage(currentPage + 1)">
          下一页
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'AdminArticlesView',
  data() {
    return {
      loading: true,
      articles: [],
      searchQuery: '',
      currentPage: 1,
      itemsPerPage: 10,
      error: null
    };
  },
  computed: {
    // 检查是否是管理员
    isAdmin() {
      return this.$store.getters.isAdmin;
    },
    // 分页过滤后的文章
    filteredArticles() {
      let result = this.articles;

      // 应用搜索过滤
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        result = result.filter(article =>
          article.title.toLowerCase().includes(query)
        );
      }

      // 计算分页
      const startIndex = (this.currentPage - 1) * this.itemsPerPage;
      const endIndex = startIndex + this.itemsPerPage;

      return result.slice(startIndex, endIndex);
    },
    // 计算总页数
    totalPages() {
      let filteredCount = this.articles.length;

      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        filteredCount = this.articles.filter(article =>
          article.title.toLowerCase().includes(query)
        ).length;
      }

      return Math.ceil(filteredCount / this.itemsPerPage);
    }
  },
  methods: {
    // 格式化日期
    formatDate(dateString) {
      const date = new Date(dateString);
      return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    },
    // 删除文章
    async deleteArticle(id) {
      if (confirm('确定要删除这篇文章吗？此操作不可恢复!')) {
        try {
          // 获取 token
          const token = localStorage.getItem('token');
          if (!token) {
            this.error = '登录已过期，请重新登录';
            this.$router.push('/admin/login').catch(() => { });
            return;
          }

          // 打印请求信息
          console.log('Deleting article with ID:', id);
          console.log('Token:', token);
          console.log('Current user:', this.$store.getters.currentUser);

          // 使用 Vuex action 删除文章
          await this.$store.dispatch('deleteArticle', id);

          // 更新本地数据
          this.articles = this.articles.filter(article => article.id !== id);
          this.error = null; // 清除可能存在的错误信息

          // 显示成功消息
          this.$message = '文章删除成功';
        } catch (error) {
          console.error('删除文章失败:', error);
          if (error.response) {
            console.error('错误响应:', error.response);
            console.error('错误状态:', error.response.status);
            console.error('错误数据:', error.response.data);
          }
          console.error('错误配置:', error.config);
          console.error('完整的错误对象:', JSON.stringify(error, null, 2));

          if (error.response && error.response.status === 401) {
            // 如果当前不在登录页面，才进行重定向
            if (this.$route.path !== '/admin/login') {
              this.$router.push('/admin/login').catch(() => { });
            }
            this.error = '登录已过期，请重新登录';
          } else {
            this.error = error.response && error.response.data && error.response.data.message
              ? error.response.data.message
              : '删除文章失败，请稍后重试';
          }
        }
      }
    },
    // 搜索过滤
    filterArticles() {
      this.currentPage = 1; // 重置到第一页
    },
    // 切换页面
    changePage(page) {
      this.currentPage = page;
    },
    // 加载数据
    async loadData() {
      this.loading = true;
      this.error = null;

      try {
        // 使用 Vuex 获取模拟文章数据
        this.articles = await this.$store.dispatch('fetchArticles');
        // 过滤已经展示的文章
        this.filterArticles();
      } catch (error) {
        console.error('加载文章失败:', error);
        this.error = error && typeof error === 'string' ? error : '加载文章失败，请稍后再试';
        this.articles = []; // 确保 articles 是一个空数组而不是 undefined
      } finally {
        this.loading = false;
      }
    }
  },
  created() {
    this.loadData();
  }
};
</script>

<style scoped>
.admin-articles {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem 0;
}

.container {
  width: 100%;
  max-width: 1200px;
  padding: 2.5rem;
  background-color: rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.title {
  font-family: 'Ma Shan Zheng', cursive;
  font-size: 2.5rem;
  margin-bottom: 2rem;
  font-weight: normal;
  letter-spacing: 0.05em;
  text-align: center;
  position: relative;
}

.title::after {
  content: "";
  display: block;
  width: 60px;
  height: 1px;
  background: rgba(255, 255, 255, 0.2);
  margin: 0.5rem auto 0;
}

.action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.search-box input {
  padding: 0.8rem 1rem;
  font-size: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background-color: rgba(0, 0, 0, 0.2);
  color: rgba(255, 255, 255, 0.9);
  transition: all 0.3s;
  width: 300px;
}

.search-box input:focus {
  border-color: rgba(255, 255, 255, 0.3);
  outline: none;
}

.new-btn {
  padding: 0.7rem 1.8rem;
  background-color: var(--color-black);
  color: var(--color-light);
  border: 1px solid rgba(255, 255, 255, 0.1);
  font-family: 'Noto Serif SC', serif;
  letter-spacing: 0.05em;
  transition: var(--transition);
  text-decoration: none;
  display: inline-block;
}

.new-btn:hover {
  background-color: rgba(0, 0, 0, 0.7);
}

.articles-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 2rem;
  background-color: rgba(0, 0, 0, 0.2);
}

.articles-table th,
.articles-table td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.articles-table th {
  font-family: 'Ma Shan Zheng', cursive;
  font-weight: normal;
  font-size: 1.2rem;
  background-color: rgba(0, 0, 0, 0.3);
}

.articles-table tr:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

.title-cell a {
  color: rgba(255, 255, 255, 0.9);
  text-decoration: none;
  transition: all 0.3s;
}

.title-cell a:hover {
  color: #fff;
}

.actions {
  display: flex;
  gap: 1rem;
}

.action-link {
  padding: 0.4rem 1rem;
  background-color: rgba(0, 0, 0, 0.3);
  color: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.1);
  text-decoration: none;
  font-size: 0.9rem;
  transition: all 0.3s;
  cursor: pointer;
}

.action-link:hover {
  background-color: rgba(0, 0, 0, 0.5);
  border-color: rgba(255, 255, 255, 0.2);
}

.action-link.delete {
  background-color: rgba(255, 59, 48, 0.2);
}

.action-link.delete:hover {
  background-color: rgba(255, 59, 48, 0.3);
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
}

.page-btn {
  padding: 0.5rem 1rem;
  background-color: rgba(0, 0, 0, 0.3);
  color: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.1);
  cursor: pointer;
  transition: all 0.3s;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-btn:not(:disabled):hover {
  background-color: rgba(0, 0, 0, 0.5);
  border-color: rgba(255, 255, 255, 0.2);
}

.page-info {
  color: rgba(255, 255, 255, 0.7);
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255, 255, 255, 0.1);
  border-top-color: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

.no-results {
  text-align: center;
  padding: 2rem;
  color: rgba(255, 255, 255, 0.5);
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 768px) {
  .admin-articles {
    padding: 1rem;
  }

  .action-bar {
    flex-direction: column;
    gap: 1rem;
  }

  .search-box input {
    width: 100%;
  }

  .articles-table {
    font-size: 0.9rem;
  }

  .articles-table th,
  .articles-table td {
    padding: 0.8rem;
  }

  .actions {
    flex-direction: column;
    gap: 0.5rem;
  }

  .action-link {
    text-align: center;
  }
}

.error-message {
  background-color: rgba(255, 59, 48, 0.2);
  color: #ff6b6b;
  padding: 1rem;
  margin-bottom: 1rem;
  border: 1px solid rgba(255, 59, 48, 0.3);
  text-align: center;
}
</style>