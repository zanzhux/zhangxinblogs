<template>
  <div class="app-wrapper">
    <nav class="main-nav">
      <div class="container">
        <div class="nav-links">
          <router-link to="/" class="no-effect">首页</router-link>
          <router-link to="/categories" class="no-effect">分类</router-link>
          <router-link to="/archives" class="no-effect">归档</router-link>
          <router-link to="/albums" class="no-effect">摇滚专辑</router-link>
          <router-link to="/chat" class="no-effect">AI助手</router-link>
          <router-link to="/about" class="no-effect">关于我</router-link>
        </div>

        <button class="mobile-menu-btn" @click="toggleMobileMenu">
          <span></span><span></span><span></span>
        </button>
      </div>
    </nav>

    <!-- 搜索栏 - 放在导航栏下面 -->
    <div class="search-container">
      <form @submit.prevent="search" class="search-form">
        <input type="text" v-model="searchQuery" placeholder="搜索文章..." class="search-bar">
        <button type="submit" class="search-button">
          <i class="fas fa-search"></i>
        </button>
      </form>
    </div>

    <header class="main-header">
      <div class="container header-content">
        <router-link to="/" class="logo no-effect">
          <div class="top-chars">
            <span>欢</span>
            <span>迎</span>
            <span>浏</span>
            <span>览</span>
            <span>访</span>
            <span>问</span>
          </div>
          <div class="main-title"><img src="../public/logo.png" alt=""></div>
          <div class="english-title">NOTES ON THE BREAKWATER</div>
          <div class="subtitle">WELCOME TO BROWSE</div>
        </router-link>
      </div>
    </header>

    <div class="mobile-menu" :class="{ 'active': mobileMenuOpen }">
      <button class="close-menu-btn" @click="closeMobileMenu">×</button>
      <div class="mobile-menu-links">
        <router-link to="/" @click="closeMobileMenu">首页</router-link>
        <router-link to="/categories" @click="closeMobileMenu">分类</router-link>
        <router-link to="/archives" @click="closeMobileMenu">归档</router-link>
        <router-link to="/albums" @click="closeMobileMenu">摇滚专辑</router-link>
        <router-link to="/chat" @click="closeMobileMenu">AI助手</router-link>
        <router-link to="/about" @click="closeMobileMenu">关于我</router-link>
      </div>
      <div class="vertical-text">旅行青年的漂泊日记</div>
    </div>

    <main class="main-content">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <footer class="main-footer">
      <div class="container">
        <div class="footer-content">
          <div class="left">
            <p>防 波 堤 手 记</p>
          </div>
          <div class="center">
            <div class="divider"></div>
          </div>
          <div class="right">
            <p>© {{ new Date().getFullYear() }} · NOTES ON THE BREAKWATER</p>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script>
export default {
  name: 'App',
  data() {
    return {
      mobileMenuOpen: false,
      searchQuery: ''
    }
  },
  methods: {
    toggleMobileMenu() {
      this.mobileMenuOpen = !this.mobileMenuOpen
      document.body.classList.toggle('no-scroll', this.mobileMenuOpen)
    },
    closeMobileMenu() {
      this.mobileMenuOpen = false
      document.body.classList.remove('no-scroll')
    },
    search() {
      if (this.searchQuery.trim()) {
        this.$router.push({
          path: '/search',
          query: { q: this.searchQuery }
        })
        this.searchQuery = ''
      }
    }
  },
  watch: {
    $route() {
      this.closeMobileMenu()
      window.scrollTo(0, 0)
    }
  }
}
</script>

<style>
@import './assets/styles/global.css';

