<template>
  <div class="article-detail-view">
    <div class="container">
      <div v-if="loading" class="loading-container">
        <div class="loading-spinner"></div>
        <p>文章加载中...</p>
      </div>

      <div v-else-if="!article" class="article-not-found">
        <h2>文章不存在或已被删除</h2>
        <router-link to="/" class="btn">返回首页</router-link>
      </div>

      <template v-else>
        <article class="article">
          <div class="article-inner">
            <div class="article-header">
              <h3 class="article-title">{{ article.title }}</h3>
              <div class="article-meta">
                <span class="article-date">{{ formatDate(article.created_at) }}</span>
                <span class="article-author">{{ getAuthorName(article) }}</span>
              </div>
            </div>

            <div class="article-tags" v-if="article.tags && article.tags.length > 0">
              <router-link v-for="tag in article.tags" :key="tag.id || tag" :to="`/?tag=${tag.id || tag}`" class="tag">
                {{ typeof tag === 'string' ? tag : tag.name }}
              </router-link>
            </div>

            <div class="decorative-line"></div>
          </div>

          <!-- 添加封面图片显示 -->
          <div class="article-cover" v-if="article.cover_image">
            <img :src="article.cover_image" alt="文章封面" class="cover-image">
          </div>

          <div class="article-content" v-html="article.content"></div>

          <div class="article-footer">
            <div class="decorative-line"></div>
          </div>
        </article>

        <div class="related-articles" v-if="relatedArticles.length > 0">
          <h2 class="section-title">相关<span class="accent">文章</span></h2>
          <div class="related-grid">
            <div v-for="article in relatedArticles" :key="article.id || article._id"
              @click="viewArticle(article.id || article._id)" class="related-article-card">
              <h3 class="related-article-title">{{ article.title }}</h3>
              <div class="related-article-meta">
                <span class="date">{{ formatDate(article.created_at || article.createdAt) }}</span>
                <span class="views"><span class="icon">👁</span> {{ article.views_count || article.views || 0 }}</span>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ArticleDetailView',
  data() {
    return {
      article: null,
      relatedArticles: [],
      loading: true
    }
  },
  methods: {
    async fetchArticle() {
      this.loading = true;
      try {
        const articleId = this.$route.params.id;

        // 使用Vuex store获取文章详情，而不是直接调用API
        this.article = await this.$store.dispatch('fetchArticleById', articleId);

        if (!this.article) {
          console.error('文章不存在或获取失败');
          return;
        }

        this.fetchRelatedArticles();
      } catch (error) {
        console.error('获取文章详情失败:', error);
      } finally {
        this.loading = false;
      }
    },

    async fetchRelatedArticles() {
      if (!this.article) return;

      try {
        // 使用Vuex store获取所有文章，然后根据标签过滤相关文章
        const allArticles = await this.$store.dispatch('fetchArticles');

        // 排除当前文章
        let filteredArticles = allArticles.filter(a => a.id !== this.article.id);

        // 如果有标签，则按标签过滤
        if (this.article.tags && this.article.tags.length > 0) {
          // 查找至少有一个标签匹配的文章
          filteredArticles = filteredArticles.filter(article =>
            article.tags && article.tags.some(tag =>
              this.article.tags.includes(tag)
            )
          );
        }

        // 限制为最多3篇文章
        this.relatedArticles = filteredArticles.slice(0, 3);
      } catch (error) {
        console.error('获取相关文章失败:', error);
        this.relatedArticles = [];
      }
    },

    formatDate(dateString) {
      const date = new Date(dateString)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}.${month}.${day}`
    },

    viewArticle(id) {
      // 确保ID存在，避免使用undefined作为路由参数
      if (id) {
        this.$router.push(`/article/${id}`);
      } else {
        console.error('文章ID不存在，无法查看文章');
      }
    },

    getAuthorName(article) {
      if (!article) return '';
      if (typeof article.author === 'string') return article.author;
      if (article.author && article.author.nickname) return article.author.nickname;
      if (article.author && article.author.username) return article.author.username;
      return '张鑫';
    },

  },
  created() {
    this.fetchArticle()
  },
  watch: {
    $route(to, from) {
      if (to.params.id !== from.params.id) {
        this.fetchArticle()
      }
    }
  }
}
</script>

<style scoped>
.article-detail-view {
  padding-bottom: var(--spacing-xl);
}

.loading-container {
  text-align: center;
  padding: var(--spacing-xl) 0;
}

.loading-spinner {
  display: inline-block;
  width: 40px;
  height: 40px;
  border: 3px solid rgba(97, 85, 71, 0.2);
  border-radius: 50%;
  border-top-color: rgba(255, 255, 255, 0.8);
  animation: spin 1s ease-in-out infinite;
  margin-bottom: var(--spacing-sm);
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.article-not-found {
  text-align: center;
  padding: var(--spacing-xl) 0;
}

/* 文章样式 */
.article {
  background-color: rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.05);
  padding: var(--spacing-xl);
  position: relative;
}

.article-inner {
  margin-bottom: var(--spacing-xl);
  position: relative;
}

.article-title {
  font-family: 'Ma Shan Zheng', cursive;
  font-size: 2.8rem;
  font-weight: normal;
  line-height: 1.3;
  margin-bottom: var(--spacing-lg);
  letter-spacing: 0.05em;
  text-align: center;
}

.decorative-line {
  height: 1px;
  background: linear-gradient(to right, transparent, rgba(255, 255, 255, 0.2), transparent);
  margin: var(--spacing-md) 0;
}

.article-meta {
  display: flex;
  justify-content: space-between;
  margin-bottom: var(--spacing-md);
  opacity: 0.8;
}

.meta-left {
  display: flex;
  gap: var(--spacing-md);
  font-family: 'Noto Serif SC', serif;
}

.author {
  font-weight: 500;
}

.article-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-xs);
  margin-bottom: var(--spacing-md);
  justify-content: center;
}

.tag {
  padding: 0.3em 0.8em;
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 2px;
  font-size: 0.9rem;
  text-decoration: none;
  transition: var(--transition);
}

.tag:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.article-cover {
  margin: 1.5rem 0;
  text-align: center;
  overflow: hidden;
  border-radius: 8px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.cover-image {
  max-width: 100%;
  height: auto;
  display: block;
  margin: 0 auto;
}

.article-content {
  font-size: 1.1rem;
  line-height: 1.8;
  letter-spacing: 0.02em;
}

.article-content :deep(p) {
  margin-bottom: 1.5em;
}

.article-content :deep(h2),
.article-content :deep(h3) {
  font-family: 'Ma Shan Zheng', cursive;
  margin-top: 1.5em;
  margin-bottom: 0.75em;
  font-weight: normal;
  text-align: center;
}

.article-content :deep(h2) {
  font-size: 2rem;
  position: relative;
}

.article-content :deep(h2)::after {
  content: "";
  display: block;
  width: 60px;
  height: 1px;
  background: rgba(255, 255, 255, 0.3);
  margin: 0.5rem auto 0;
}

.article-content :deep(h3) {
  font-size: 1.6rem;
}

.article-content :deep(ul),
.article-content :deep(ol) {
  margin-bottom: 1.5em;
  padding-left: 2em;
}

.article-content :deep(li) {
  margin-bottom: 0.5em;
}

.article-content :deep(blockquote) {
  margin: 2em 0;
  padding: 1em 1.5em;
  border-left: 2px solid rgba(255, 255, 255, 0.3);
  background-color: rgba(0, 0, 0, 0.2);
  font-style: italic;
}

.article-content :deep(pre) {
  background-color: var(--color-black);
  color: #f8f8f2;
  padding: 1.5em;
  border-radius: 2px;
  overflow-x: auto;
  margin: 1.5em 0;
}

.article-content :deep(code) {
  font-family: 'Space Mono', monospace;
  font-size: 0.9em;
}

.article-content :deep(img) {
  max-width: 100%;
  height: auto;
  margin: 1.5em 0;
  opacity: 0.9;
}

.article-footer {
  margin-top: var(--spacing-xl);
}

.article-actions {
  display: flex;
  gap: var(--spacing-md);
  margin-top: var(--spacing-lg);
  justify-content: center;
}

.edit-btn,
.delete-btn {
  background-color: var(--color-black);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.delete-btn {
  color: #ff6b6b;
}

/* 相关文章 */
.related-articles {
  margin-top: var(--spacing-xl);
}

.related-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-md);
}

.related-article-card {
  background-color: rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.05);
  padding: var(--spacing-md);
  transition: var(--transition);
  cursor: pointer;
}

.related-article-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  background-color: rgba(0, 0, 0, 0.25);
}

.related-article-title {
  font-family: 'Ma Shan Zheng', cursive;
  font-size: 1.3rem;
  font-weight: normal;
  margin-bottom: var(--spacing-sm);
  line-height: 1.4;
}

.related-article-meta {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  opacity: 0.7;
}

/* 删除确认对话框 */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background-color: var(--color-brown);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: var(--spacing-lg);
  max-width: 400px;
  width: 100%;
}

.modal-content h3 {
  margin-top: 0;
  margin-bottom: var(--spacing-md);
  font-family: 'Ma Shan Zheng', cursive;
  font-weight: normal;
  text-align: center;
}

.modal-actions {
  display: flex;
  justify-content: center;
  gap: var(--spacing-md);
  margin-top: var(--spacing-lg);
}

.cancel-btn {
  background-color: rgba(0, 0, 0, 0.3);
}

.confirm-delete-btn {
  background-color: var(--color-black);
  color: #ff6b6b;
}

/* 响应式样式 */
@media (max-width: 768px) {
  .article {
    padding: var(--spacing-lg);
  }

  .article-title {
    font-size: 2rem;
  }

  .related-grid {
    grid-template-columns: 1fr;
  }

  .article-actions {
    flex-direction: column;
  }
}
</style>