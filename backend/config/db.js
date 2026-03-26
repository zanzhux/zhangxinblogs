const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

// 确保环境变量加载
dotenv.config();

// 数据库配置信息
console.log('数据库配置信息:');
console.log('主机:', process.env.DB_HOST);
console.log('用户:', process.env.DB_USER);
console.log('密码是否存在:', !!process.env.DB_PASSWORD);
console.log('数据库名:', process.env.DB_NAME);

// 创建连接池
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'blog_system',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// 测试连接
async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('数据库连接成功');

        // 增加调试：检查users表
        try {
            const [users] = await connection.query('SELECT id, username, email, role FROM users');
            console.log('数据库中的用户:', users);
        } catch (err) {
            console.error('查询用户表错误:', err);
        }

        connection.release();
        return true;
    } catch (error) {
        console.error('数据库连接错误:', error);
        return false;
    }
}

// 初始化数据库（表结构已在SQL文件中定义）
async function initDatabase() {
    try {
        // 数据库结构已通过db/init.sql文件导入
        // 此函数仅测试数据库是否可访问
        const connection = await pool.getConnection();
        console.log('数据库可访问且已初始化');

        // 简单测试查询
        const [rows] = await connection.query('SHOW TABLES');
        console.log('数据库表:', rows.map(row => Object.values(row)[0]).join(', '));

        connection.release();
    } catch (error) {
        console.error('数据库初始化检查失败:', error);

        if (error.code === 'ER_BAD_DB_ERROR') {
            console.error('数据库不存在，请检查是否已运行初始化脚本 (db/import-db.js)');
        }
    }
}

module.exports = {
    pool,
    testConnection,
    initDatabase
};