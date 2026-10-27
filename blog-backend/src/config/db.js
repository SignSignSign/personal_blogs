/**
 * SQLite 连接（better-sqlite3）
 * 文件路径由环境变量 DB_FILE 指定，默认 ./blog.db
 */
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Render 持久化磁盘默认挂 /data，优先使用；否则回退项目根
const DB_FILE = process.env.DB_FILE
  || (fs.existsSync('/data') ? '/data/blog.db' : path.join(__dirname, '..', '..', 'blog.db'));
// 确保目录存在
fs.mkdirSync(path.dirname(DB_FILE), { recursive: true });

const db = new Database(DB_FILE);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

/**
 * 执行查询，返回全部行
 */
function query(sql, params = []) {
  return db.prepare(sql).all(...(Array.isArray(params) ? params : [params]));
}

/**
 * 执行查询，返回第一行（或 undefined）
 */
function queryOne(sql, params = []) {
  return db.prepare(sql).get(...(Array.isArray(params) ? params : [params]));
}

/**
 * 执行 INSERT/UPDATE/DELETE，返回 { changes, lastInsertRowid }
 */
function exec(sql, params = []) {
  return db.prepare(sql).run(...(Array.isArray(params) ? params : [params]));
}

module.exports = { db, query, queryOne, exec };