/* App组件特定样式 */
.app-wrapper {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

/* 添加全局磨砂效果 */
body {
  background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAMAAAAp4XiDAAAAUVBMVEWFhYWDg4N3d3dtbW17e3t1dXWBgYGHh4d5eXlzc3OLi4ubm5uVlZWPj4+NjY19fX2JiYl/f39ra2uRkZGZmZlpaWmXl5dvb29xcXGTk5NnZ2c8TV1mAAAAG3RSTlNAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEAvEOwtAAAFVklEQVR4XpWWB67c2BUFb3g557T/hRo9/WUMZHlgr4Bg8Z4qQgQJlHI4A8SzFVrapvmTF9O7dmYRFZ60YiBhJRCgh1FYhiLAmdvX0CzTOpNE77ME0Zty/nWWzchDtiqrmQDeuv3powQ5ta2eN0FY0InkqDD73lT9c9lEzwUNqgFHs9VQce3TVClFCQrSTfOiYkVJQBmpbq2L6iZavPnAPcoU0dSw0SUTqz/GtrGuXfbyyBniKykOWQWGqwwMA7QiYAxi+IlPdqo+hYHnUt5ZPfnsHJyNiDtnpJyayNBkF6cWoYGAMY92U2hXHF/C1M8uP/ZtYdiuj26UdAdQQSXQErwSOMzt/XWRWAz5GuSBIkwG1H3FabJ2OsUOUhGC6tK4EMtJO0ttC6IBD3kM0ve0tJwMdSfjZo+EEISaeTr9P3wYrGjXqyC1krcKdhMpxEnt5JetoulscpyzhXN5FRpuPHvbeQaKxFAEB6EN+cYN6xD7RYGpXpNndMmZgM5Dcs3YSNFDHUo2LGfZuukSWyUYirJAdYbF3MfqEKmjM+I2EfhA94iG3L7uKrR+GdWD73ydlIB+6hgref1QTlmgmbM3/LeX5GI1Ux1RWpgxpLuZ2+I+IjzZ8wqE4nilvQdkUdfhzI5QDWy+kw5Wgg2pGpeEVeCCA7b85BO3F9DzxB3cdqvBzWcmzbyMiqhzuYqtHRVG2y4x+KOlnyqla8AoWWpuBoYRxzXrfKuILl6SfiWCbjxoZJUaCBj1CjH7GIaDbc9kqBY3W/Rgjda1iqQcOJu2WW+76pZC9QG7M00dffe9hNnseupFL53r8F7YHSwJWUKP2q+k7RdsxyOB11n0xtOvnW4irMMFNV4H0uqwS5ExsmP9AxbDTc9JwgneAT5vTiUSm1E7BSflSt3bfa1tv8Di3R8n3Af7MNWzs49hmauE2wP+ttrq+AsWpFG2awvsuOqbipWHgtuvuaAE+A1Z/7gC9hesnr+7wqCwG8c5yAg3AL1fm8T9AZtp/bbJGwl1pNrE7RuOX7PeMRUERVaPpEs+yqeoSmuOlokqw49pgomjLeh7icHNlG19yjs6XXOMedYm5xH2YxpV2tc0Ro2jJfxC50ApuxGob7lMsxfTbeUv07TyYxpeLucEH1gNd4IKH2LAg5TdVhlCafZvpskfncCfx8pOhJzd76bJWeYFnFciwcYfubRc12Ip/ppIhA1/mSZ/RxjFDrJC5xifFjJpY2Xl5zXdguFqYyTR1zSp1Y9p+tktDYYSNflcxI0iyO4TPBdlRcpeqjK/piF5bklq77VSEaA+z8qmJTFzIWiitbnzR794USKBUaT0NTEsVjZqLaFVqJoPN9ODG70IPbfBHKK+/q/AWR0tJzYHRULOa4MP+W/HfGadZUbfw177G7j/OGbIs8TahLyynl4X4RinF793Oz+BU0saXtUHrVBFT/DnA3ctNPoGbs4hRIjTok8i+algT1lTHi4SxFvONKNrgQFAq2/gFnWMXgwffgYMJpiKYkmW3tTg3ZQ9Jq+f8XN+A5eeUKHWvJWJ2sgJ1Sop+wwhqFVijqWaJhwtD8MNlSBeWNNWTa5Z5kPZw5+LbVT99wqTdx29lMUH4OIG/D86ruKEauBjvH5xy6um/Sfj7ei6UUVk4AIl3MyD4MSSTOFgSwsH/QJWaQ5as7ZcmgBZkzjjU1UrQ74ci1gWBCSGHtuV1H2mhSnO3Wp/3fEV5a+4wz//6qy8JxjZsmxxy5+4w9CDNJY09T072iKG0EnOS0arEYgXqYnXcYHwjTtUNAcMelOd4xpkoqiTYICWFq0JSiPfPDQdnt+4/wuqcXY47QILbgAAAABJRU5ErkJggg==");
  background-blend-mode: overlay;
  background-attachment: fixed;
  opacity: 0.98;
  /* 微妙的透明度，增强磨砂效果 */
}

/* 导航区域 - 现在在顶部 */
.main-nav {
  background-color: rgba(0, 0, 0, 0.8);
  /* 半透明黑色 */
  color: var(--color-white);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.8rem var(--spacing-md);
  position: sticky;
  top: 0;
  z-index: 1000;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(8px);
  /* 磨砂玻璃效果 */
  -webkit-backdrop-filter: blur(8px);
  /* Safari 支持 */
}

.nav-links {
  display: flex;
  justify-content: center;
  gap: var(--spacing-md);
}

.nav-links a {
  font-family: 'Ma Shan Zheng', cursive;
  font-size: 1.1rem;
  padding: 0.3rem 0.5rem;
  position: relative;
  transition: all 0.3s ease;
}

.nav-links a::after {
  display: none;
}

.nav-links a:hover {
  opacity: 1;
  transform: translateY(-2px);
}

/* 顶部标题区域 - 现在在导航栏下面 */
.main-header {
  padding: var(--spacing-sm) 0 var(--spacing-xs);

  text-align: center;



}

.header-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.logo {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.top-chars {
  display: flex;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-xs);
  font-family: 'Ma Shan Zheng', cursive;
  font-size: 1rem;
  opacity: 0.7;
}

.main-title {
  font-family: 'MaoZedong', 'Ma Shan Zheng', cursive;
  font-size: 3.2rem;
  margin: var(--spacing-xs) 0;
  text-shadow:
    1px 1px 2px rgba(0, 0, 0, 0.3),
    0px 0px 5px rgba(0, 0, 0, 0.1);
  color: var(--color-black);
  letter-spacing: 0.06em;
  -webkit-text-stroke: 0.3px rgba(0, 0, 0, 0.2);
  font-weight: normal;
  transform: rotate(-1deg);
  position: relative;
  display: inline-block;
  animation: titleFloat 3s ease-in-out infinite;
}

.english-title {
  font-family: 'Cormorant Garamond', serif;
  text-transform: uppercase;
  font-size: 0.9rem;
  letter-spacing: 0.2em;
  margin-bottom: 0.2rem;
  font-weight: 300;
}

.subtitle {
  font-family: 'Cormorant Garamond', serif;
  text-transform: uppercase;
  font-size: 0.8rem;
  letter-spacing: 0.15em;
  opacity: 0.7;
  font-weight: 300;
  margin-bottom: 0.5rem;
}

/* 搜索栏 */
.search-container {
  width: 100%;
  padding: 0.6rem 0;
}

.search-form {
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  position: relative;
}

.search-bar {
  width: 100%;
  padding: 0.7rem 3rem 0.7rem 1.2rem;
  border-radius: var(--radius);
  background-color: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: var(--color-text-light);
  font-family: 'Noto Serif SC', serif;
  transition: var(--transition);
  font-size: 1rem;
}

.search-bar:focus {
  background-color: rgba(0, 0, 0, 0.4);
  border-color: rgba(255, 255, 255, 0.2);
  outline: none;
  box-shadow: 0 0 5px rgba(255, 255, 255, 0.1);
}

.search-button {
  position: absolute;
  right: 0;
  top: 0;
  height: 100%;
  background: transparent;
  border: none;
  padding: 0 1.2rem;
  cursor: pointer;
  color: var(--color-text-light);
  opacity: 0.7;
  transition: var(--transition);
}

.search-button:hover {
  opacity: 1;
}

/* 移动菜单 */
.mobile-menu-btn {
  display: none;
  flex-direction: column;
  gap: 6px;
  background: transparent;
  border: none;
  padding: 5px;
  cursor: pointer;
}

.mobile-menu-btn span {
  display: block;
  width: 25px;
  height: 2px;
  background-color: white;
}

.mobile-menu {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: var(--color-black);
  z-index: 999;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  transform: translateX(-100%);
  transition: transform 0.4s ease;
}

.mobile-menu.active {
  transform: translateX(0);
}

.close-menu-btn {
  position: absolute;
  top: 20px;
  right: 20px;
  background: transparent;
  border: none;
  color: white;
  font-size: 2rem;
  cursor: pointer;
}

.mobile-menu-links {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-md);
}

