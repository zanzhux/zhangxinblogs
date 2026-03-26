<template>
  <div class="articles-by-category">
    <div class="container">
      <div class="section-header">
        <h1 class="page-title">{{ categoryName }}</h1>
        <div class="category-info">
          <span class="article-count">{{ articles.length }} 篇文章</span>
          <router-link to="/categories" class="back-link">返回分类列表</router-link>
        </div>
        <div class="decorative-line"></div>
      </div>

      <div class="articles-content">
        <div class="loading-container" v-if="loading">
          <div class="loading-spinner"></div>
          <p>正在加载文章...</p>
        </div>

        <div v-else-if="articles.length === 0" class="no-articles">
          <p>该分类下暂无文章</p>
          <router-link to="/new-article" v-if="isAuthenticated" class="btn">写一篇新文章</router-link>
        </div>

        <div v-else class="articles-grid">
          <div v-for="article in articles" :key="article.id" class="article-card" @click="viewArticle(article.id)">
            <div class="article-inner">
              <div class="article-thumbnail" v-if="article.cover_image">
                <img :src="article.cover_image" alt="文章封面" class="thumbnail-img">
              </div>
              <div class="article-content">
                <h3 class="article-title">{{ article.title }}</h3>
                <div class="article-meta">
                  <span class="article-date">{{ formatDate(article.created_at) }}</span>
                  <span class="article-author">{{ getAuthorName(article) }}</span>
                </div>
                <p class="article-excerpt">{{ truncateContent(article.content) }}</p>
                <div class="article-footer">
                  <div class="article-stats">
                    <span class="views-count">{{ article.views_count || 0 }} 阅读</span>
                    <span class="comments-count">{{ article.comments_count || 0 }} 评论</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'ArticlesByCategoryView',
  data() {
    return {
      articles: [],
      loading: true,
      categoryName: ''
    }
  },
  computed: {
    ...mapGetters(['isAuthenticated'])
  },
  created() {
    this.fetchArticles();
    
    // 设置分类名称
    const categoryId = this.$route.params.categoryId;
    const categories = {
      '摇滚音乐': '摇滚音乐',
      '文学': '文学',
      '电影': '电影',
      '旅行': '旅行',
      '摄影': '摄影',
      '生活随笔': '生活随笔',
      '艺术': '艺术',
      '哲学': '哲学'
    };
    this.categoryName = categories[categoryId] || categoryId;
  },
  methods: {
    async fetchArticles() {
      this.loading = true;
      try {
        const allArticles = await this.$store.dispatch('fetchArticles');
        const categoryId = this.$route.params.categoryId;
        
        // 过滤出属于当前分类的文章
        this.articles = allArticles.filter(article => 
          article.tags && article.tags.includes(categoryId)
        );
      } catch (error) {
        console.error('获取分类文章失败:', error);
        this.articles = [];
      } finally {
        this.loading = false;
      }
    },
    viewArticle(id) {
      this.$router.push(`/article/${id}`);
    },
    formatDate(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
    },
    getAuthorName(article) {
      if (!article) return '';
      if (article.author && article.author.username) return article.author.username;
      return '张鑫';
    },
    truncateContent(content) {
      if (!content) return '';
      const plainText = content.replace(/<[^>]*>/g, '');
      return plainText.length > 150 ? plainText.substring(0, 150) + '...' : plainText;
    }
  },
  watch: {
    '$route'(to, from) {
      if (to.params.categoryId !== from.params.categoryId) {
        this.fetchArticles();
      }
    }
  }
}
</script>

<style scoped>
.articles-by-category {
  padding-bottom: var(--spacing-xl);
}

.section-header {
  text-align: center;
  margin-bottom: var(--spacing-xl);
}

.page-title {
  margin-bottom: var(--spacing-sm);
}

.category-info {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: var(--spacing-md);
  margin: var(--spacing-md) 0;
}

.article-count {
  color: var(--color-light);
  opacity: 0.8;
}

.back-link {
  color: var(--color-primary);
  text-decoration: none;
}

.back-link:hover {
  text-decoration: underline;
}

.decorative-line {
  height: 1px;
  width: 120px;
  margin: var(--spacing-md) auto;
  background: linear-gradient(to right, transparent, rgba(255, 255, 255, 0.5), transparent);
}

.articles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--spacing-lg);
  padding: var(--spacing-md);
}

.article-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  overflow: hidden;
  transition: transform 0.3s ease;
  cursor: pointer;
}

.article-card:hover {
  transform: translateY(-5px);
}

.article-inner {
  padding: var(--spacing-md);
}

.article-thumbnail {
  width: 100%;
  height: 200px;
  overflow: hidden;
  border-radius: 4px;
  margin-bottom: var(--spacing-md);
}

.thumbnail-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.article-title {
  font-size: 1.2rem;
  margin-bottom: var(--spacing-sm);
  color: var(--color-light);
}

.article-meta {
  font-size: 0.9rem;
  color: var(--color-light);
  opacity: 0.7;
  margin-bottom: var(--spacing-sm);
}

.article-excerpt {
  font-size: 0.95rem;
  line-height: 1.6;
  color: var(--color-light);
  opacity: 0.9;
  margin-bottom: var(--spacing-md);
}

.article-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9rem;
  color: var(--color-light);
  opacity: 0.7;
}

.article-stats {
  display: flex;
  gap: var(--spacing-md);
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
  border-top: 4px solid var(--color-primary);
  animation: spin 1s linear infinite;
  margin-bottom: var(--spacing-md);
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.no-articles {
  text-align: center;
  padding: var(--spacing-xl);
}

.btn {
  display: inline-block;
  padding: var(--spacing-sm) var(--spacing-md);
  margin-top: var(--spacing-md);
  background-color: var(--color-primary);
  color: var(--color-light);
  text-decoration: none;
  border-radius: 4px;
  transition: background-color 0.3s ease;
}

.btn:hover {
  background-color: var(--color-primary-dark);
}

@media (max-width: 768px) {
  .articles-grid {
    grid-template-columns: 1fr;
  }
}
</style> 