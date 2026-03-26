<template>
  <div class="home-view">
    <section class="hero-section">
      <div class="container">
        <div class="hero-content">
          <div class="brush-image-container">
            <img src="../../public/fm.png" alt="防波堤手记" class="brush-image" />
          </div>
          <div class="hero-text">
            <h2 class="hero-quote">以我之身躯为阶梯,以我之身躯为樊篱</h2>
            <p class="hero-subtitle">捶打我天然的沉默 / 切割我卑微与困惑</p>
          </div>
        </div>
      </div>
    </section>

    <section class="articles-section">
      <div class="container">
        <h2 class="section-title">文章</h2>

        <div class="tags-row" v-if="tags && tags.length > 0">
          <span class="tag-label">主题</span>
          <div class="tags-list">
            <span v-for="(tag, index) in tags" :key="index" @click="filterByTag(tag._id)" class="tag"
              :class="{ 'active': selectedTag === tag._id }">
              {{ tag.name }}
            </span>
          </div>
        </div>

        <div v-if="loading" class="loading">
          <!-- 加载动画由CSS提供 -->
        </div>

        <div v-else-if="articles.length === 0" class="empty-state">
          <p>暂无文章</p>
          <div class="action-btns">
            <router-link to="/new-article" v-if="isAuthenticated" class="btn">写文章</router-link>
          </div>
        </div>

        <div v-else class="articles-grid">
          <div v-for="(article, index) in articles" :key="index" class="article-card" @click="viewArticle(article.id)">
            <div class="article-inner">
              <div class="article-thumbnail" v-if="article.cover_image">
                <img :src="article.cover_image" :alt="article.title" class="thumbnail-img" @error="handleImageError"
                  @load="handleImageLoad(article)">
              </div>
              <div class="article-content-wrapper">
                <div class="article-header">
                  <h3 class="article-title">{{ article.title }}</h3>
                  <div class="article-meta">
                    <span class="article-date">{{ formatDate(article.created_at) }}</span>
                    <span class="article-author">{{ getAuthorName(article) }}</span>
                  </div>
                </div>

                <p class="article-excerpt">{{ truncateContent(article.content) }}</p>

                <div class="article-footer">
                  <div class="article-tags" v-if="article.tags && article.tags.length > 0">
                    <span v-for="(tag, tagIndex) in article.tags" :key="tagIndex" class="mini-tag"
                      @click.stop="filterByTag(tag)">
                      {{ tag }}
                    </span>
                  </div>
                  <div class="article-stats">
                    <span class="stat-item">{{ article.views_count || 0 }} 阅读</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

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
    </section>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'HomeView',
  data() {
    return {
      articles: [],
      tags: [],
      selectedTag: null,
      loading: true,
      currentPage: 1,
      limit: 6,
      totalArticles: 0
    }
  },
  computed: {
    ...mapGetters(['isAuthenticated']),
    totalPages() {
      return Math.ceil(this.totalArticles / this.limit)
    }
  },
  methods: {
    async getArticles() {
      this.loading = true;
      try {
        // 使用Vuex store获取文章
        const storeArticles = await this.$store.dispatch('fetchArticles');
        console.log('Fetched articles:', storeArticles); // 添加调试日志

        // 确保 storeArticles 是数组
        if (!Array.isArray(storeArticles)) {
          console.error('获取到的文章不是数组格式:', storeArticles);
          this.articles = [];
          return;
        }

        // 手动处理分页和标签过滤
        let filteredArticles = [...storeArticles];

        // 如果有选中的标签，进行过滤
        if (this.selectedTag) {
          filteredArticles = filteredArticles.filter(article =>
            article.tags && article.tags.includes(this.selectedTag)
          );
        }

        this.totalArticles = filteredArticles.length;

        // 计算当前页显示的文章
        const startIndex = (this.currentPage - 1) * this.limit;
        const endIndex = startIndex + this.limit;
        this.articles = filteredArticles.slice(startIndex, endIndex);

      } catch (error) {
        console.error('获取文章列表失败:', error);
        this.articles = [];
      } finally {
        this.loading = false;
      }
    },

    async getTags() {
      try {
        // 从所有文章中提取标签
        const storeArticles = await this.$store.dispatch('fetchArticles');
        console.log('Fetched articles for tags:', storeArticles); // 添加调试日志

        if (!Array.isArray(storeArticles)) {
          console.error('获取到的文章不是数组格式:', storeArticles);
          this.tags = [];
          return;
        }

        // 从文章中收集所有不重复的标签
        const tagSet = new Set();
        storeArticles.forEach(article => {
          if (article.tags && Array.isArray(article.tags)) {
            article.tags.forEach(tag => tagSet.add(tag));
          }
        });

        // 转换为标签对象数组
        this.tags = Array.from(tagSet).map((tagName) => ({
          _id: tagName,
          name: tagName
        }));
      } catch (error) {
        console.error('获取标签失败:', error);
        this.tags = [];
      }
    },

    filterByTag(tagId) {
      if (this.selectedTag === tagId) {
        this.selectedTag = null;
      } else {
        this.selectedTag = tagId;
      }
      this.currentPage = 1;
      this.getArticles();
    },

    viewArticle(id) {
      this.$router.push(`/article/${id}`);
    },

    changePage(page) {
      if (page < 1 || page > this.totalPages) return;
      this.currentPage = page;
      this.getArticles();
      window.scrollTo(0, 0);
    },

    truncateContent(content) {
      if (!content) return '';
      // 移除HTML标签
      const textContent = content.replace(/<[^>]*>/g, '');
      return textContent.length > 120 ? textContent.substring(0, 120) + '...' : textContent;
    },

    formatDate(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}.${month}.${day}`;
    },

    getAuthorName(article) {
      if (!article) return '';
      if (typeof article.author === 'string') return article.author;
      if (article.author && article.author.username) return article.author.username;
      return '张鑫';
    },

    refreshArticles() {
      this.getArticles();
      this.getTags();
    },

    handleImageError(e) {
      console.error('Image load error:', e.target.src);
      e.target.style.display = 'none';
      e.target.parentElement.style.display = 'none';
    },

    handleImageLoad(article) {
      console.log('Image loaded successfully for article:', {
        id: article.id,
        title: article.title,
        imageLength: article.cover_image ? article.cover_image.length : 0
      });
    }
  },
  created() {
    this.getArticles();
    this.getTags();

    // 监听全局事件：文章创建后刷新页面
    this.$root.$on('article-created', this.refreshArticles);
  },
  /* eslint-disable vue/no-deprecated-destroyed-lifecycle */
  destroyed() {
    // 移除事件监听
    this.$root.$off('article-created', this.refreshArticles);
  },
  /* eslint-enable vue/no-deprecated-destroyed-lifecycle */
  watch: {
    $route() {
      this.getArticles();
    }
  }
}
</script>

<style scoped>
.home-view {
  padding-bottom: var(--spacing-xl);
}

/* 英雄区域 */
.hero-section {


  position: relative;

}

.hero-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-lg) 0;
}

.brush-image-container {
  width: 100%;
  max-width: 500px;
  margin-bottom: var(--spacing-md);
  opacity: 0.85;
}

.brush-image {
  width: 100%;
  height: auto;
}

.hero-text {
  text-align: center;
  margin-top: var(--spacing-md);
}

.hero-quote {
  font-family: 'Ma Shan Zheng', cursive;
  font-size: 2.2rem;
  margin-bottom: var(--spacing-sm);
  font-weight: normal;
  letter-spacing: 0.1em;
}

.hero-subtitle {
  font-size: 1.1rem;
  opacity: 0.8;
  font-family: 'Noto Serif SC', serif;
  letter-spacing: 0.05em;
}

/* 文章区域 */
.section-title {
  text-align: center;
  margin-bottom: var(--spacing-lg);
  position: relative;
}

.section-title::after {
  content: "";
  display: block;
  width: 60px;
  height: 2px;
  background: rgba(255, 255, 255, 0.3);
  margin: var(--spacing-sm) auto 0;
}

.tags-row {
  display: flex;
  align-items: center;
  margin-bottom: var(--spacing-lg);
  flex-wrap: wrap;
  justify-content: center;
}

.tag-label {
  margin-right: var(--spacing-md);
  font-family: 'Ma Shan Zheng', cursive;
  font-size: 1.2rem;
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-xs);
}

.tag {
  background-color: rgba(0, 0, 0, 0.2);
  padding: 0.3em 0.8em;
  border-radius: 2px;
  cursor: pointer;
  transition: var(--transition);
  font-size: 0.9rem;
}

.tag:hover,
.tag.active {
  background-color: rgba(255, 255, 255, 0.1);
}

/* 文章卡片 */
.articles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
}

.article-card {
  background-color: rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.05);
  cursor: pointer;
  transition: var(--transition);
  height: 100%;
}

.article-inner {
  display: flex;
  flex-direction: row;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 4px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  overflow: hidden;
}

.article-thumbnail {
  flex: 0 0 200px;
  height: auto;
  overflow: hidden;
  position: relative;
  background-color: rgba(0, 0, 0, 0.1);
}

.thumbnail-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.article-card:hover .thumbnail-img {
  transform: scale(1.05);
}

.article-content-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 1.5rem;
  min-width: 0;
  /* 防止文字溢出 */
}

.article-header {
  margin-bottom: 1rem;
}

.article-title {
  font-family: 'Ma Shan Zheng', cursive;
  font-size: 1.5rem;
  margin-bottom: 0.8rem;
  font-weight: normal;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.article-meta {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
  font-size: 0.85rem;
  opacity: 0.7;
}

.article-excerpt {
  margin-bottom: 1rem;
  line-height: 1.6;
  opacity: 0.9;
  flex-grow: 1;
  font-size: 0.95rem;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}

.article-footer {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-top: auto;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.article-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.mini-tag {
  font-size: 0.8rem;
  padding: 0.2em 0.5em;
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 2px;
}

.article-stats {
  display: flex;
  gap: var(--spacing-sm);
  font-size: 0.8rem;
  opacity: 0.7;
}

/* 分页 */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: var(--spacing-lg);
}

.page-btn {
  background: rgba(0, 0, 0, 0.2);
  color: white;
  border: none;
  padding: 0.5em 1em;
  margin: 0 var(--spacing-sm);
  cursor: pointer;
  transition: var(--transition);
  font-family: 'Ma Shan Zheng', cursive;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-btn:not(:disabled):hover {
  background: rgba(255, 255, 255, 0.1);
}

.page-info {
  margin: 0 var(--spacing-sm);
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: var(--spacing-xl) 0;
}

.empty-state p {
  margin-bottom: var(--spacing-md);
  font-size: 1.2rem;
}

.action-btns {
  text-align: center;
  margin-bottom: var(--spacing-lg);
}

.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  position: relative;
}

.loading::after {
  content: "";
  display: block;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 3px solid rgba(255, 255, 255, 0.1);
  border-top-color: rgba(255, 255, 255, 0.7);
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 768px) {
  .hero-quote {
    font-size: 1.8rem;
  }

  .hero-subtitle {
    font-size: 1rem;
  }

  .articles-grid {
    grid-template-columns: 1fr;
  }

  .article-inner {
    flex-direction: column;
  }

  .article-thumbnail {
    flex: 0 0 180px;
    width: 100%;
  }

  .article-content-wrapper {
    min-height: auto;
  }

  .article-title {
    font-size: 1.3rem;
  }

  .article-excerpt {
    font-size: 0.9rem;
  }
}
</style>