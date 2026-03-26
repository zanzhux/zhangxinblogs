<template>
  <div class="archives-view">
    <div class="container">
      <div class="section-header">
        <h1 class="page-title">归档</h1>
        <div class="decorative-line"></div>
      </div>
      
      <div class="archives-content">
        <div class="loading-container" v-if="loading">
          <div class="loading-spinner"></div>
          <p>正在加载归档...</p>
        </div>
        
        <div v-else class="archives-timeline">
          <div v-for="(yearGroup, year) in groupedArticles" :key="year" class="year-section">
            <div class="year-header">
              <h2 class="year">{{ year }}</h2>
              <div class="year-count">{{ yearGroup.length }} 篇文章</div>
            </div>
            
            <div class="month-sections">
              <div v-for="(monthGroup, month) in groupByMonth(yearGroup)" :key="`${year}-${month}`" class="month-section">
                <h3 class="month">{{ getMonthName(month) }}</h3>
                
                <ul class="article-list">
                  <li v-for="article in monthGroup" :key="`${year}-${month}-${article.id}`" class="article-item">
                    <div class="article-date">{{ formatDay(article.date) }}</div>
                    <div class="article-title">
                      <router-link :to="{ name: 'article-detail', params: { id: article.id } }">
                        {{ article.title }}
                      </router-link>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          
          <div v-if="Object.keys(groupedArticles).length === 0" class="no-articles">
            <p>暂无文章</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ArchivesView',
  data() {
    return {
      articles: [],
      loading: true
    }
  },
  computed: {
    groupedArticles() {
      // 按年份分组
      const grouped = {};
      this.articles.forEach(article => {
        const date = new Date(article.date);
        const year = date.getFullYear();
        
        if (!grouped[year]) {
          grouped[year] = [];
        }
        
        grouped[year].push(article);
      });
      
      // 按年份降序排序
      const sortedGroups = {};
      Object.keys(grouped)
        .sort((a, b) => b - a) // 降序排序年份
        .forEach(year => {
          sortedGroups[year] = grouped[year];
        });
      
      return sortedGroups;
    }
  },
  created() {
    this.fetchArticles();
    
    // 监听全局事件
    this.$root.$on('article-created', this.fetchArticles);
  },
  /* eslint-disable vue/no-deprecated-destroyed-lifecycle */
  destroyed() {
    // 移除事件监听
    this.$root.$off('article-created', this.fetchArticles);
  },
  /* eslint-enable vue/no-deprecated-destroyed-lifecycle */
  methods: {
    async fetchArticles() {
      this.loading = true;
      try {
        // 从Vuex store获取所有文章
        const storeArticles = await this.$store.dispatch('fetchArticles');
        
        // 转换为适合归档的格式
        this.articles = storeArticles.map(article => ({
          id: article.id,
          title: article.title,
          date: article.created_at
        }));
        
        // 如果没有文章，使用一些假数据作为示例
        if (this.articles.length === 0) {
          this.articles = [
            { id: 1, title: '《乐队的夏天》第三季回顾：中国摇滚的现状与未来', date: '2023-12-15' },
            { id: 2, title: '探访成都小酒馆：一座城市的音乐记忆', date: '2023-11-28' },
            { id: 3, title: '后摇滚时代的思考：音乐如何表达当代情感', date: '2023-10-17' }
          ];
        }
      } catch (error) {
        console.error('获取文章失败:', error);
        this.articles = [];
      } finally {
        this.loading = false;
      }
    },
    groupByMonth(articles) {
      // 按月份分组
      const grouped = {};
      articles.forEach(article => {
        const date = new Date(article.date);
        const month = date.getMonth() + 1; // getMonth()返回0-11
        
        if (!grouped[month]) {
          grouped[month] = [];
        }
        
        grouped[month].push(article);
      });
      
      // 按月份降序排序
      const sortedGroups = {};
      Object.keys(grouped)
        .sort((a, b) => b - a) // 降序排序月份
        .forEach(month => {
          sortedGroups[month] = grouped[month].sort((a, b) => 
            new Date(b.date) - new Date(a.date) // 按日期降序排序文章
          );
        });
      
      return sortedGroups;
    },
    getMonthName(month) {
      const monthNames = {
        '1': '一月',
        '2': '二月',
        '3': '三月',
        '4': '四月',
        '5': '五月',
        '6': '六月',
        '7': '七月',
        '8': '八月',
        '9': '九月',
        '10': '十月',
        '11': '十一月',
        '12': '十二月'
      };
      
      return monthNames[month];
    },
    formatDay(dateString) {
      const date = new Date(dateString);
      return date.getDate().toString().padStart(2, '0');
    }
  }
}
</script>

