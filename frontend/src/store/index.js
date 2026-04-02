import Vue from 'vue'
import Vuex from 'vuex'
import { defaultArticles, personalAuthor } from '@/data/personalBlogData'

Vue.use(Vuex)

const STORAGE_KEY = 'personal_blog_articles'
const DATA_VERSION = 'v3'  // 每次更新 defaultArticles 时改一下版本号，自动清旧缓存

const loadArticles = () => {
    try {
        if (localStorage.getItem('blog_data_version') !== DATA_VERSION) {
            localStorage.removeItem(STORAGE_KEY)
            localStorage.setItem('blog_data_version', DATA_VERSION)
            return defaultArticles
        }
        const saved = localStorage.getItem(STORAGE_KEY)
        if (saved) return JSON.parse(saved)
    } catch (error) {
        console.error('读取本地文章失败:', error)
    }
    return defaultArticles
}

const saveArticles = (articles) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(articles))
}

export default new Vuex.Store({
    state: {
        token: null,
        user: personalAuthor,
        articles: loadArticles(),
        currentArticle: null,
        loading: false,
        error: null,
        dashboardStats: {
            articleCount: loadArticles().length,
            commentCount: loadArticles().reduce((sum, a) => sum + (a.comments ? a.comments.length : 0), 0),
            viewCount: loadArticles().reduce((sum, a) => sum + (a.views_count || 0), 0)
        }
    },
    getters: {
        isAuthenticated: state => !!state.token,
        authStatus: state => state.status,
        currentUser: state => state.user,
        isAuthor: state => state.user && (state.user.role === 'author' || state.user.role === 'admin'),
        isAdmin: state => state.user && state.user.role === 'admin',
        allArticles: state => state.articles,
        articleById: state => id => state.articles.find(article => article.id === id),
        getLoading: state => state.loading,
        getError: state => state.error,
        getDashboardStats: state => state.dashboardStats
    },
    mutations: {
        SET_TOKEN(state, token) {
            state.token = token;
            if (token) {
                localStorage.setItem('token', token);
            } else {
                localStorage.removeItem('token');
            }
        },
        SET_USER(state, user) {
            state.user = user;
            if (user) {
                localStorage.setItem('user', JSON.stringify(user));
            } else {
                localStorage.removeItem('user');
            }
        },
        CLEAR_AUTH(state) {
            state.token = null;
            state.user = null;
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        },
        SET_ARTICLES(state, articles) {
            state.articles = articles;
            saveArticles(articles);
        },
        SET_CURRENT_ARTICLE(state, article) {
            state.currentArticle = article;
        },
        ADD_ARTICLE(state, article) {
            state.articles.unshift(article);
            saveArticles(state.articles);
        },
        UPDATE_ARTICLE(state, updatedArticle) {
            const index = state.articles.findIndex(a => a.id === updatedArticle.id);
            if (index !== -1) {
                state.articles.splice(index, 1, updatedArticle);
            }
            if (state.currentArticle && state.currentArticle.id === updatedArticle.id) {
                state.currentArticle = updatedArticle;
            }
            saveArticles(state.articles);
        },
        REMOVE_ARTICLE(state, articleId) {
            state.articles = state.articles.filter(article => article.id !== articleId);
            if (state.currentArticle && state.currentArticle.id === articleId) {
                state.currentArticle = null;
            }
            saveArticles(state.articles);
        },
        SET_LOADING(state, status) {
            state.loading = status;
        },
        SET_ERROR(state, error) {
            state.error = error;
        },
        SET_DASHBOARD_STATS(state, stats) {
            state.dashboardStats = stats;
        }
    },
    actions: {
        async register() {
            return personalAuthor;
        },
        async login() {
            return personalAuthor;
        },
        logout() {
            return true;
        },
        async fetchArticles({ commit }) {
            try {
                const articles = loadArticles();
                commit('SET_ARTICLES', articles);
                return articles;
            } catch (error) {
                console.error('Error fetching articles:', error);
                return [];
            }
        },
        async fetchArticleById({ commit }, id) {
            commit('SET_LOADING', true);
            commit('SET_ERROR', null);
            try {
                const article = loadArticles().find(item => String(item.id) === String(id)) || null;
                commit('SET_CURRENT_ARTICLE', article);
                return article;
            } catch (error) {
                console.error('获取文章详情失败:', error);
                commit('SET_ERROR', '获取文章详情失败');
                return null;
            } finally {
                commit('SET_LOADING', false);
            }
        },
        async createArticle({ commit }, articleData) {
            commit('SET_LOADING', true);
            commit('SET_ERROR', null);
            try {
                const newArticle = {
                    id: Date.now(),
                    title: articleData.title,
                    content: articleData.content,
                    tags: articleData.tags || [],
                    cover_image: articleData.cover_image || '',
                    created_at: new Date().toISOString().slice(0, 10),
                    author: personalAuthor,
                    comments: [],
                    views_count: 0
                };
                commit('ADD_ARTICLE', newArticle);
                return newArticle;
            } catch (error) {
                console.error('创建文章失败:', error);
                const errorMessage = error.response && error.response.data && error.response.data.message ? error.response.data.message : '创建文章失败';
                commit('SET_ERROR', errorMessage);
                throw error;
            } finally {
                commit('SET_LOADING', false);
            }
        },
        async updateArticle({ commit }, { id, articleData }) {
            commit('SET_LOADING', true);
            commit('SET_ERROR', null);
            try {
                const current = loadArticles().find(item => String(item.id) === String(id));
                if (!current) throw new Error('文章不存在');
                const updatedArticle = {
                    ...current,
                    ...articleData
                };
                commit('UPDATE_ARTICLE', updatedArticle);
                return updatedArticle;
            } catch (error) {
                console.error('更新文章失败:', error);
                const errorMessage = error.response && error.response.data && error.response.data.message ? error.response.data.message : '更新文章失败';
                commit('SET_ERROR', errorMessage);
                throw error;
            } finally {
                commit('SET_LOADING', false);
            }
        },
        async deleteArticle({ commit }, id) {
            commit('SET_LOADING', true);
            try {
                commit('REMOVE_ARTICLE', id);
                return true;
            } catch (error) {
                console.error('Delete article error:', {
                    status: error.response && error.response.status,
                    message: error.response && error.response.data && error.response.data.message || error.message,
                    config: error.config,
                    headers: error.response && error.response.headers
                });

                const errorMessage = '删除文章失败';
                commit('SET_ERROR', errorMessage);
                throw error;
            } finally {
                commit('SET_LOADING', false);
            }
        },
        async fetchDashboardStats({ commit }) {
            commit('SET_LOADING', true);
            commit('SET_ERROR', null);
            try {
                const articles = loadArticles();
                const stats = {
                    articleCount: articles.length,
                    commentCount: articles.reduce((sum, a) => sum + (a.comments ? a.comments.length : 0), 0),
                    viewCount: articles.reduce((sum, a) => sum + (a.views_count || 0), 0)
                };
                commit('SET_DASHBOARD_STATS', stats);
                return stats;
            } catch (error) {
                console.error('获取仪表盘数据失败:', error);
                commit('SET_ERROR', '获取仪表盘数据失败');
                return null;
            } finally {
                commit('SET_LOADING', false);
            }
        }
    }
});