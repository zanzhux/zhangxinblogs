<template>
  <div class="albums-view">
    <section class="hero-section">
      <div class="container">
        <div class="hero-content">
          <h1 class="page-title">摇滚专辑</h1>
          <p class="page-subtitle">我的精选摇滚乐收藏</p>
          <div class="decorative-line"></div>
        </div>
      </div>
    </section>
    
    <section class="albums-section">
      <div class="container">
        <div class="filter-categories">
          <h3>分类</h3>
          <div class="categories">
            <span 
              v-for="(cat, index) in categories" 
              :key="index"
              @click="filterByCategory(cat)"
              class="category-tag"
              :class="{ 'active': selectedCategory === cat }">
              {{ cat }}
            </span>
          </div>
        </div>
        
        <div class="albums-grid">
          <div 
            v-for="(album, index) in filteredAlbums" 
            :key="index"
            class="album-card" 
            @click="selectAlbum(album)">
            <div class="album-cover">
              <img :src="getAlbumCoverUrl(album.cover)" :alt="album.title" class="cover-image" />
              <div class="album-overlay">
                <span class="view-details">查看详情</span>
              </div>
            </div>
            <div class="album-info">
              <h3 class="album-title">{{ album.title }}</h3>
              <div class="album-artist">{{ album.artist }}</div>
              <div class="album-year">{{ album.year }}</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 专辑详情弹窗 -->
    <div class="album-modal" v-if="selectedAlbumDetails" @click.self="closeModal">
      <div class="modal-content">
        <button class="close-btn" @click="closeModal">×</button>
        <div class="modal-body">
          <div class="modal-left">
            <img :src="getAlbumCoverUrl(selectedAlbumDetails.cover)" :alt="selectedAlbumDetails.title" class="modal-cover" />
          </div>
          <div class="modal-right">
            <h2 class="modal-title">{{ selectedAlbumDetails.title }}</h2>
            <div class="modal-artist">{{ selectedAlbumDetails.artist }}</div>
            <div class="modal-year">{{ selectedAlbumDetails.year }}</div>
            <div class="modal-category">{{ selectedAlbumDetails.category }}</div>
            
            <div class="album-description">{{ selectedAlbumDetails.description }}</div>
            
            <div class="album-tracks">
              <h4>曲目列表</h4>
              <ol class="tracks-list">
                <li v-for="(track, index) in selectedAlbumDetails.tracks" :key="index">
                  {{ track }}
                </li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AlbumsView',
  data() {
    return {
      albums: [
        {
          title: '万能青年旅店',
          artist: '万能青年旅店',
          year: '2010',
          cover: '01.jpg',
          category: '独立摇滚',
          description: '万能青年旅店的同名专辑，被誉为"中国摇滚乐的经典"。专辑中的《杀死那个石家庄人》、《大石碎胸口》等歌曲广为流传，以其深刻的社会观察和独特的音乐风格闻名。',
          tracks: ['秦皇岛', '杀死那个石家庄人', '大石碎胸口', '十万嬉皮', '无法撼动', '冀西南林路行', '万能青年旅店']
        },
        {
          title: 'OK Computer',
          artist: 'Radiohead',
          year: '1997',
          cover: '02.jpg',
          category: '另类摇滚',
          description: 'OK Computer是Radiohead乐队的第三张录音室专辑，被广泛认为是90年代最伟大的摇滚专辑之一。专辑展现了一个科技异化的现代世界，充满了对社会隔离和政治异化的反思。',
          tracks: ['Airbag', 'Paranoid Android', 'Subterranean Homesick Alien', 'Exit Music (For a Film)', 'Let Down', 'Karma Police', 'Fitter Happier', 'Electioneering', 'Climbing Up the Walls', 'No Surprises', 'Lucky', 'The Tourist']
        },
        {
          title: '黑梦',
          artist: '窦唯',
          year: '1994',
          cover: '03.jpg',
          category: '摇滚',
          description: '最新专辑「黑夢」中的歌曲，大部分于此时成型；和他早期在乐队中的作品，有极大差别，减少了浪漫欢娱的感受却强化了他对生活品质的呈现。就像许多活在这个时代的年青人一样，生命中充斥的迷惑与难题，都藉由「夢」的形式释放出来。',
          tracks: ['明天更漫长', '黑色梦中', '还有你', '开心电话', '从命', '感觉时刻', '悲伤的梦', '噢！乖', '高级动物', '上帝保佑']
        },
        {
          title: '近人可读',
          artist: '寸铁',
          year: '2020',
          cover: '04.jpg',
          category: '摇滚',
          description: '寸铁乐队成立于2013年，由主唱兼吉他手张昊、贝斯手兼和声张昊、鼓手兼和声张昊、吉他手兼和声张昊组成。',
          tracks: ['若你心年轻', '我正在忘了你', '我讲给你一个笑话', '目击你刚刚完成这一跳', '旅途愉快', '我所感受到的是你的悲伤吗', '请坚信他曾经坚信的诗篇正在短波中消散', '道别时想说些什么', '无题']
        },
        {
          title: '浴室',
          artist: 'deca joins',
          year: '2017',
          cover: '05.jpg',
          category: '独立摇滚',
          description: '从一个最混沌的状态里发芽，有过暴裂有过激热，很快的就开始等待最后一秒的坠地了。他需要温柔而抽离的酒精，唱漫天舞地的歌；干枯的浴室他留不住，用仅剩的个人倾向跳入蓝色的海，裸身浮沉到海口，静而凝视的姿态、拧气闭眼。',
          tracks: ['一去不回来', '快乐', '巫堵', '关渡口', '蓝色', '春天游泳', '路','浴室','梦']
        },
        {
          title: 'The Dark Side of the Moon',
          artist: 'Pink Floyd',
          year: '1973',
          cover: '06.jpg',
          category: '迷幻摇滚',
          description: '《月之暗面》是Pink Floyd乐队的第八张录音室专辑，被誉为摇滚史上最伟大的概念专辑之一。专辑探讨了人类生存的各个方面，包括冲突、贪婪、时间流逝和精神疾病，并以其精湛的音频制作和无缝衔接的音乐流成为了摇滚史上的经典。',
          tracks: ['Speak to Me', 'Breathe', 'On the Run', 'Time', 'The Great Gig in the Sky', 'Money', 'Us and Them', 'Any Colour You Like', 'Brain Damage', 'Eclipse']
        },
        {
          title: '华北浪革',
          artist: '刘森',
          year: '2021',
          cover: '07.jpg',
          category: '独立摇滚',
          description: '个人意志的自由与偏执，总在引导我唤起对自我的激情，去精神世界里找找自己的位置。深海里的长夜短歌，是我心底的华北浪革。',
          tracks: ['温情', '深海', '晚灯', '悲哀藏在现实中', '死如秋叶', '而我也无法摸到上游的风', '爱人穿过你', '焰火青年','上游的风','疯土']
        },
        {
          title: '冀西南林路行',
          artist: '万能青年旅店',
          year: '2020',
          cover: '08.jpg',
          category: '独立摇滚',
          description: '与2010年万能青年旅店首张同名专辑《万能青年旅店》发行时获得一致的好口碑相比，该专辑在音乐上的整体性、巨大的信息量、风格与器乐的多元、词的"曲径通幽"，引发了褒贬不一的反响，也给了听众更多反复欣赏和讨论的空间',
          tracks: ['早','泥河','平等云雾','采石','山雀','绕越','河北墨麒麟','郊眠寺']
        },
        {
          title: '丑奴儿',
          artist: '草东没有派对',
          year: '2016',
          cover: '09.jpg',
          category: '独立摇滚',
          description: '少年不識愁滋味，為賦新詞強說愁。好似灑脫卻充滿框架，好似追求、期盼什麼卻只是不斷印證自己的可笑一般。其實就是醜奴兒自己心裡的對話與拉扯，希望能藉由歌詞的意境，讓悲傷的人看見自己的模樣，在片刻抒發後，認清自我。總體而言，文字創作的方面，我們希望以文字作為一面鏡子反面對照自我，也許表面較為負面但期盼人們依舊能意識到作為一個「人」不該遺忘的本質。',
          tracks: ['Intro', '丑', '烂泥', '勇敢的人', '大风吹', '埃玛', '等', '鬼','在','山海','我们','情歌']
        }
      ],
      categories: ['全部', '独立摇滚', '另类摇滚', '朋克', '垃圾摇滚', '后摇', '迷幻摇滚', '电子摇滚', '后朋克'],
      selectedCategory: '全部',
      selectedAlbumDetails: null
    }
  },
  computed: {
    filteredAlbums() {
      if (this.selectedCategory === '全部') {
        return this.albums
      } else {
        return this.albums.filter(album => album.category === this.selectedCategory)
      }
    }
  },
  methods: {
    filterByCategory(category) {
      this.selectedCategory = category
    },
    selectAlbum(album) {
      this.selectedAlbumDetails = album
      document.body.classList.add('modal-open')
    },
    closeModal() {
      this.selectedAlbumDetails = null
      document.body.classList.remove('modal-open')
    },
    getAlbumCoverUrl(filename) {
      // 直接使用完整路径引用albums目录下的图片
      return `/albums/${filename}`;
    }
  }
}
</script>

