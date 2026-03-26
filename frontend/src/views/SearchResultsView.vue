<template>
  <div class="search-results-view">
    <div class="container">
      <div class="section-header">
        <h1 class="page-title">搜索结果</h1>
        <div class="search-query">关键词: <span class="query-text">{{ searchQuery }}</span></div>
        <div class="decorative-line"></div>
      </div>

      <div class="search-content">
        <div class="loading-container" v-if="loading">
          <div class="loading-spinner"></div>
          <p>正在搜索...</p>
        </div>

        <div v-else-if="searchResults.length > 0" class="results-list">
          <div v-for="article in searchResults" :key="article.id" class="result-item">
            <router-link :to="{ name: 'article-detail', params: { id: article.id } }" class="result-title">
              {{ article.title }}
            </router-link>

            <div class="result-meta">
              <span class="result-date">{{ formatDate(article.date) }}</span>
              <span class="result-category" v-if="article.category">{{ article.category }}</span>
            </div>

            <p class="result-excerpt" v-html="highlightMatches(article.summary)"></p>

            <div class="result-tags" v-if="article.tags && article.tags.length">
              <span class="result-tag" v-for="tag in article.tags" :key="tag">{{ tag }}</span>
            </div>
          </div>

          <div class="pagination" v-if="totalPages > 1">
            <button :disabled="currentPage === 1" @click="changePage(currentPage - 1)" class="page-button">
              上一页
            </button>

            <div class="page-numbers">
              <span class="page-number">{{ currentPage }} / {{ totalPages }}</span>
            </div>

            <button :disabled="currentPage === totalPages" @click="changePage(currentPage + 1)" class="page-button">
              下一页
            </button>
          </div>
        </div>

        <div v-else class="no-results">
          <div class="no-results-icon">🔍</div>
          <h2>未找到结果</h2>
          <p>很抱歉，没有找到与 "{{ searchQuery }}" 相关的文章</p>
          <div class="search-suggestions">
            <h3>搜索建议：</h3>
            <ul>
              <li>检查您的拼写</li>
              <li>尝试使用更通用的关键词</li>
              <li>尝试使用相关的同义词</li>
            </ul>
          </div>
          <router-link to="/" class="return-home">返回首页</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SearchResultsView',
  data() {
    return {
      searchResults: [],
      loading: true,
      currentPage: 1,
      totalPages: 1,
      resultsPerPage: 10
    }
  },
  computed: {
    searchQuery() {
      return this.$route.query.q || '';
    },
    currentUser() {
      return this.$store.getters.currentUser;
    }
  },
  watch: {
    '$route.query.q': {
      handler(newQuery) {
        if (newQuery) {
          this.currentPage = 1;
          this.searchArticles();
        }
      },
      immediate: true
    }
  },
  methods: {
    async searchArticles() {
      this.loading = true;

      try {
        if (!this.searchQuery) {
          this.searchResults = [];
          this.loading = false;
          return;
        }

        // 从 Vuex store 获取所有文章
        const allArticles = await this.$store.dispatch('fetchArticles');
        const query = this.searchQuery.toLowerCase();

        // 搜索所有文章
        let filteredArticles = allArticles.filter(article => {
          return (
            article.title.toLowerCase().includes(query) ||
            article.content.toLowerCase().includes(query) ||
            (article.category && article.category.toLowerCase().includes(query)) ||
            (article.tags && article.tags.some(tag =>
              typeof tag === 'string'
                ? tag.toLowerCase().includes(query)
                : tag.name.toLowerCase().includes(query)
            ))
          );
        });

        // 计算总页数
        this.totalPages = Math.ceil(filteredArticles.length / this.resultsPerPage);

        // 根据分页获取当前页的结果
        const startIndex = (this.currentPage - 1) * this.resultsPerPage;
        const endIndex = startIndex + this.resultsPerPage;
        this.searchResults = filteredArticles.slice(startIndex, endIndex);

        // 处理搜索结果的摘要
        this.searchResults = this.searchResults.map(article => ({
          ...article,
          summary: this.generateSummary(article.content)
        }));

      } catch (error) {
        console.error('搜索文章失败:', error);
        this.searchResults = [];
      } finally {
        this.loading = false;
      }
    },
    generateSummary(content) {
      if (!content) return '';

      // 移除 HTML 标签
      const plainText = content.replace(/<[^>]*>/g, '');

      // 如果内容长度小于 200 字符，直接返回
      if (plainText.length <= 200) return plainText;

      // 查找搜索词的位置
      const searchIndex = plainText.toLowerCase().indexOf(this.searchQuery.toLowerCase());

      // 如果找到搜索词
      if (searchIndex !== -1) {
        // 从搜索词前后各取一些文字
        const start = Math.max(0, searchIndex - 100);
        const end = Math.min(plainText.length, searchIndex + 100);
        let summary = plainText.substring(start, end);

        // 添加省略号
        if (start > 0) summary = '...' + summary;
        if (end < plainText.length) summary = summary + '...';

        return summary;
      }

      // 如果没找到搜索词，返回前 200 字符
      return plainText.substring(0, 200) + '...';
    },
    formatDate(dateString) {
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      return `${year}-${month}-${day}`;
    },
    highlightMatches(text) {
      if (!this.searchQuery || !text) return text;

      // 转义搜索词，防止正则表达式错误
      const escapeRegExp = (string) => {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      };

      const regex = new RegExp(`(${escapeRegExp(this.searchQuery)})`, 'gi');
      return text.replace(regex, '<span class="highlight">$1</span>');
    },
    changePage(page) {
      this.currentPage = page;
      this.searchArticles();

      // 滚动到页面顶部
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  }
}
</script>

