/* eslint-disable */
/**
 * 临时脚本：回滚 FTS5 + 触发器（用于开发调试）
 */
const Database = require('better-sqlite3');
const path = require('path');
const db = new Database(path.join(__dirname, 'blog.db'));
db.exec(`
DROP TRIGGER IF EXISTS posts_ai;
DROP TRIGGER IF EXISTS posts_ad;
DROP TRIGGER IF EXISTS posts_au;
DROP TABLE IF EXISTS posts_fts;
ALTER TABLE posts DROP COLUMN is_draft;
`);
console.log('rollback ok');