<style scoped>
.albums-view {
  padding-bottom: var(--spacing-xl);
}

/* 英雄区域 */
.hero-section {
  padding: var(--spacing-lg) 0;
  margin-bottom: var(--spacing-lg);
  text-align: center;
}

.hero-content {
  max-width: 800px;
  margin: 0 auto;
}

.page-title {
  font-size: 3rem;
  margin-bottom: var(--spacing-sm);
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.page-subtitle {
  font-size: 1.2rem;
  opacity: 0.8;
  margin-bottom: var(--spacing-md);
  font-family: 'Noto Serif SC', serif;
}

.decorative-line {
  height: 1px;
  width: 120px;
  margin: 0 auto;
  background: linear-gradient(to right, transparent, rgba(255, 255, 255, 0.5), transparent);
}

/* 筛选区域 */
.filter-categories {
  margin-bottom: var(--spacing-lg);
  text-align: center;
}

.filter-categories h3 {
  margin-bottom: var(--spacing-sm);
  font-size: 1.5rem;
}

.categories {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: var(--spacing-xs);
  margin-top: var(--spacing-sm);
}

.category-tag {
  padding: 0.4em 1em;
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 2px;
  cursor: pointer;
  transition: var(--transition);
  font-family: 'Ma Shan Zheng', cursive;
  font-size: 1rem;
}

.category-tag:hover, 
.category-tag.active {
  background-color: rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
}

/* 专辑网格 */
.albums-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: var(--spacing-lg);
  margin-top: var(--spacing-lg);
}

