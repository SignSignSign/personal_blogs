const { query, queryOne, exec } = require('../config/db');
const { ok, AppError } = require('../utils/response');

exports.toggle = async (req, res, next) => {
  try {
    const pid = Number(req.params.id);
    const post = queryOne(`SELECT id FROM posts WHERE id = ? AND is_draft = 0`, [pid]);
    if (!post) throw new AppError('文章不存在', 404);

    const existing = queryOne(
      `SELECT id FROM favorites WHERE post_id = ? AND user_id = ?`,
      [pid, req.user.id]
    );
    let favorited;
    if (existing) {
      exec(`DELETE FROM favorites WHERE id = ?`, [existing.id]);
      favorited = false;
    } else {
      exec(`INSERT INTO favorites (post_id, user_id) VALUES (?, ?)`, [pid, req.user.id]);
      favorited = true;
    }
    const countRow = queryOne(`SELECT COUNT(*) AS n FROM favorites WHERE post_id = ?`, [pid]);
    ok(res, { favorited, favorite_count: countRow.n });
  } catch (e) { next(e); }
};

exports.myList = async (req, res, next) => {
  try {
    const rows = query(
      `SELECT p.id, p.title, p.cover, p.category, p.tags, p.views, p.created_at, p.updated_at,
              u.username, u.avatar
       FROM favorites f
       JOIN posts p ON p.id = f.post_id
       JOIN users u ON u.id = p.author_id
       WHERE f.user_id = ? AND p.is_draft = 0
       ORDER BY f.created_at DESC`,
      [req.user.id]
    );
    const list = rows.map((r) => ({
      id: r.id, title: r.title, cover: r.cover, category: r.category,
      tags: (() => { try { return JSON.parse(r.tags || '[]'); } catch { return []; } })(),
      views: r.views, created_at: r.created_at, updated_at: r.updated_at,
      author: { username: r.username, avatar: r.avatar },
    }));
    ok(res, list);
  } catch (e) { next(e); }
};
