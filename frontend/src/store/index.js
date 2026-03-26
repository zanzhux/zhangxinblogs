import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'

Vue.use(Vuex)

export default new Vuex.Store({
    state: {
        token: localStorage.getItem('token') || null,
        user: JSON.parse(localStorage.getItem('user')) || null,
        articles: [],
        currentArticle: null,
        loading: false,
        error: null,
        dashboardStats: null
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
        },
        SET_CURRENT_ARTICLE(state, article) {
            state.currentArticle = article;
        },
        ADD_ARTICLE(state, article) {
            state.articles.unshift(article);
        },
        UPDATE_ARTICLE(state, updatedArticle) {
            const index = state.articles.findIndex(a => a.id === updatedArticle.id);
            if (index !== -1) {
                state.articles.splice(index, 1, updatedArticle);
            }
            if (state.currentArticle && state.currentArticle.id === updatedArticle.id) {
                state.currentArticle = updatedArticle;
            }
        },
        REMOVE_ARTICLE(state, articleId) {
            state.articles = state.articles.filter(article => article.id !== articleId);
            if (state.currentArticle && state.currentArticle.id === articleId) {
                state.currentArticle = null;
            }
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
        async register({ commit }, userData) {
            commit('SET_LOADING', true);
            commit('SET_ERROR', null);
            try {
                console.log('Registering user with data:', userData);
                const response = await axios.post('/users/register', userData);
                console.log('Registration response:', response.data);
                const { token, user } = response.data;
                commit('SET_TOKEN', token);
                commit('SET_USER', user);
                return user;
            } catch (error) {
                console.error('Registration error:', error);
                const errorMessage = error.response && error.response.data && error.response.data.message ? error.response.data.message : '注册失败';
                commit('SET_ERROR', errorMessage);
                throw error;
            } finally {
                commit('SET_LOADING', false);
            }
        },
        async login({ commit }, userData) {
            commit('SET_LOADING', true);
            commit('SET_ERROR', null);
            try {
                const response = await axios.post('/users/login', userData);
                const { token, user } = response.data;
                commit('SET_TOKEN', token);
                commit('SET_USER', user);
                return user;
            } catch (error) {
                const errorMessage = error.response && error.response.data && error.response.data.message ? error.response.data.message : '登录失败';
                commit('SET_ERROR', errorMessage);
                throw error;
            } finally {
                commit('SET_LOADING', false);
            }
        },
        logout({ commit }) {
            commit('CLEAR_AUTH');
        },
        async fetchArticles({ commit }) {
            try {
                console.log('Fetching articles from API...');
                const response = await axios.get('/articles');
                console.log('Articles API response:', {
                    status: response.status,
                    articleCount: response.data.length,
                    sampleArticle: response.data[0] ? {
                        id: response.data[0].id,
                        title: response.data[0].title,
                        hasCoverImage: !!response.data[0].cover_image,
                        coverImageLength: response.data[0].cover_image ? response.data[0].cover_image.length : 0
                    } : null
                });

                const articles = Array.isArray(response.data) ? response.data : [];
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
                const response = await axios.get(`/articles/${id}`);
                commit('SET_CURRENT_ARTICLE', response.data);
                return response.data;
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
                const response = await axios.post('/articles', articleData);
                const newArticle = response.data;
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
                const response = await axios.put(`/articles/${id}`, articleData);
                const updatedArticle = response.data;
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
                const token = localStorage.getItem('token');
                if (!token) {
                    console.error('No token found in localStorage');
                    throw new Error('需要登录');
                }

                const config = {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                };

                console.log('Deleting article:', {
                    id: id,
                    token: token.substring(0, 10) + '...',
                    headers: config.headers
                });

                const response = await axios.delete(`/articles/${id}`, config);
                console.log('Delete article success:', response.data);
                commit('REMOVE_ARTICLE', id);
                return true;
            } catch (error) {
                console.error('Delete article error:', {
                    status: error.response && error.response.status,
                    message: error.response && error.response.data && error.response.data.message || error.message,
                    config: error.config,
                    headers: error.response && error.response.headers
                });

                const errorMessage = error.response && error.response.data && error.response.data.message || '删除文章失败';
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
                const response = await axios.get('/admin/dashboard/stats');
                commit('SET_DASHBOARD_STATS', response.data);
                return response.data;
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