.album-card {
  position: relative;
  transition: var(--transition);
  cursor: pointer;
}

.album-card:hover {
  transform: translateY(-5px);
}

.album-cover {
  position: relative;
  padding-bottom: 100%; /* 1:1 宽高比 */
  overflow: hidden;
  background-color: rgba(0, 0, 0, 0.7);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.3);
}

.cover-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: var(--transition);
}

.album-card:hover .cover-image {
  transform: scale(1.05);
  opacity: 0.7;
}

.album-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.7), transparent);
  opacity: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: var(--transition);
}

.album-card:hover .album-overlay {
  opacity: 1;
}

.view-details {
  padding: 0.5em 1em;
  background-color: rgba(0, 0, 0, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  font-family: 'Ma Shan Zheng', cursive;
  font-size: 1.1rem;
}

.album-info {
  padding: var(--spacing-sm) var(--spacing-xs);
  text-align: center;
}

.album-title {
  font-family: 'Ma Shan Zheng', cursive;
  font-size: 1.5rem;
  margin: var(--spacing-xs) 0;
  font-weight: normal;
}

.album-artist {
  opacity: 0.9;
  margin-bottom: 0.2rem;
}

.album-year {
  font-size: 0.9rem;
  opacity: 0.7;
}

/* 弹窗样式 */
.album-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: var(--spacing-md);
}

.modal-content {
  background-color: var(--color-brown);
  border: 1px solid rgba(255, 255, 255, 0.1);
  max-width: 900px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
}

.close-btn {
  position: absolute;
  top: 15px;
  right: 15px;
  background: none;
  border: none;
  color: white;
  font-size: 2rem;
  cursor: pointer;
  z-index: 10;
}

.modal-body {
  display: flex;
  padding: var(--spacing-lg);
}

.modal-left {
  flex: 0 0 300px;
  margin-right: var(--spacing-lg);
}

.modal-cover {
  width: 100%;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
}

.modal-right {
  flex: 1;
}

.modal-title {
  font-family: 'Ma Shan Zheng', cursive;
  font-size: 2.5rem;
  margin-bottom: var(--spacing-xs);
  font-weight: normal;
}

.modal-artist {
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
}

.modal-year, .modal-category {
  font-size: 1rem;
  opacity: 0.8;
  margin-bottom: 0.5rem;
}

.album-description {
  margin: var(--spacing-md) 0;
  line-height: 1.8;
  font-family: 'Noto Serif SC', serif;
  letter-spacing: 0.03em;
  font-size: 1.05rem;
}

.album-tracks {
  margin-top: var(--spacing-md);
}

.album-tracks h4 {
  font-family: 'Ma Shan Zheng', cursive;
  font-size: 1.5rem;
  margin-bottom: var(--spacing-sm);
  font-weight: normal;
}

.tracks-list {
  padding-left: var(--spacing-md);
  line-height: 1.6;
}

.tracks-list li {
  margin-bottom: 0.5rem;
}

@media (max-width: 768px) {
  .modal-body {
    flex-direction: column;
    padding: var(--spacing-md);
  }
  
  .modal-left {
    flex: none;
    margin-right: 0;
    margin-bottom: var(--spacing-md);
    max-width: 250px;
    align-self: center;
  }
  
  .albums-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: var(--spacing-md);
  }
  
  .album-title {
    font-size: 1.2rem;
  }
  
  .page-title {
    font-size: 2.2rem;
  }
  
  .category-tag {
    font-size: 0.9rem;
    padding: 0.3em 0.8em;
  }
}
</style> 