.mobile-menu-links a {
  font-family: 'Ma Shan Zheng', cursive;
  font-size: 1.5rem;
  padding: 0.5rem;
}

.vertical-text {
  position: absolute;
  right: 10px;
  top: 40%;
  font-size: 1rem;
}

/* 主内容区域 */
.main-content {
  flex: 1;
  padding: var(--spacing-md) 0 var(--spacing-lg);
}

/* 页脚 */
.main-footer {
  background-color: var(--color-black);
  padding: var(--spacing-md);
  text-align: center;
  margin-top: auto;
}

.footer-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.left,
.right {
  flex: 1;
}

.right {
  text-align: right;
}

.center {
  width: 1px;
  height: 30px;
  background-color: rgba(255, 255, 255, 0.2);
  margin: 0 var(--spacing-lg);
}

/* 过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .nav-links {
    display: none;
  }

  .mobile-menu-btn {
    display: flex;
    margin-left: auto;
  }

  .search-bar .search-form {
    max-width: 90%;
  }

  .search-bar .search-input {
    font-size: 0.95rem;
    padding: 0.6rem 2.8rem 0.6rem 1rem;
  }

  .main-title {
    font-size: 2.5rem;
  }

  .top-chars {
    font-size: 0.9rem;
  }

  .footer-content {
    flex-direction: column;
    gap: var(--spacing-sm);
    text-align: center;
  }

  .center {
    display: none;
  }

  .right {
    text-align: center;
  }

  .main-content {
    padding: var(--spacing-md) 0;
  }
}
</style>