<style scoped>
.archives-view {
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

.archives-content {
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
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.archives-timeline {
  position: relative;
}

.archives-timeline::before {
  content: "";
  position: absolute;
  top: 0;
  bottom: 0;
  left: 100px;
  width: 1px;
  background: linear-gradient(to bottom, 
    rgba(255, 255, 255, 0),
    rgba(255, 255, 255, 0.1) 5%, 
    rgba(255, 255, 255, 0.1) 95%, 
    rgba(255, 255, 255, 0)
  );
}

.year-section {
  margin-bottom: var(--spacing-xl);
  position: relative;
}

.year-header {
  display: flex;
  align-items: center;
  margin-bottom: var(--spacing-lg);
  position: relative;
}

.year {
  font-family: 'Ma Shan Zheng', cursive;
  font-size: 2.2rem;
  margin: 0;
  color: var(--color-light);
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.3);
  width: 100px;
  text-align: right;
  padding-right: var(--spacing-lg);
  position: relative;
}

.year::after {
  content: "";
  position: absolute;
  top: 50%;
  right: 20px;
  width: 12px;
  height: 12px;
  background-color: var(--color-black);
  border: 2px solid rgba(255, 255, 255, 0.7);
  border-radius: 50%;
  transform: translateY(-50%);
  z-index: 1;
}

.year-count {
  margin-left: var(--spacing-xl);
  font-size: 0.9rem;
  opacity: 0.7;
}

.month-sections {
  margin-left: 120px;
}

.month-section {
  margin-bottom: var(--spacing-lg);
}

.month {
  font-family: 'Ma Shan Zheng', cursive;
  font-size: 1.5rem;
  margin-bottom: var(--spacing-md);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  padding-bottom: var(--spacing-sm);
}

.article-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.article-item {
  display: flex;
  margin-bottom: var(--spacing-md);
  padding-bottom: var(--spacing-sm);
  border-bottom: 1px dashed rgba(255, 255, 255, 0.05);
}

.article-date {
  flex: 0 0 40px;
  font-family: monospace;
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.7);
  text-align: center;
  margin-right: var(--spacing-md);
  font-weight: bold;
}

.article-title {
  flex: 1;
}

.article-title a {
  color: var(--color-light);
  text-decoration: none;
  transition: all 0.3s ease;
  line-height: 1.5;
}

.article-title a:hover {
  color: white;
  text-shadow: 0 0 5px rgba(255, 255, 255, 0.3);
  padding-left: var(--spacing-sm);
}

.no-articles {
  text-align: center;
  padding: var(--spacing-xl);
  font-style: italic;
  opacity: 0.7;
}

@media (max-width: 768px) {
  .archives-timeline::before {
    left: 20px;
  }
  
  .year {
    width: 60px;
    font-size: 1.8rem;
    padding-right: var(--spacing-md);
  }
  
  .year::after {
    right: 10px;
    width: 10px;
    height: 10px;
  }
  
  .month-sections {
    margin-left: 40px;
  }
  
  .article-date {
    flex: 0 0 30px;
    font-size: 1rem;
    margin-right: var(--spacing-sm);
  }
}
</style> 