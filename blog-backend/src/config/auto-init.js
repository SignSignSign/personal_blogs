/**
 * 启动时自动初始化（幂等）—— Render 首次部署时无数据库自动建表
 * 只在表不存在时 CREATE TABLE IF NOT EXISTS，永远不 DROP
 */
const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

function autoInit(dbFile) {
  const db = new Database(dbFile);
  db.pragma('foreign_keys = ON');

  const tables = db.prepare(
    `SELECT name FROM sqlite_master WHERE type='table' AND name IN ('users','categories','posts','comments','comment_likes','post_likes','favorites')`
  ).all();

  const existing = new Set(tables.map((t) => t.name));

  if (existing.has('users') && existing.has('posts')) {
    console.log('🗄️  数据库已存在，跳过自动初始化');
    db.close();
    return;
  }

  console.log('🌱 检测到空数据库，首次自动初始化...');

  // V1 基础表（IF NOT EXISTS，安全幂等）
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      avatar TEXT,
      created_at TEXT DEFAULT (datetime('now','localtime'))
    );

    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      description TEXT
    );

    CREATE TABLE IF NOT EXISTS posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      summary TEXT,
      cover TEXT,
      tags TEXT DEFAULT '[]',
      category TEXT,
      author_id INTEGER NOT NULL,
      views INTEGER DEFAULT 0,
      is_draft INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now','localtime')),
      updated_at TEXT DEFAULT (datetime('now','localtime')),
      FOREIGN KEY (author_id) REFERENCES users(id)
    );
  `);

  // V2 增量表
  db.exec(`
    CREATE TABLE IF NOT EXISTS comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      post_id INTEGER NOT NULL,
      author_id INTEGER NOT NULL,
      parent_id INTEGER DEFAULT 0,
      content TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now','localtime')),
      FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
      FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS comment_likes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      comment_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      UNIQUE(comment_id, user_id),
      FOREIGN KEY (comment_id) REFERENCES comments(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS post_likes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      post_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      UNIQUE(post_id, user_id),
      FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS favorites (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      post_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      UNIQUE(post_id, user_id),
      FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  // 分类种子（幂等）
  const seed = db.prepare('INSERT OR IGNORE INTO categories (name, description) VALUES (?, ?)');
  [
    ['随笔', '日常所思所想'],
    ['技术', '编程心得与技术笔记'],
    ['读书', '读书笔记与感悟'],
    ['旅行', '旅途见闻'],
    ['摄影', '光影与色彩'],
    ['未分类', '其他'],
  ].forEach(([n, d]) => seed.run(n, d));

  console.log('✅ 自动初始化完成（首次运行）');
  db.close();
}

module.exports = autoInit;
