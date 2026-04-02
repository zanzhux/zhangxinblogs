<template>
  <div class="about-view">
    <div class="container">
      <div class="section-header">
        <h1 class="page-title">关于我</h1>
        <div class="decorative-line"></div>
      </div>
      
      <div class="about-content">
        <div class="about-section">
          <div class="author-image">
            <img :src="avatar" alt="头像" class="avatar-img" />
          </div>
          
          <div class="author-info">
            <h2>关于博主</h2>
            <p>我是一名热爱音乐与文字的创作者，尤其痴迷于摇滚乐和文学。来自中国北方的小城，现居呼和浩特，以思考和记录为生。</p>
            <p>大学时期专业为计算机，现在专注于个人创作和分享，希望通过这个小小的网络角落，与同样热爱生活的朋友们交流。</p>
            <p>热爱学习与探索，具备扎实的计算机思维与问题解决能力；逻辑严谨，善于理解客户需求并推动技术方案落地；熟练运用 AI 工具提升效率，能快速自学新技术并适应高强度协作环境。</p>
            
            <div class="author-quote">
              <p>"我摇摆在风中无能为力，风是一匹怒马，我拽不住它的缰绳"</p>
            </div>
          </div>
        </div>
        <div class="about-section">
          <h2>博客简介</h2>
          <p>防波堤手记——在潮涌与荒诞的夹缝中，以文字浇筑抵抗的堤岸。这里寄存个体的清醒低语，记录被时代巨浪拍碎的泡沫与礁石。我们用锈蚀的语法修补裂缝，在虚无的轰鸣中捕捞沉没的月光。  </p>
          <p>在这里，你可以找到：</p>
          <ul class="feature-list">
            <li>对当代摇滚音乐的评论与分析</li>
            <li>文学作品的阅读笔记与思考</li>
            <li>旅行途中的所见所闻</li>
            <li>对生活的随想与记录</li>
          </ul>
        </div>

        
        <div class="about-section">
          <h2>联系我</h2>
          <p>如果你有任何问题、建议或者合作意向，欢迎通过以下方式联系我：</p>
          <div class="contact-info">
            <div class="contact-item">
              <span class="contact-icon">✉️</span>
              <span class="contact-text">电子邮箱：2954723071@qq.com</span>
            </div>
            <div class="contact-item">
              <span class="contact-icon">🔊</span>
              <span class="contact-text">微博：@贝斯与鼓z</span>
            </div>
            <div class="contact-item">
              <span class="contact-icon">📱</span>
              <span class="contact-text">WeChat：NJ1944</span>
            </div>
          </div>
        </div>
        
       
        
        <div class="thank-you">
          <p>感谢你访问我的博客，希望这里的内容能为你带来一些思考与共鸣。</p>
          <p>— 防 波 堤 手 记</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import avatar from '@/assets/images/logo.jpg'

export default {
  name: 'AboutView'
  ,
  data() {
    return {
      avatar,
    }
  }
}
</script>

<style scoped>
.about-view {
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

.about-content {
  max-width: 800px;
  margin: 0 auto;
}

.about-section {
  margin-bottom: var(--spacing-xl);
  padding: var(--spacing-lg);
  background-color: rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.about-section:first-of-type {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.author-image {
  margin-bottom: var(--spacing-md);
}

.avatar-img {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid rgba(255, 255, 255, 0.25);
  margin: 0 auto;
  display: block;
}

.author-info h2 {
  text-align: center;
  margin-bottom: var(--spacing-md);
}

.author-info p {
  margin-bottom: var(--spacing-sm);
  line-height: 1.8;
  letter-spacing: 0.03em;
}

.author-quote {
  padding: var(--spacing-md);
  margin: var(--spacing-md) 0;
  background-color: rgba(0, 0, 0, 0.2);
  border-left: 2px solid rgba(255, 255, 255, 0.2);
  font-style: italic;
}

.about-section h2 {
  margin-top: 0;
  margin-bottom: var(--spacing-md);
  text-align: center;
}

.about-section p {
  margin-bottom: var(--spacing-md);
  line-height: 1.8;
}

.feature-list {
  padding-left: var(--spacing-md);
  margin-bottom: var(--spacing-md);
}

.feature-list li {
  margin-bottom: var(--spacing-sm);
  position: relative;
  padding-left: var(--spacing-sm);
}

.feature-list li::before {
  content: "•";
  position: absolute;
  left: -10px;
  color: rgba(255, 255, 255, 0.7);
}

.placeholder-note {
  margin-top: var(--spacing-sm);
  opacity: 0.85;
  font-size: 0.95rem;
}

.media-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--spacing-md);
  margin-top: var(--spacing-md);
}

.media-card {
  background-color: rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 12px;
  padding: var(--spacing-md);
}

.media-placeholder {
  width: 100%;
  aspect-ratio: 16 / 9;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0.02));
  border: 1px dashed rgba(255, 255, 255, 0.25);
  border-radius: 10px;
  color: rgba(255, 255, 255, 0.85);
  text-align: center;
  padding: var(--spacing-md);
}

.media-img {
  width: 100%;
  border-radius: 10px;
  display: block;
}

.media-video {
  width: 100%;
  border-radius: 10px;
  display: block;
  background: rgba(0, 0, 0, 0.25);
}

.media-caption {
  margin-top: var(--spacing-sm);
  font-size: 0.95rem;
  opacity: 0.9;
  line-height: 1.6;
}

.contact-info {
  padding: var(--spacing-md);
  background-color: rgba(0, 0, 0, 0.1);
}

.contact-item {
  display: flex;
  align-items: center;
  margin-bottom: var(--spacing-sm);
}

.contact-icon {
  margin-right: var(--spacing-sm);
  font-size: 1.2rem;
}

.thank-you {
  text-align: center;
  font-style: italic;
  margin-top: var(--spacing-xl);
}

.thank-you p:last-child {
  margin-top: var(--spacing-sm);
  font-family: 'Ma Shan Zheng', cursive;
  font-size: 1.5rem;
  font-style: normal;
}

@media (min-width: 768px) {
  .about-section:first-of-type {
    flex-direction: row;
    align-items: flex-start;
  }
  
  .author-image {
    flex: 0 0 200px;
    margin-right: var(--spacing-lg);
    margin-bottom: 0;
  }
  
  .author-info {
    flex: 1;
  }
  
  .author-info h2 {
    text-align: left;
  }

  .media-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .about-section {
    padding: var(--spacing-md);
  }
}
</style> 



