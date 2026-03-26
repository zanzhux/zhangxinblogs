import Vue from 'vue'
import VueRouter from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import ArticleDetailView from '../views/ArticleDetailView.vue'
import NewArticleView from '../views/NewArticleView.vue'
import EditArticleView from '../views/EditArticleView.vue'
import MyArticlesView from '../views/MyArticlesView.vue'
import ProfileView from '../views/ProfileView.vue'
import AdminDashboardView from '../views/AdminDashboardView.vue'
import AdminArticlesView from '../views/AdminArticlesView.vue'
import AdminTagsView from '../views/AdminTagsView.vue'
import AlbumsView from '../views/AlbumsView.vue'
import AboutView from '../views/AboutView.vue'
import CategoriesView from '../views/CategoriesView.vue'
import ArchivesView from '../views/ArchivesView.vue'
import SearchResultsView from '../views/SearchResultsView.vue'
import AdminLoginView from '../views/AdminLoginView.vue'
import ArticlesByCategoryView from '../views/ArticlesByCategoryView.vue'
import AIChatView from '../views/AIChatView.vue'
import store from '../store'

const routes = [{
        path: '/',
        name: 'home',
        component: HomeView
    },
    {
        path: '/login',
        name: 'login',
        component: LoginView
    },
    {
        path: '/register',
        name: 'register',
        component: RegisterView
    },
    {
        path: '/article/:id',
        name: 'article-detail',
        component: ArticleDetailView
    },
    {
        path: '/albums',
        name: 'albums',
        component: AlbumsView
    },
    {
        path: '/about',
        name: 'about',
        component: AboutView
    },
    {
        path: '/categories',
        name: 'categories',
        component: CategoriesView
    },
    {
        path: '/categories/:categoryId',
        name: 'articles-by-category',
        component: ArticlesByCategoryView
    },
    {
        path: '/archives',
        name: 'archives',
        component: ArchivesView
    },
    {
        path: '/search',
        name: 'search-results',
        component: SearchResultsView,
        props: (route) => ({ query: route.query.q })
    },
    {
        path: '/new-article',
        name: 'new-article',
        component: NewArticleView,
        meta: { requiresAuth: true }
    },
    {
        path: '/edit-article/:id',
        name: 'edit-article',
        component: EditArticleView,
        meta: { requiresAuth: true }
    },
    {
        path: '/my-articles',
        name: 'my-articles',
        component: MyArticlesView,
        meta: { requiresAuth: true }
    },
    {
        path: '/profile',
        name: 'profile',
        component: ProfileView,
        meta: { requiresAuth: true }
    },
    {
        path: '/admin/login',
        name: 'admin-login',
        component: AdminLoginView
    },
    {
        path: '/admin',
        name: 'admin-dashboard',
        component: AdminDashboardView,
        meta: { requiresAuth: true, requiresAdmin: true }
    },
    {
        path: '/admin/articles',
        name: 'admin-articles',
        component: AdminArticlesView,
        meta: { requiresAuth: true, requiresAdmin: true }
    },
    {
        path: '/admin/new-article',
        name: 'admin-new-article',
        component: NewArticleView,
        meta: { requiresAuth: true, requiresAdmin: true }
    },
    {
        path: '/admin/edit-article/:id',
        name: 'admin-edit-article',
        component: EditArticleView,
        meta: { requiresAuth: true, requiresAdmin: true },
        props: true
    },
    {
        path: '/admin/tags',
        name: 'admin-tags',
        component: AdminTagsView,
        meta: { requiresAuth: true, requiresAdmin: true }
    },
    {
        path: '/chat',
        name: 'AIChat',
        component: AIChatView,
        meta: { requiresAuth: true }
    }
]

// 注册Vue Router
Vue.use(VueRouter)

const router = new VueRouter({
    mode: 'history',
    base: process.env.BASE_URL,
    routes,
    scrollBehavior(to, from, savedPosition) {
        if (savedPosition) {
            return savedPosition
        } else {
            return { x: 0, y: 0 }
        }
    }
})

// 全局导航守卫
router.beforeEach((to, from, next) => {
    const storeIsAuthenticated = store.getters.isAuthenticated;
    const isAdmin = store.getters.isAdmin;

    // 需要认证的路由
    if (to.matched.some(record => record.meta.requiresAuth)) {
        // 如果未登录，重定向到登录页
        if (!storeIsAuthenticated) {
            next({
                path: to.meta.requiresAdmin ? '/admin/login' : '/login',
                query: { redirect: to.fullPath }
            });
        }
        // 如果需要管理员权限但用户不是管理员
        else if (to.matched.some(record => record.meta.requiresAdmin) && !isAdmin) {
            next({ name: 'admin-login' });
        }
        // 已登录且权限足够
        else {
            next();
        }
    }
    // 不需要认证的路由直接放行
    else {
        next();
    }
})

export default router