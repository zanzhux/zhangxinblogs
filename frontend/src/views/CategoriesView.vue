<template>
  <div class="categories-view">
    <div class="container">
      <div class="section-header">
        <h1 class="page-title">分类浏览</h1>
        <div class="decorative-line"></div>
      </div>

      <div class="categories-content">
        <div class="loading-container" v-if="loading">
          <div class="loading-spinner"></div>
          <p>正在加载分类...</p>
        </div>

        <div v-else class="categories-grid">
          <div v-for="category in categories" :key="category.id" class="category-card">
            <router-link :to="{ name: 'articles-by-category', params: { categoryId: category.id } }">
              <div class="category-icon" :style="{ backgroundColor: getCategoryColor(category.name) }">
                {{ getCategoryIcon(category.name) }}
              </div>
              <h2 class="category-name">{{ category.name }}</h2>
              <p class="article-count">{{ category.articleCount }} 篇文章</p>
            </router-link>
          </div>
        </div>

        <div v-if="!loading && categories.length === 0" class="no-categories">
          <p>暂无分类</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CategoriesView',
  data() {
    return {
      categories: [],
      loading: true,
      // 预定义的所有分类
      predefinedCategories: [
        { id: '摇滚音乐', name: '摇滚音乐' },
        { id: '文学', name: '文学' },
        { id: '电影', name: '电影' },
        { id: '旅行', name: '旅行' },
        { id: '摄影', name: '摄影' },
        { id: '生活随笔', name: '生活随笔' },
        { id: '艺术', name: '艺术' },
        { id: '哲学', name: '哲学' }
      ]
    }
  },
  created() {
    this.fetchCategories();

    // 监听全局事件
    this.$root.$on('article-created', this.fetchCategories);
  },
  /* eslint-disable vue/no-deprecated-destroyed-lifecycle */
  destroyed() {
    // 移除事件监听
    this.$root.$off('article-created', this.fetchCategories);
  },
  /* eslint-enable vue/no-deprecated-destroyed-lifecycle */
  methods: {
    async fetchCategories() {
      try {
        this.loading = true;

        // 获取所有文章
        const articles = await this.$store.dispatch('fetchArticles');
        
        // 统计每个分类的文章数量
        const categoryCounts = {};
        if (Array.isArray(articles)) {
          articles.forEach(article => {
            if (article.tags && Array.isArray(article.tags)) {
              article.tags.forEach(tag => {
                categoryCounts[tag] = (categoryCounts[tag] || 0) + 1;
              });
            }
          });
        }

        // 将文章数量添加到预定义分类中
        this.categories = this.predefinedCategories.map(category => ({
          ...category,
          articleCount: categoryCounts[category.id] || 0
        }));

      } catch (error) {
        console.error('获取分类失败:', error);
        // 即使出错也显示所有预定义分类，但文章数量为0
        this.categories = this.predefinedCategories.map(category => ({
          ...category,
          articleCount: 0
        }));
      } finally {
        this.loading = false;
      }
    },
    getCategoryColor(categoryName) {
      // 根据分类名称返回一个颜色
      const colors = {
        '摇滚音乐': 'rgba(192, 57, 43, 0.7)',
        '文学': 'rgba(41, 128, 185, 0.7)',
        '电影': 'rgba(142, 68, 173, 0.7)',
        '旅行': 'rgba(39, 174, 96, 0.7)',
        '摄影': 'rgba(22, 160, 133, 0.7)',
        '生活随笔': 'rgba(243, 156, 18, 0.7)',
        '艺术': 'rgba(211, 84, 0, 0.7)',
        '哲学': 'rgba(52, 73, 94, 0.7)'
      };

      return colors[categoryName] || 'rgba(44, 62, 80, 0.7)';
    },
    getCategoryIcon(categoryName) {
      // 根据分类名称返回一个表情符号
      const icons = {
        '摇滚音乐': '🎸',
        '文学': '📚',
        '电影': '🎬',
        '旅行': '🧳',
        '摄影': '📷',
        '生活随笔': '✒️',
        '艺术': '🎨',
        '哲学': '🧠'
      };

      return icons[categoryName] || '📋';
    }
  }
}
</script>

<style scoped>
.categories-view {
  padding-bottom: var(--spacing-xl);
}

.section-header {
  text-align: center;
  margin-bottom: var(--spacing-xl);
}

.page-title {
  margin-bottom: var(--spacing-sm);
}

.decorative-line {
  height: 1px;
  width: 120px;
  margin: 0 auto;
  background: linear-gradient(to right, transparent, rgba(255, 255, 255, 0.5), transparent);
}

.categories-content {
  max-width: 1200px;
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

.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  grid-gap: var(--spacing-lg);
}

.category-card {
  background-color: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 5px;
  padding: var(--spacing-lg);
  transition: all 0.3s ease;
  text-align: center;
}

.category-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  background-color: rgba(0, 0, 0, 0.3);
}

.category-card a {
  text-decoration: none;
  color: var(--color-light);
  display: block;
}

.category-icon {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  margin: 0 auto var(--spacing-md) auto;
}

.category-name {
  margin: var(--spacing-md) 0;
  font-size: 1.4rem;
  font-family: 'Ma Shan Zheng', cursive;
}

.article-count {
  font-size: 0.9rem;
  opacity: 0.7;
}

.no-categories {
  text-align: center;
  padding: var(--spacing-xl);
  font-style: italic;
  opacity: 0.7;
}

@media (max-width: 768px) {
  .categories-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    grid-gap: var(--spacing-md);
  }

  .category-card {
    padding: var(--spacing-md);
  }
}
</style>