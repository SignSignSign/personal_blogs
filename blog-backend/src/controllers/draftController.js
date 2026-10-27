const { query, queryOne, exec } = require('../config/db');
const { ok, AppError } = require('../utils/response');

/**
 * 仅列出当前用户的草稿
 */
exports.listMine = async (req, res, next) => {
  try {
    const rows = query(
      `SELECT id, title, category, tags, views, created_at, updated_at
       FROM posts
       WHERE author_id = ? AND is_draft = 1
       ORDER BY updated_at DESC`,
      [req.user.id]
    );
    rows.forEach((r) => {
      try { r.tags = JSON.parse(r.tags || '[]'); } catch { r.tags = []; }
    });
    ok(res, rows);
  } catch (e) { next(e); }
};

/**
 * 保存为草稿（新文章直接写 is_draft=1；现有文章可选转草稿）
 */
exports.saveDraft = async (req, res, next) => {
  try {
    const { id, title, content, category = '未分类', tags = [], cover = '' } = req.body || {};
    if (!title || !content) throw new AppError('标题和内容不能为空');

    if (id) {
      // 更新已有文章为草稿
      const existing = queryOne(`SELECT * FROM posts WHERE id = ?`, [Number(id)]);
      if (!existing) throw new AppError('文章不存在', 404);
      if (existing.author_id !== req.user.id) throw new AppError('无权操作', 403);
      exec(
        `UPDATE posts SET title=?, content=?, category=?, tags=?, cover=?, is_draft=1 WHERE id=?`,
        [title, content, category, JSON.stringify(Array.isArray(tags) ? tags : []), cover, Number(id)]
      );
      ok(res, { id: Number(id) }, '已存为草稿');
    } else {
      const r = exec(
        `INSERT INTO posts (title, content, category, tags, cover, author_id, is_draft)
         VALUES (?, ?, ?, ?, ?, ?, 1)`,
        [title, content, category, JSON.stringify(Array.isArray(tags) ? tags : []), cover, req.user.id]
      );
      ok(res, { id: r.lastInsertRowid }, '已存为草稿');
    }
  } catch (e) { next(e); }
};

/**
 * 发布草稿：is_draft → 0
 */
exports.publish = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const p = queryOne(`SELECT * FROM posts WHERE id = ?`, [id]);
    if (!p) throw new AppError('文章不存在', 404);
    if (p.author_id !== req.user.id) throw new AppError('无权操作', 403);
    exec(`UPDATE posts SET is_draft = 0 WHERE id = ?`, [id]);
    ok(res, null, '已发布');
  } catch (e) { next(e); }
};
