import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import axios from 'axios'
import './assets/styles/global.css'

// 设置axios默认配置
axios.defaults.baseURL = process.env.VUE_APP_API_URL || 'http://localhost:3003/api'
axios.defaults.headers.common['Content-Type'] = 'application/json'

// 添加请求拦截器
axios.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));

    console.log('Request interceptor - Token:', token);
    console.log('Request interceptor - User:', user);
    console.log('Request interceptor - Original headers:', config.headers);

    // 确保 headers 对象存在
    config.headers = config.headers || {};

    // 设置 Content-Type
    config.headers['Content-Type'] = 'application/json';

    if (token) {
        // 设置 Authorization header
        config.headers.Authorization = `Bearer ${token}`;
        console.log('Request interceptor - Added Authorization header');
    }

    // 打印完整的请求配置
    console.log('Request interceptor - Final config:', {
        url: config.url,
        method: config.method,
        headers: config.headers,
        baseURL: config.baseURL,
        data: config.data
    });

    return config;
}, error => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
});

// 添加响应拦截器
axios.interceptors.response.use(
    response => {
        console.log('Response interceptor - Success:', {
            status: response.status,
            statusText: response.statusText,
            headers: response.headers,
            data: response.data
        });
        return response;
    },
    error => {
        console.error('Response interceptor - Full error:', error);
        console.error('Response interceptor - Error details:', {
            status: error.response && error.response.status,
            statusText: error.response && error.response.statusText,
            data: error.response && error.response.data,
            headers: error.response && error.response.headers,
            config: error.config
        });

        if (error.response && error.response.status === 401) {
            console.log('Response interceptor - Unauthorized, redirecting to login');
            store.dispatch('logout');
            router.push('/admin/login');
        }

        return Promise.reject(error);
    }
);

// 添加axios到Vue原型，方便组件内使用
Vue.prototype.$axios = axios

// 创建Vue实例
new Vue({
    router,
    store,
    render: h => h(App)
}).$mount('#app')