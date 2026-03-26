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
            <!-- 这里可以放置头像 -->
            <div class="avatar-placeholder">
              <span class="avatar-text">青年</span>
            </div>
          </div>
          
          <div class="author-info">
            <h2>关于博主</h2>
            <p>我是一名热爱音乐与文字的创作者，尤其痴迷于摇滚乐和文学。来自中国北方的小城，现居呼和浩特，以思考和记录为生。</p>
            <p>大学时期专业为计算机，现在专注于个人创作和分享，希望通过这个小小的网络角落，与同样热爱生活的朋友们交流。</p>
            
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
          <h2>我的技术</h2>
          <p>我擅长把 AI 能力做成可用、可迭代、可落地的产品功能：从需求分析到 Agent 设计，再到 RAG 与生成式内容输出。</p>
          <ul class="feature-list">
            <li>AI 核心能力：AI Agent 开发、多智能体编排、RAG</li>
            <li>AI 工程与协同：LangChain / LangGraph / Dify / Coze / Cursor 协同编程</li>
            <li>AI 生成内容：文本 / 图像 / 视频</li>
            <li>技术栈：Python / JavaScript / Vue / Node.js / MySQL / Linux</li>
            <li>部署与平台：云平台（阿里云 / 腾讯云 / AWS）与 AI 应用全栈开发</li>
          </ul>
        </div>

        <div class="about-section">
          <h2>我的优势</h2>
          <p>我的优势更偏“做方案并把它落地”：沟通表达清晰、技术落点明确、并能用数据与工具把事情推到完成。</p>
          <ul class="feature-list">
            <li>核心定位：沟通表达｜技术方案落地｜AI 工具应用｜数据分析</li>
            <li>理解能力：智能软硬件理解 + 计算机思维与问题拆解能力</li>
            <li>学习与适应：快速自学新技术，能适应高强度协作环境</li>
            <li>方法论：逻辑严谨，善于理解需求并推动技术方案落地</li>
          </ul>
        </div>

        <div class="about-section">
          <h2>我的爱好</h2>
          <p>我喜欢用爱好给生活“充电”：旅行保持好奇，爬山把注意力拉回脚下的节奏；而去摇滚现场看演出，让我把情绪交给灯光与合唱。</p>

          <div class="media-grid">
            <div class="media-card">
              <img :src="img1" alt="旅行图片" class="media-img">
              <div class="media-caption">旅行随拍：记录路上的光线与节奏</div>
            </div>

            <div class="media-card">
              <img :src="img2" alt="旅行图片" class="media-img">
              <div class="media-caption">旅行与徒步：把注意力留在脚下与远方</div>
            </div>

            <div class="media-card">
              <img :src="img3" alt="阅读图片" class="media-img">
              <div class="media-caption">阅读与写作补给：在书页里补能量</div>
            </div>

            <div class="media-card">
              <video :src="video3" controls class="media-video"></video>
              <div class="media-caption">摇滚现场：把情绪交给灯光与节奏</div>
            </div>

            <div class="media-card">
              <img :src="img4" alt="生活图片" class="media-img">
              <div class="media-caption">生活碎片：文字之外，也有自己的答案</div>
            </div>

            <div class="media-card">
              <img :src="img5" alt="旅行图片" class="media-img">
              <div class="media-caption">城市漫游：随走随记，随看随想</div>
            </div>

            <div class="media-card">
              <video :src="video6" controls class="media-video"></video>
              <div class="media-caption">第二段摇滚片段：把热烈留在当下</div>
            </div>
          </div>
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
import img1 from '@/assets/images/1.jpg'
import img2 from '@/assets/images/2.jpg'
import img3 from '@/assets/images/3.jpg'
import img4 from '@/assets/images/4.jpg'
import img5 from '@/assets/images/5.jpg'
import video3 from '@/assets/images/3.mp4'
import video6 from '@/assets/images/6.mp4'

export default {
  name: 'AboutView'
  ,
  data() {
    return {
      img1,
      img2,
      img3,
      img4,
      img5,
      video3,
      video6
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

.avatar-placeholder {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-black);
  border: 1px solid rgba(255, 255, 255, 0.2);
  margin: 0 auto;
}

.avatar-text {
  font-family: 'Ma Shan Zheng', cursive;
  font-size: 2.5rem;
  color: white;
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