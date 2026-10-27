-- =======================================================
--  薄荷随笔 · V2 增量迁移脚本（SQLite 版本）
--  运行方式：node migrate-v2.js
--  或：       sqlite3 blog.db < migrate-v2.sql
-- =======================================================

PRAGMA foreign_keys = ON;

-- ===== 1. 原 posts 表新增字段 =====
-- is_draft：0=已发布  1=草稿
-- views 保留；新增 reads_count 累计阅读停留次数（可选）
ALTER TABLE posts ADD COLUMN is_draft INTEGER DEFAULT 0;

-- ===== 2. 评论表 =====
DROP TABLE IF EXISTS comments;
CREATE TABLE comments (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  post_id    INTEGER NOT NULL,
  author_id  INTEGER NOT NULL,
  parent_id  INTEGER DEFAULT 0,          -- 0=顶级评论；>0=回复某条评论
  content    TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now','localtime')),
  FOREIGN KEY (post_id)   REFERENCES posts(id) ON DELETE CASCADE,
  FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX idx_comments_post ON comments(post_id);
CREATE INDEX idx_comments_author ON comments(author_id);

-- ===== 3. 评论点赞表（一人一条评论只能点赞一次） =====
DROP TABLE IF EXISTS comment_likes;
CREATE TABLE comment_likes (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  comment_id INTEGER NOT NULL,
  user_id    INTEGER NOT NULL,
  created_at TEXT DEFAULT (datetime('now','localtime')),
  UNIQUE (comment_id, user_id),
  FOREIGN KEY (comment_id) REFERENCES comments(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id)    REFERENCES users(id) ON DELETE CASCADE
);

-- ===== 4. 文章点赞表（一人一篇文章只能点赞一次） =====
DROP TABLE IF EXISTS post_likes;
CREATE TABLE post_likes (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  post_id    INTEGER NOT NULL,
  user_id    INTEGER NOT NULL,
  created_at TEXT DEFAULT (datetime('now','localtime')),
  UNIQUE (post_id, user_id),
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX idx_post_likes_post ON post_likes(post_id);

-- ===== 5. 收藏表 =====
DROP TABLE IF EXISTS favorites;
CREATE TABLE favorites (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  post_id    INTEGER NOT NULL,
  user_id    INTEGER NOT NULL,
  created_at TEXT DEFAULT (datetime('now','localtime')),
  UNIQUE (post_id, user_id),
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX idx_favorites_user ON favorites(user_id);

-- ===== 6. SQLite FTS5 全文搜索虚表（替代 MySQL FULLTEXT） =====
DROP TABLE IF EXISTS posts_fts;
CREATE VIRTUAL TABLE posts_fts USING fts5(
  title,
  content,
  category,
  content='posts',
  content_rowid='id',
  tokenize='unicode61'
);

-- FTS5 同步触发器：posts 插入/更新/删除时自动同步 FTS
DROP TRIGGER IF EXISTS posts_ai;
CREATE TRIGGER posts_ai AFTER INSERT ON posts BEGIN
  INSERT INTO posts_fts(rowid, title, content, category)
  VALUES (new.id, new.title, new.content, new.category);
END;

DROP TRIGGER IF EXISTS posts_ad;
CREATE TRIGGER posts_ad AFTER DELETE ON posts BEGIN
  INSERT INTO posts_fts(posts_fts, rowid, title, content, category)
  VALUES ('delete', old.id, old.title, old.content, old.category);
END;

DROP TRIGGER IF EXISTS posts_au;
CREATE TRIGGER posts_au AFTER UPDATE ON posts BEGIN
  INSERT INTO posts_fts(posts_fts, rowid, title, content, category)
  VALUES ('delete', old.id, old.title, old.content, old.category);
  INSERT INTO posts_fts(rowid, title, content, category)
  VALUES (new.id, new.title, new.content, new.category);
END;

-- 把现有文章灌进 FTS（忽略草稿 is_draft=0）
INSERT OR IGNORE INTO posts_fts(rowid, title, content, category)
SELECT id, title, content, category FROM posts WHERE is_draft = 0;
