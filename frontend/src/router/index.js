import Vue from 'vue'
import VueRouter from 'vue-router'
import HomeView from '../views/HomeView.vue'
import ArticleDetailView from '../views/ArticleDetailView.vue'
import AlbumsView from '../views/AlbumsView.vue'
import AboutView from '../views/AboutView.vue'
import CategoriesView from '../views/CategoriesView.vue'
import ArchivesView from '../views/ArchivesView.vue'
import SearchResultsView from '../views/SearchResultsView.vue'
import ArticlesByCategoryView from '../views/ArticlesByCategoryView.vue'
import AIChatView from '../views/AIChatView.vue'

const routes = [{
        path: '/',
        name: 'home',
        component: HomeView
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
        path: '/chat',
        name: 'AIChat',
        component: AIChatView
    },
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

export default router