<template>
    <nav class="navbar">
        <div class="nav-brand">
            <router-link to="/" class="brand-link">博客系统</router-link>
        </div>
        <div class="nav-links">
            <router-link to="/" class="nav-link">首页</router-link>
            <router-link to="/categories" class="nav-link">分类</router-link>
            <router-link to="/archives" class="nav-link">归档</router-link>
            <router-link to="/albums" class="nav-link">摇滚专辑</router-link>
            <router-link to="/about" class="nav-link">关于我</router-link>
            <template v-if="isAuthenticated">
                <router-link to="/chat" class="nav-link">AI助手</router-link>
                <a @click="handleLogout" class="nav-link logout">退出</a>
            </template>
            <template v-else>
                <router-link to="/login" class="nav-link">登录</router-link>
                <router-link to="/register" class="nav-link">注册</router-link>
            </template>
            <router-link v-if="isAdmin" to="/admin/articles" class="nav-link">管理员</router-link>
        </div>
    </nav>
</template>

<script>
import { mapState, mapGetters } from 'vuex';

export default {
    name: 'NavBar',
    computed: {
        ...mapGetters(['isAuthenticated', 'isAdmin']),
        ...mapState({
            currentUser: state => state.user
        })
    },
    methods: {
        handleLogout() {
            this.$store.dispatch('logout');
            this.$router.push('/login');
        }
    }
};
</script>

<style scoped>
.navbar {
    background-color: #ffffff;
    padding: 1rem 2rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.nav-brand {
    font-size: 1.5rem;
    font-weight: bold;
}

.brand-link {
    text-decoration: none;
    color: #333;
}

.nav-links {
    display: flex;
    gap: 1.5rem;
    align-items: center;
}

.nav-link {
    text-decoration: none;
    color: #666;
    font-weight: 500;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    transition: all 0.3s ease;
}

.nav-link:hover {
    color: #007bff;
    background-color: rgba(0, 123, 255, 0.1);
}

.nav-link.router-link-active {
    color: #007bff;
}

.logout {
    cursor: pointer;
    color: #dc3545;
}

.logout:hover {
    color: #dc3545;
    background-color: rgba(220, 53, 69, 0.1);
}
</style>