const { queryOne, exec } = require('../config/db');
const { ok, AppError } = require('../utils/response');

exports.toggle = async (req, res, next) => {
  try {
    const pid = Number(req.params.id);
    const post = queryOne(`SELECT id FROM posts WHERE id = ? AND is_draft = 0`, [pid]);
    if (!post) throw new AppError('文章不存在', 404);

    const existing = queryOne(
      `SELECT id FROM post_likes WHERE post_id = ? AND user_id = ?`,
      [pid, req.user.id]
    );
    let liked;
    if (existing) {
      exec(`DELETE FROM post_likes WHERE id = ?`, [existing.id]);
      liked = false;
    } else {
      exec(`INSERT INTO post_likes (post_id, user_id) VALUES (?, ?)`, [pid, req.user.id]);
      liked = true;
    }
    const countRow = queryOne(`SELECT COUNT(*) AS n FROM post_likes WHERE post_id = ?`, [pid]);
    ok(res, { liked, like_count: countRow.n });
  } catch (e) { next(e); }
};
