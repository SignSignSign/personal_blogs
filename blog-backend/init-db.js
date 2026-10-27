/**
 * SQLite 自动初始化脚本（V1 + V2 全量）
 * 用法：node init-db.js
 * — 会清空重建数据库，同时创建 V1 基础表 + V2 增量表 + FTS5 全文搜索
 */
require('dotenv').config();
const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const DB_FILE = process.env.DB_FILE || path.join(__dirname, 'blog.db');

console.log(`📦 使用数据库文件: ${DB_FILE}`);

// 如果已存在先备份/删除，确保干净初始化
if (fs.existsSync(DB_FILE)) {
  fs.unlinkSync(DB_FILE);
  ['-wal', '-shm', '-journal'].forEach((s) => {
    const p = DB_FILE + s;
    if (fs.existsSync(p)) fs.unlinkSync(p);
  });
  console.log('✅ 旧数据库已清理');
}

const db = new Database(DB_FILE);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// 1. 基础表
db.exec(fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8'));
console.log('✅ V1 基础表已创建');

// 2. V2 增量（先 DROP 了 V2 新增表，然后重建 + ALTER + FTS）
db.exec(fs.readFileSync(path.join(__dirname, 'migrate-v2.sql'), 'utf-8'));
console.log('✅ V2 增量表 / FTS5 全文搜索已创建');

// 3. 分类种子
const insertCat = db.prepare(
  `INSERT OR IGNORE INTO categories (name, description) VALUES (?, ?)`
);
[
  ['随笔', '日常碎碎念、生活感悟'],
  ['技术', '前端开发、后端、算法笔记'],
  ['读书', '阅读摘录、读书笔记'],
  ['旅行', '游记、旅途见闻'],
  ['摄影', '光影、构图、镜头下的世界'],
  ['未分类', '暂未归类的文章'],
].forEach(([n, d]) => insertCat.run(n, d));
console.log('✅ 分类种子数据已初始化');

db.close();
console.log('🎉 数据库初始化完成！可以启动后端服务了。');
