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

            <div class="article-actions" v-if="canModify">
              <router-link :to="`/edit-article/${article.id}`" class="btn edit-btn">
                编辑文章
              </router-link>
              <button @click="showDeleteConfirm = true" class="btn delete-btn">
                删除文章
              </button>
            </div>
          </div>
        </article>

        <!-- 评论区域 -->
        <div class="comments-section">
          <h2 class="comments-title">评论区</h2>

          <!-- 评论输入框 -->
          <div v-if="isAuthenticated" class="comment-form">
            <textarea v-model="newComment" placeholder="写下你的评论..." class="comment-input"
              :class="{ 'has-error': commentError }"></textarea>
            <div v-if="commentError" class="error-message">{{ commentError }}</div>
            <button @click="submitComment" class="submit-comment-btn" :disabled="isSubmitting">
              {{ isSubmitting ? '发送中...' : '发表评论' }}
            </button>
          </div>

          <!-- 未登录提示 -->
          <div v-else class="not-logged-in">
            需要 <router-link to="/login">登录</router-link> 后才能发表评论
          </div>

          <!-- 评论列表 -->
          <div class="comments-list" v-if="article.comments && article.comments.length > 0">
            <div v-for="comment in article.comments" :key="comment.id" class="comment-card">
              <div class="comment-header">
                <span class="comment-author">{{ comment.username }}</span>
                <span class="comment-date">{{ formatDate(comment.created_at) }}</span>
              </div>
              <div class="comment-content">{{ comment.content }}</div>
              <div class="comment-actions" v-if="canDeleteComment(comment)">
                <button @click="deleteComment(comment.id)" class="delete-comment-btn">删除</button>
              </div>
            </div>
          </div>

          <!-- 无评论提示 -->
          <div v-else class="no-comments">
            暂无评论，来说两句吧~
          </div>
        </div>

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

      <!-- 删除确认对话框 -->
      <div class="modal" v-if="showDeleteConfirm">
        <div class="modal-content">
          <h3>确认删除</h3>
          <p>确定要删除这篇文章吗？此操作不可撤销。</p>
          <div class="modal-actions">
            <button @click="showDeleteConfirm = false" class="btn cancel-btn">取消</button>
            <button @click="deleteArticle" class="btn confirm-delete-btn">确认删除</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'ArticleDetailView',
  data() {
    return {
      article: null,
      relatedArticles: [],
      loading: true,
      showDeleteConfirm: false,
      newComment: '',
      commentError: null,
      isSubmitting: false
    }
  },
  computed: {
    ...mapGetters(['isAuthenticated', 'currentUser']),

    canModify() {
      if (!this.isAuthenticated || !this.article) return false
      // 判断是否是文章作者或管理员
      return (this.currentUser && this.article.author && this.currentUser.id === this.article.author.id) ||
        (this.currentUser && this.currentUser.role === 'admin')
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

    async deleteArticle() {
      try {
        // 首先确认文章ID存在
        if (!this.article || !this.article.id) {
          console.error('文章ID不存在，无法删除文章');
          this.showDeleteConfirm = false;
          return;
        }

        try {
          await this.$axios.delete(`/articles/${this.article.id}`);
        } catch (apiError) {
          console.error('API删除文章失败，将直接通过Vuex删除:', apiError);
          // 通过Vuex删除文章
          await this.$store.dispatch('deleteArticle', this.article.id);
        }

        this.$router.push('/');
      } catch (error) {
        console.error('删除文章失败:', error);
      } finally {
        this.showDeleteConfirm = false;
      }
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

    async submitComment() {
      if (!this.newComment.trim()) {
        this.commentError = '评论内容不能为空';
        return;
      }

      this.isSubmitting = true;
      this.commentError = null;

      try {
        const response = await this.$axios.post(`/articles/${this.article.id}/comments`, {
          content: this.newComment.trim()
        });

        // 将新评论添加到评论列表
        if (!this.article.comments) {
          this.article.comments = [];
        }
        this.article.comments.unshift(response.data);
        this.newComment = '';
      } catch (error) {
        console.error('发表评论失败:', error);
        this.commentError = error.response?.data?.message || '发表评论失败，请稍后重试';
      } finally {
        this.isSubmitting = false;
      }
    },

    canDeleteComment(comment) {
      if (!this.isAuthenticated || !this.currentUser) return false;
      // 如果是管理员，可以删除任何评论
      if (this.currentUser.role === 'admin') return true;
      // 普通用户只能删除自己的评论
      return this.currentUser.id === comment.user_id;
    },

    async deleteComment(commentId) {
      if (!confirm('确定要删除这条评论吗？')) return;

      try {
        await this.$axios.delete(`/articles/${this.article.id}/comments/${commentId}`);
        this.article.comments = this.article.comments.filter(c => c.id !== commentId);
      } catch (error) {
        console.error('删除评论失败:', error);
        alert(error.response?.data?.message || '删除评论失败，请稍后重试');
      }
    }
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

/* 评论区样式 */
.comments-section {
  margin-top: var(--spacing-xl);
  background-color: rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.05);
  padding: var(--spacing-xl);
}

.comments-title {
  font-family: 'Ma Shan Zheng', cursive;
  font-size: 2rem;
  font-weight: normal;
  margin-bottom: var(--spacing-lg);
  text-align: center;
}

.comment-form {
  margin-bottom: var(--spacing-xl);
}

.comment-input {
  width: 100%;
  min-height: 100px;
  padding: var(--spacing-md);
  background-color: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.9);
  font-size: 1rem;
  resize: vertical;
  margin-bottom: var(--spacing-sm);
  transition: all 0.3s ease;
}

.comment-input:focus {
  outline: none;
  border-color: rgba(255, 255, 255, 0.3);
  background-color: rgba(0, 0, 0, 0.3);
}

.comment-input.has-error {
  border-color: #ff6b6b;
}

.submit-comment-btn {
  padding: 0.7rem 1.5rem;
  background-color: var(--color-black);
  color: var(--color-light);
  border: 1px solid rgba(255, 255, 255, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: 'Noto Serif SC', serif;
}

.submit-comment-btn:hover:not(:disabled) {
  background-color: rgba(0, 0, 0, 0.8);
}

.submit-comment-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.error-message {
  color: #ff6b6b;
  font-size: 0.9rem;
  margin-bottom: var(--spacing-sm);
}

.not-logged-in {
  text-align: center;
  padding: var(--spacing-md);
  background-color: rgba(0, 0, 0, 0.2);
  margin-bottom: var(--spacing-lg);
}

.not-logged-in a {
  color: rgba(255, 255, 255, 0.9);
  text-decoration: underline;
  font-weight: 500;
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.comment-card {
  background-color: rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.05);
  padding: var(--spacing-md);
}

.comment-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: var(--spacing-sm);
  font-size: 0.9rem;
}

.comment-author {
  font-weight: 500;
}

.comment-date {
  opacity: 0.7;
}

.comment-content {
  line-height: 1.6;
  margin-bottom: var(--spacing-sm);
  letter-spacing: 0.01em;
}

.comment-actions {
  display: flex;
  justify-content: flex-end;
}

.delete-comment-btn {
  background: none;
  border: none;
  color: #ff6b6b;
  cursor: pointer;
  font-size: 0.85rem;
  padding: 0;
  opacity: 0.8;
}

.delete-comment-btn:hover {
  opacity: 1;
}

.no-comments {
  text-align: center;
  padding: var(--spacing-lg);
  background-color: rgba(0, 0, 0, 0.2);
  opacity: 0.8;
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