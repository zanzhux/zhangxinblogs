const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');
const dotenv = require('dotenv');

// 加载环境变量
dotenv.config();

async function importDatabase() {
    console.log('开始导入数据库...');

    // 读取SQL文件内容
    const sqlFilePath = path.join(__dirname, 'init.sql');
    let sqlContent;

    try {
        sqlContent = await fs.readFile(sqlFilePath, 'utf8');
        console.log('已读取SQL文件');
    } catch (error) {
        console.error('读取SQL文件失败:', error);
        process.exit(1);
    }

    // 数据库连接参数
    const dbConfig = {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        multipleStatements: true // 允许执行多条SQL语句
    };

    // 连接数据库
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log('已连接到MySQL服务器');
    } catch (error) {
        console.error('连接到MySQL失败:', error);
        process.exit(1);
    }

    // 执行SQL语句
    try {
        await connection.query(sqlContent);
        console.log('数据库初始化成功');
    } catch (error) {
        console.error('执行SQL脚本失败:', error);
    } finally {
        if (connection) {
            await connection.end();
            console.log('数据库连接已关闭');
        }
    }
}

// 执行导入
importDatabase().catch(err => {
    console.error('导入过程中发生错误:', err);
    process.exit(1);
});