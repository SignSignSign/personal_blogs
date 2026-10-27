/**
 * V2 增量迁移脚本
 * 用法：node migrate-v2.js
 * 基于现有 blog.db 执行 migrate-v2.sql
 */
require('dotenv').config();
const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const DB_FILE = process.env.DB_FILE || path.join(__dirname, 'blog.db');

if (!fs.existsSync(DB_FILE)) {
  console.error('❌ 找不到数据库文件:', DB_FILE);
  console.error('   请先运行 npm run init-db 初始化 V1');
  process.exit(1);
}

console.log(`📦 连接: ${DB_FILE}`);
const db = new Database(DB_FILE);
db.pragma('foreign_keys = ON');

const sql = fs.readFileSync(path.join(__dirname, 'migrate-v2.sql'), 'utf-8');

try {
  db.exec(sql);
  console.log('✅ V2 迁移完成：');
  console.log('   + posts.is_draft');
  console.log('   + comments / comment_likes / post_likes / favorites');
  console.log('   + posts_fts (FTS5 全文搜索) + 同步触发器');
  console.log('');
  console.log('🎉 可以启动后端 npm run dev 了');
} catch (err) {
  console.error('❌ 迁移失败:', err.message);
  process.exit(1);
} finally {
  db.close();
}
