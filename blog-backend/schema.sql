-- SQLite 建表脚本
PRAGMA foreign_keys = ON;

DROP TABLE IF EXISTS posts;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  username   TEXT NOT NULL UNIQUE,
  email      TEXT NOT NULL UNIQUE,
  password   TEXT NOT NULL,
  avatar     TEXT,
  created_at TEXT DEFAULT (datetime('now','localtime'))
);

CREATE TABLE categories (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT NOT NULL UNIQUE,
  description TEXT
);

CREATE TABLE posts (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  title      TEXT NOT NULL,
  content    TEXT NOT NULL,
  cover      TEXT,
  category   TEXT DEFAULT '未分类',
  tags       TEXT DEFAULT '[]',          -- JSON 字符串存储
  author_id  INTEGER NOT NULL,
  views      INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now','localtime')),
  updated_at TEXT DEFAULT (datetime('now','localtime')),
  FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
);

-- posts.updated_at 自动更新触发器
DROP TRIGGER IF EXISTS posts_update_trigger;
CREATE TRIGGER posts_update_trigger AFTER UPDATE ON posts FOR EACH ROW
BEGIN
  UPDATE posts SET updated_at = datetime('now','localtime') WHERE id = NEW.id;
END;

CREATE INDEX idx_posts_author   ON posts(author_id);
CREATE INDEX idx_posts_category ON posts(category);
CREATE INDEX idx_posts_views    ON posts(views);
