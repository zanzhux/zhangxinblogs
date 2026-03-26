-- 初始化数据库
CREATE DATABASE IF NOT EXISTS blog_system;
USE blog_system;

-- 创建用户表
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL,
    avatar VARCHAR(255),
    role ENUM('admin', 'author', 'user') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建文章表
CREATE TABLE IF NOT EXISTS articles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(50),
    user_id INT,
    cover_image VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 创建评论表
CREATE TABLE IF NOT EXISTS comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    article_id INT,
    user_id INT,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 创建点赞表
CREATE TABLE IF NOT EXISTS likes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    article_id INT,
    user_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY article_user (article_id, user_id),
    FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 创建标签表
CREATE TABLE IF NOT EXISTS tags (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建博客标签关联表
CREATE TABLE IF NOT EXISTS blog_tags (
    id INT AUTO_INCREMENT PRIMARY KEY,
    article_id INT,
    tag_name VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
    UNIQUE KEY article_tag (article_id, tag_name)
);

-- 创建作者用户（密码为author123的bcrypt哈希）
INSERT INTO users (username, email, password, role) 
SELECT '博主', 'author@blog.com', '$2a$10$jsR8bZ97Tl6x7AojayIm5.JrKCS31XGkiSJCaMQ/HcMpJ8T3jVYUm', 'author'
WHERE NOT EXISTS (SELECT * FROM users WHERE role = 'author');

-- 更新作者用户权限
UPDATE users SET role = 'author' WHERE email = 'author@blog.com';

-- 删除现有的管理员账户
DELETE FROM users WHERE role = 'admin';

-- 创建新的管理员账户（密码为123456的bcrypt哈希）
INSERT INTO users (username, email, password, role) 
VALUES ('admin', 'admin@admin.com', '$2a$10$32scFBofrMiaJ9Xz04GfL.CaOQjU.I/Q1WeVQqs0Y9swcSY6NT4y6', 'admin'); 