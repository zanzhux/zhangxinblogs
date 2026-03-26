<template>
  <div class="new-article">
    <div class="form-container card">
      <div class="form-header">
        <h1>发布新文章</h1>
        <p>管理员发布文章</p>
      </div>

      <form @submit.prevent="handleSubmit" v-if="!success">
        <div class="form-group">
          <label for="title">标题</label>
          <input type="text" id="title" v-model="article.title" required autocomplete="off">
        </div>

        <div class="form-group">
          <label for="content">内容</label>
          <textarea id="content" v-model="article.content" required autocomplete="off"></textarea>
        </div>

        <div class="form-group">
          <label for="tags">标签</label>
          <div class="tags-selection">
            <div class="tag-item" v-for="tag in availableTags" :key="tag"
              :class="{ 'selected': selectedTags.includes(tag) }" @click="toggleTag(tag)">
              {{ tag }}
            </div>
          </div>
        </div>

        <div class="form-group">
          <label for="coverImage">封面图片</label>
          <div class="image-upload-container">
            <div class="image-preview" v-if="imagePreview" @click="triggerFileUpload">
              <img :src="imagePreview" alt="文章封面预览" class="preview-img">
              <div class="image-overlay">
                <span>更换图片</span>
              </div>
            </div>
            <div v-else class="upload-placeholder" @click="triggerFileUpload">
              <span class="upload-icon">+</span>
              <span class="upload-text">点击上传封面图片</span>
            </div>
            <input type="file" ref="fileInput" @change="handleImageUpload" accept="image/*" class="file-input">
          </div>
          <div class="form-text">推荐尺寸: 1200 x 600 像素</div>
        </div>

        <div class="form-actions">
          <button type="button" @click="$router.go(-1)" class="btn btn-secondary">
            <span class="btn-icon">←</span> 取消
          </button>
          <button type="submit" class="btn btn-primary" :disabled="loading">
            <span v-if="loading" class="btn-loader"></span>
            {{ loading ? '发布中...' : '发布文章' }}
          </button>
        </div>
      </form>

      <div v-if="success" class="new-article-options">
        <button @click="resetForm" class="btn btn-primary">
          写新文章
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'NewArticleView',
  computed: {
    currentUser() {
      return this.$store.getters.currentUser;
    },
    isAdmin() {
      return this.$store.getters.isAdmin;
    }
  },
  data() {
    return {
      article: {
        title: '',
        content: '',
        tags: []
      },
      selectedTags: [],
      availableTags: ['摇滚音乐', '文学', '电影', '旅行', '摄影', '生活随笔', '艺术', '哲学'],
      loading: false,
      error: null,
      success: null,
      createdArticleId: null,
      imageFile: null,
      imagePreview: null
    }
  },
  created() {
    console.log('Component created - Current user:', this.currentUser);
    console.log('Component created - Is admin:', this.isAdmin);
    console.log('Component created - Token:', localStorage.getItem('token'));
  },
  methods: {
    toggleTag(tag) {
      const index = this.selectedTags.indexOf(tag);
      if (index === -1) {
        // 添加标签
        this.selectedTags.push(tag);
      } else {
        // 移除标签
        this.selectedTags.splice(index, 1);
      }
      // 更新 article.tags
      this.article.tags = this.selectedTags;
    },
    async handleSubmit() {
      try {
        if (!this.article.title?.trim()) {
          this.error = '请输入文章标题';
          return;
        }

        if (!this.article.content?.trim()) {
          this.error = '请输入文章内容';
          return;
        }

        if (this.selectedTags.length === 0) {
          this.error = '请至少选择一个标签';
          return;
        }

        this.loading = true;
        this.error = null;

        const articleData = {
          title: this.article.title.trim(),
          content: this.article.content.trim(),
          category: this.selectedTags[0],
          tags: this.selectedTags,
          author: {
            username: '张鑫',
            nickname: '张鑫'
          }
        };

        if (this.imageFile) {
          try {
            articleData.cover_image = await this.processImageUpload();
          } catch (error) {
            this.error = error.message || '图片处理失败，请重试';
            this.loading = false;
            return;
          }
        }

        console.log('Sending request to server...');
        const response = await this.$axios.post('/articles', articleData);

        if (response.data && response.data.article) {
          this.success = '文章发布成功！';
          setTimeout(() => {
            this.$router.push('/admin/articles');
          }, 1500);
        } else {
          throw new Error('服务器响应格式错误');
        }
      } catch (error) {
        console.error('=== Article Submission Error ===');
        console.error('Error type:', error.name);
        console.error('Error message:', error.message);
        console.error('Server error response:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data
        });

        this.error = error.response?.data?.error || error.message || '发布文章失败，请重试';
      } finally {
        this.loading = false;
      }
    },
    triggerFileUpload() {
      this.$refs.fileInput.click();
    },
    async handleImageUpload(event) {
      const file = event.target.files[0];
      if (!file) return;

      // 验证文件类型
      if (!file.type.startsWith('image/')) {
        this.error = '请选择图片文件';
        return;
      }

      // 验证文件大小（50MB）
      const MAX_SIZE = 50 * 1024 * 1024; // 50MB
      if (file.size > MAX_SIZE) {
        this.error = '图片大小不能超过50MB';
        return;
      }

      try {
        this.loading = true;
        this.error = null;

        // 读取并压缩图片
        const compressedImage = await this.compressImage(file);
        this.imageFile = file;
        this.imagePreview = compressedImage;
      } catch (error) {
        console.error('图片处理错误:', error);
        this.error = '图片处理失败，请重试';
      } finally {
        this.loading = false;
      }
    },
    compressImage(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (e) => {
          const img = new Image();
          img.src = e.target.result;
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            // 计算压缩后的尺寸，保持宽高比
            let { width, height } = img;
            const maxWidth = 1200;
            const maxHeight = 800;

            // 如果图片超过最大尺寸，按比例缩小
            if (width > height) {
              if (width > maxWidth) {
                height = Math.round((height * maxWidth) / width);
                width = maxWidth;
              }
            } else {
              if (height > maxHeight) {
                width = Math.round((width * maxHeight) / height);
                height = maxHeight;
              }
            }

            // 设置画布尺寸
            canvas.width = width;
            canvas.height = height;

            // 绘制图片（添加白色背景）
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, width, height);
            ctx.drawImage(img, 0, 0, width, height);

            // 转换为base64，使用较低的质量
            let quality = 0.7;
            let compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
            let iterations = 0;
            const maxSize = 1024 * 1024; // 1MB

            // 如果图片仍然太大，继续压缩
            while (compressedDataUrl.length > maxSize && iterations < 3) {
              quality *= 0.7;
              compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
              iterations++;
            }

            console.log('Image compression complete:', {
              originalSize: file.size,
              compressedSize: compressedDataUrl.length,
              quality,
              dimensions: `${width}x${height}`,
              iterations
            });

            resolve(compressedDataUrl);
          };
          img.onerror = (error) => {
            console.error('Image loading error:', error);
            reject(new Error('图片加载失败'));
          };
        };
        reader.onerror = (error) => {
          console.error('File reading error:', error);
          reject(new Error('文件读取失败'));
        };
      });
    },
    async processImageUpload() {
      if (!this.imageFile) return null;

      try {
        console.log('Processing image:', {
          fileName: this.imageFile.name,
          fileSize: this.imageFile.size,
          fileType: this.imageFile.type,
          dimensions: `${this.imageFile.width}x${this.imageFile.height}`
        });

        const compressedImage = await this.compressImage(this.imageFile);

        // 验证压缩后的大小
        if (compressedImage.length > 2 * 1024 * 1024) { // 2MB
          throw new Error('图片太大，请选择更小的图片或降低图片质量');
        }

        return compressedImage;
      } catch (error) {
        console.error('Image processing error:', error);
        throw new Error(error.message || '图片处理失败');
      }
    },
    viewArticle(id) {
      this.$router.push(`/article/${id}`);
    },
    goToHomePage() {
      this.$router.push('/');
    },
    resetForm() {
      this.article = {
        title: '',
        content: '',
        tags: []
      };
      this.selectedTags = [];
      this.imageFile = null;
      this.imagePreview = null;
      this.success = null;
      this.error = null;
      this.createdArticleId = null;
    }
  }
}
</script>