<style scoped>
.search-results-view {
  padding-bottom: var(--spacing-xl);
}

.section-header {
  text-align: center;
  margin-bottom: var(--spacing-xl);
}

.page-title {
  margin-bottom: var(--spacing-xs);
}

.search-query {
  font-size: 1rem;
  margin-bottom: var(--spacing-sm);
  opacity: 0.8;
}

.query-text {
  font-weight: bold;
  color: white;
}

.decorative-line {
  height: 1px;
  width: 120px;
  margin: 0 auto;
  background: linear-gradient(to right, transparent, rgba(255, 255, 255, 0.5), transparent);
}

.search-content {
  max-width: 800px;
  margin: 0 auto;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-xl) 0;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  border-top: 4px solid rgba(255, 255, 255, 0.7);
  animation: spin 1s linear infinite;
  margin-bottom: var(--spacing-md);
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

.results-list {
  padding: var(--spacing-md);
}

.result-item {
  margin-bottom: var(--spacing-xl);
  padding-bottom: var(--spacing-lg);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.result-title {
  display: block;
  font-size: 1.4rem;
  margin-bottom: var(--spacing-sm);
  color: var(--color-light);
  text-decoration: none;
  transition: all 0.3s ease;
  font-weight: bold;
  line-height: 1.4;
}

.result-title:hover {
  color: white;
  text-shadow: 0 0 5px rgba(255, 255, 255, 0.3);
}

.result-meta {
  display: flex;
  margin-bottom: var(--spacing-md);
  opacity: 0.7;
  font-size: 0.9rem;
}

.result-date {
  margin-right: var(--spacing-md);
}

.result-category {
  background-color: rgba(0, 0, 0, 0.2);
  padding: 2px 8px;
  border-radius: 3px;
}

.result-excerpt {
  margin-bottom: var(--spacing-md);
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.9);
}

.result-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-xs);
}

.result-tag {
  background-color: rgba(0, 0, 0, 0.2);
  padding: 3px 8px;
  border-radius: 3px;
  font-size: 0.8rem;
  opacity: 0.8;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: var(--spacing-xl);
  padding-top: var(--spacing-md);
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.page-button {
  background-color: var(--color-black);
  color: var(--color-light);
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 8px 16px;
  margin: 0 var(--spacing-sm);
  cursor: pointer;
  transition: all 0.3s ease;
}

.page-button:hover:not(:disabled) {
  background-color: rgba(0, 0, 0, 0.5);
  border-color: rgba(255, 255, 255, 0.4);
}

.page-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-numbers {
  margin: 0 var(--spacing-md);
}

.page-number {
  font-family: monospace;
  font-size: 1rem;
}

.no-results {
  text-align: center;
  padding: var(--spacing-xl) 0;
}

.no-results-icon {
  font-size: 3rem;
  margin-bottom: var(--spacing-md);
  opacity: 0.7;
}

.no-results h2 {
  margin-bottom: var(--spacing-md);
}

.no-results p {
  margin-bottom: var(--spacing-lg);
  opacity: 0.8;
}

.search-suggestions {
  text-align: left;
  max-width: 300px;
  margin: 0 auto var(--spacing-xl) auto;
  background-color: rgba(0, 0, 0, 0.2);
  padding: var(--spacing-md);
  border-radius: 5px;
}

.search-suggestions h3 {
  margin-bottom: var(--spacing-sm);
  font-size: 1.1rem;
}

.search-suggestions ul {
  list-style-type: disc;
  padding-left: var(--spacing-lg);
}

.search-suggestions li {
  margin-bottom: var(--spacing-xs);
  opacity: 0.8;
}

.return-home {
  display: inline-block;
  background-color: var(--color-black);
  color: var(--color-light);
  padding: 8px 16px;
  border-radius: 3px;
  text-decoration: none;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.return-home:hover {
  background-color: rgba(0, 0, 0, 0.5);
  border-color: rgba(255, 255, 255, 0.4);
}

:deep(.highlight) {
  background-color: rgba(255, 204, 0, 0.3);
  border-radius: 2px;
  padding: 0 2px;
  font-weight: bold;
}

@media (max-width: 768px) {
  .results-list {
    padding: var(--spacing-sm);
  }

  .result-title {
    font-size: 1.2rem;
  }

  .result-meta {
    flex-direction: column;
    gap: var(--spacing-xs);
  }

  .result-date {
    margin-right: 0;
  }

  .result-category {
    display: inline-block;
  }
}
</style>