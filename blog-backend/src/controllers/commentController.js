const { query, queryOne, exec } = require('../config/db');
const { ok, AppError } = require('../utils/response');

/** 递归解析扁平评论为嵌套树 */
function buildTree(flat) {
  const map = new Map();
  flat.forEach((c) => map.set(c.id, { ...c, children: [] }));
  const roots = [];
  map.forEach((node) => {
    if (node.parent_id && node.parent_id > 0) {
      const p = map.get(node.parent_id);
      if (p) p.children.push(node);
    } else {
      roots.push(node);
    }
  });
  // 按 id 升序（时间先后）
  const sort = (arr) => arr.sort((a, b) => a.id - b.id).forEach((n) => sort(n.children));
  sort(roots);
  return roots;
}

/** 给每条评论附加 like_count + liked_by_me */
function enrich(comments, userId) {
  comments.forEach((c) => {
    const likes = query(
      `SELECT user_id FROM comment_likes WHERE comment_id = ?`,
      [c.id]
    );
    c.like_count = likes.length;
    c.liked_by_me = userId ? likes.some((l) => l.user_id === userId) : false;
    enrich(c.children, userId);
  });
}

exports.create = async (req, res, next) => {
  try {
    const { post_id, content, parent_id = 0 } = req.body || {};
    const pid = Number(post_id);
    if (!pid) throw new AppError('文章 ID 无效');
    if (!content || !content.trim()) throw new AppError('评论内容不能为空');
    if (content.length > 1000) throw new AppError('评论最多 1000 字');

    const post = queryOne(`SELECT id, author_id FROM posts WHERE id = ?`, [pid]);
    if (!post) throw new AppError('文章不存在', 404);

    // 校验 parent_id 属于该文章
    if (parent_id > 0) {
      const p = queryOne(`SELECT id, post_id FROM comments WHERE id = ?`, [parent_id]);
      if (!p || p.post_id !== pid) throw new AppError('回复目标评论不存在');
    }

    const r = exec(
      `INSERT INTO comments (post_id, author_id, parent_id, content) VALUES (?, ?, ?, ?)`,
      [pid, req.user.id, parent_id, content.trim()]
    );
    ok(res, { id: r.lastInsertRowid }, '评论成功');
  } catch (e) { next(e); }
};

exports.remove = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const c = queryOne(`SELECT c.*, p.author_id AS post_author_id FROM comments c JOIN posts p ON p.id = c.post_id WHERE c.id = ?`, [id]);
    if (!c) throw new AppError('评论不存在', 404);
    if (c.author_id !== req.user.id && c.post_author_id !== req.user.id) {
      throw new AppError('无权删除此评论', 403);
    }
    exec(`DELETE FROM comments WHERE id = ?`, [id]);
    ok(res, null, '已删除');
  } catch (e) { next(e); }
};

exports.listByPost = async (req, res, next) => {
  try {
    const pid = Number(req.params.postId);
    const flat = query(
      `SELECT c.id, c.post_id, c.author_id, c.parent_id, c.content, c.created_at,
              u.username, u.avatar
       FROM comments c JOIN users u ON u.id = c.author_id
       WHERE c.post_id = ?
       ORDER BY c.id ASC`,
      [pid]
    );
    // 附加 author 对象
    flat.forEach((c) => {
      c.author = { id: c.author_id, username: c.username, avatar: c.avatar };
      delete c.username; delete c.avatar;
    });
    const tree = buildTree(flat);
    const userId = req.user?.id || null;
    enrich(tree, userId);
    ok(res, tree);
  } catch (e) { next(e); }
};

exports.toggleLike = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const c = queryOne(`SELECT id FROM comments WHERE id = ?`, [id]);
    if (!c) throw new AppError('评论不存在', 404);

    const existing = queryOne(
      `SELECT id FROM comment_likes WHERE comment_id = ? AND user_id = ?`,
      [id, req.user.id]
    );
    let liked;
    if (existing) {
      exec(`DELETE FROM comment_likes WHERE id = ?`, [existing.id]);
      liked = false;
    } else {
      exec(`INSERT INTO comment_likes (comment_id, user_id) VALUES (?, ?)`, [id, req.user.id]);
      liked = true;
    }
    const countRow = queryOne(`SELECT COUNT(*) AS n FROM comment_likes WHERE comment_id = ?`, [id]);
    ok(res, { liked, like_count: countRow.n });
  } catch (e) { next(e); }
};