<style scoped>
.new-article {
  display: flex;
  justify-content: center;
  padding: 2rem 0;
}

.form-container {
  width: 100%;
  max-width: 900px;
  padding: 2.5rem;
  background-color: rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.form-header {
  margin-bottom: 2rem;
  text-align: center;
  position: relative;
}

.form-header h1 {
  font-family: 'Ma Shan Zheng', cursive;
  font-size: 2.5rem;
  margin-bottom: 0.8rem;
  font-weight: normal;
  letter-spacing: 0.05em;
}

.form-header h1::after {
  content: "";
  display: block;
  width: 60px;
  height: 1px;
  background: rgba(255, 255, 255, 0.2);
  margin: 0.5rem auto 0;
}

.form-header p {
  opacity: 0.8;
  font-size: 1rem;
  font-family: 'Noto Serif SC', serif;
  letter-spacing: 0.02em;
}

.form-group {
  margin-bottom: 1.8rem;
}

label {
  display: block;
  margin-bottom: 0.8rem;
  font-weight: normal;
  font-family: 'Ma Shan Zheng', cursive;
  font-size: 1.3rem;
  letter-spacing: 0.02em;
}

.form-control {
  width: 100%;
  padding: 0.8rem 1rem;
  font-size: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background-color: rgba(0, 0, 0, 0.2);
  color: rgba(255, 255, 255, 0.9);
  transition: all 0.3s;
}

.form-control:focus {
  border-color: rgba(255, 255, 255, 0.3);
  outline: none;
}

.content-textarea {
  resize: vertical;
  min-height: 300px;
  line-height: 1.7;
  font-family: 'Noto Serif SC', serif;
  letter-spacing: 0.01em;
}

.form-text {
  margin-top: 0.5rem;
  font-size: 0.85rem;
  opacity: 0.7;
  font-style: italic;
}

.form-actions {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  margin-top: 2.5rem;
}

.btn {
  padding: 0.7rem 1.8rem;
  display: flex;
  align-items: center;
  background-color: var(--color-black);
  color: var(--color-light);
  border: 1px solid rgba(255, 255, 255, 0.1);
  font-family: 'Noto Serif SC', serif;
  letter-spacing: 0.05em;
  transition: var(--transition);
}

.btn:hover {
  background-color: rgba(0, 0, 0, 0.7);
}

.btn-secondary {
  background-color: rgba(0, 0, 0, 0.3);
}

.btn-icon {
  margin-right: 6px;
}

.btn-loader {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s linear infinite;
  margin-right: 8px;
}

.alert {
  padding: 1rem;
  margin-bottom: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background-color: rgba(255, 0, 0, 0.1);
  color: #ff6b6b;
  text-align: center;
}

.alert-success {
  background-color: rgba(46, 204, 113, 0.1);
  color: #2ecc71;
  border: 1px solid rgba(46, 204, 113, 0.2);
}

.success-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 1.5rem;
}

