<template>
  <div class="edit-article">
    <div v-if="isLoading" class="loading">
      <p>文章加载中...</p>
    </div>

    <div v-else-if="!article" class="not-found">
      <h2>文章不存在</h2>
      <p>您要编辑的文章不存在或已被删除。</p>
      <router-link to="/" class="btn btn-primary">返回首页</router-link>
    </div>

    <div v-else-if="!isAuthor" class="not-authorized">
      <h2>没有权限</h2>
      <p>您没有权限编辑此文章。</p>
      <router-link :to="`/article/${$route.params.id}`" class="btn btn-primary">返回文章</router-link>
    </div>

    <div v-else class="form-container">
      <h1>编辑文章</h1>

      <div v-if="error" class="alert alert-danger">
        {{ error }}
      </div>

      <form @submit.prevent="updateArticle">
        <div class="form-group">
          <label for="title">标题</label>
          <input type="text" id="title" v-model="title" class="form-control" required placeholder="请输入文章标题">
        </div>

        <div class="form-group">
          <label for="content">内容</label>
          <textarea id="content" v-model="content" class="form-control" rows="15" required
            placeholder="请输入文章内容"></textarea>
        </div>

        <div class="form-actions">
          <button type="button" @click="$router.go(-1)" class="btn btn-secondary">取消</button>
          <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
            {{ isSubmitting ? '保存中...' : '保存文章' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
export default {
  name: 'EditArticleView',
  data() {
    return {
      isLoading: true,
      article: null,
      title: '',
      content: '',
      isSubmitting: false,
      error: null
    }
  },
  computed: {
    currentUser() {
      return this.$store.getters.currentUser;
    },
    isAuthor() {
      return this.article &&
        this.currentUser &&
        (this.article.user_id === this.currentUser.id || this.currentUser.role === 'admin');
    }
  },
  methods: {
    async fetchArticle() {
      try {
        this.isLoading = true;
        console.log('Fetching article with ID:', this.$route.params.id);
        console.log('Current user:', this.currentUser);

        if (!this.$route.params.id) {
          console.error('No article ID provided');
          this.error = '未提供文章ID';
          return;
        }

        const article = await this.$store.dispatch('fetchArticleById', this.$route.params.id);
        console.log('Fetched article:', article);

        if (!article) {
          console.error('Article not found');
          this.article = null;
          return;
        }

        this.article = article;
        this.title = article.title;
        this.content = article.content;
      } catch (error) {
        console.error('Error fetching article:', error);
        this.error = error.response?.data?.message || '加载文章失败';
        this.article = null;
      } finally {
        this.isLoading = false;
      }
    },
    async updateArticle() {
      if (!this.title.trim() || !this.content.trim()) {
        this.error = '标题和内容不能为空';
        return;
      }

      this.isSubmitting = true;
      this.error = null;

      try {
        const updatedArticle = await this.$store.dispatch('updateArticle', {
          id: this.article.id,
          articleData: {
            title: this.title,
            content: this.content,
            cover_image: this.article.cover_image // 保持原有的封面图片
          }
        });

        // 发送全局事件通知其他组件文章已更新
        this.$root.$emit('article-updated', updatedArticle);

        // 显示成功消息
        this.$message = '文章更新成功';

        // 跳转到文章详情页
        this.$router.push(`/article/${this.article.id}`);
      } catch (error) {
        console.error('更新文章失败:', error);
        this.error = error.response?.data?.message || '更新文章失败，请稍后重试';
      } finally {
        this.isSubmitting = false;
      }
    }
  },
  created() {
    this.fetchArticle();
  }
}
</script>

<style scoped>
.edit-article {
  display: flex;
  justify-content: center;
  padding: 2rem 0;
}

.loading,
.not-found,
.not-authorized {
  text-align: center;
  padding: 3rem 1rem;
  color: rgba(255, 255, 255, 0.9);
}

.form-container {
  width: 100%;
  max-width: 800px;
  padding: 2rem;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

h1,
h2 {
  margin-bottom: 2rem;
  color: rgba(255, 255, 255, 0.9);
  font-family: 'Ma Shan Zheng', cursive;
  font-weight: normal;
  text-align: center;
}

.form-group {
  margin-bottom: 1.5rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
}

.form-control {
  width: 100%;
  padding: 0.8rem;
  font-size: 1rem;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.9);
  border-radius: 4px;
  transition: all 0.3s ease;
}

.form-control:focus {
  outline: none;
  border-color: rgba(255, 255, 255, 0.3);
  background: rgba(0, 0, 0, 0.3);
}

textarea {
  resize: vertical;
  min-height: 200px;
}

.form-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 2rem;
}

.btn {
  padding: 0.7rem 1.5rem;
  font-size: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(0, 0, 0, 0.3);
  color: rgba(255, 255, 255, 0.9);
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn:hover {
  background: rgba(0, 0, 0, 0.4);
  border-color: rgba(255, 255, 255, 0.2);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: var(--color-black);
}

.btn-primary:hover {
  background: rgba(0, 0, 0, 0.8);
}

.alert {
  padding: 1rem;
  margin-bottom: 1rem;
  border-radius: 4px;
  text-align: center;
}

.alert-danger {
  background: rgba(255, 59, 48, 0.2);
  border: 1px solid rgba(255, 59, 48, 0.3);
  color: #ff6b6b;
}
</style>