.btn-outline {
  background-color: transparent;
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: rgba(255, 255, 255, 0.9);
  padding: 0.5rem 1.2rem;
  transition: all 0.3s;
}

.btn-outline:hover {
  background-color: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.5);
}

.new-article-options {
  display: flex;
  justify-content: center;
  margin-top: 2rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 768px) {
  .form-container {
    padding: 1.5rem;
  }

  .form-header h1 {
    font-size: 2rem;
  }

  .content-textarea {
    min-height: 200px;
  }

  .form-actions {
    flex-direction: column;
  }
}

.tags-selection {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 10px;
}

.tag-item {
  padding: 8px 16px;
  border-radius: 20px;
  background-color: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.8);
}

.tag-item:hover {
  background-color: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.3);
}

.tag-item.selected {
  background-color: var(--color-primary);
  border-color: var(--color-primary);
  color: white;
}

/* 图片上传样式 */
.image-upload-container {
  margin-bottom: 1rem;
}

.image-preview,
.upload-placeholder {
  width: 100%;
  height: 200px;
  border: 2px dashed rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  overflow: hidden;
  position: relative;
}

.image-preview:hover,
.upload-placeholder:hover {
  border-color: rgba(255, 255, 255, 0.4);
  background-color: rgba(255, 255, 255, 0.05);
}

.preview-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.image-preview:hover .image-overlay {
  opacity: 1;
}

.upload-icon {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  color: rgba(255, 255, 255, 0.5);
}

.upload-text {
  color: rgba(255, 255, 255, 0.7);
}

.file-input {
  display: none;
}
</style>