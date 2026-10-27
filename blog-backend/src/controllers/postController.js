/**
 * V2 增强版 postController
 * — 原有逻辑全部保留，增量：is_draft 过滤、FTS5 全文搜索、点赞/收藏状态、阅读时长
 */
const { query, queryOne, exec, db } = require('../config/db');
const { ok, AppError } = require('../utils/response');

function parseTags(row) {
  try { return JSON.parse(row.tags || '[]'); } catch { return []; }
}
/** 简易阅读时长：中文按 400 字/分钟估算 */
function readingMinutes(content) {
  const chars = (content || '').replace(/\s+/g, '').length;
  return Math.max(1, Math.ceil(chars / 400));
}
/** 把列表/详情返回统一附加 like_count/favorite_count/is_liked/is_favorited */
function attachSocial(list, userId) {
  if (!list.length) return list;
  const ids = list.map((x) => x.id);
  const placeholders = ids.map(() => '?').join(',');
  const likes = db.prepare(`SELECT post_id, COUNT(*) AS n FROM post_likes WHERE post_id IN (${placeholders}) GROUP BY post_id`).all(...ids);
  const favs = db.prepare(`SELECT post_id, COUNT(*) AS n FROM favorites   WHERE post_id IN (${placeholders}) GROUP BY post_id`).all(...ids);
  let userLiked = [], userFav = [];
  if (userId) {
    userLiked = db.prepare(`SELECT post_id FROM post_likes WHERE user_id = ? AND post_id IN (${placeholders})`).all(userId, ...ids);
    userFav = db.prepare(`SELECT post_id FROM favorites   WHERE user_id = ? AND post_id IN (${placeholders})`).all(userId, ...ids);
  }
  const likeMap = Object.fromEntries(likes.map((l) => [l.post_id, l.n]));
  const favMap = Object.fromEntries(favs.map((l) => [l.post_id, l.n]));
  const likeIds = new Set(userLiked.map((l) => l.post_id));
  const favIds = new Set(userFav.map((l) => l.post_id));
  return list.map((x) => ({
    ...x,
    like_count: likeMap[x.id] || 0,
    favorite_count: favMap[x.id] || 0,
    is_liked: likeIds.has(x.id),
    is_favorited: favIds.has(x.id),
  }));
}

// ============== 原有接口（保留签名，增量增强） ==============

exports.create = async (req, res, next) => {
  try {
    const { title, content, category = '未分类', tags = [], cover = '', is_draft = 0 } = req.body || {};
    if (!title || !content) throw new AppError('标题和内容必填');
    if (title.length > 200) throw new AppError('标题过长（最多 200 字）');

    const r = exec(
      `INSERT INTO posts (title, content, cover, category, tags, author_id, is_draft) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [title, content, cover, category, JSON.stringify(Array.isArray(tags) ? tags : []), req.user.id, is_draft ? 1 : 0]
    );
    ok(res, { id: r.lastInsertRowid, is_draft: !!is_draft }, is_draft ? '已存为草稿' : '发布成功');
  } catch (e) { next(e); }
};

exports.list = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const pageSize = Math.min(50, Math.max(1, parseInt(req.query.pageSize) || 10));
    const category = req.query.category || '';
    const keyword = (req.query.keyword || '').trim();

    // 基础 where：只看已发布
    const where = ['p.is_draft = 0'];
    const params = [];
    if (category) { where.push('p.category = ?'); params.push(category); }

    let ftsIds = null;
    if (keyword) {
      // 尝试 FTS5，失败回退 LIKE
      try {
        const fts = db.prepare(
          `SELECT rowid FROM posts_fts WHERE posts_fts MATCH ? ORDER BY rank LIMIT 500`
        ).all(keyword);
        ftsIds = fts.map((r) => r.rowid);
      } catch { ftsIds = null; }
    }

    const whereSql = where.length ? 'WHERE ' + where.join(' AND ') : '';

    // 总数：如果用了 FTS，需要同时满足 where + fts
    let total = 0;
    let rows = [];

    if (keyword) {
      if (ftsIds) {
        // FTS 命中为空直接返回
        if (!ftsIds.length) {
          return ok(res, { list: [], total: 0, page, pageSize });
        }
        const ftsPh = ftsIds.map(() => '?').join(',');
        const totalRow = db.prepare(
          `SELECT COUNT(*) AS total FROM posts p ${whereSql} AND p.id IN (${ftsPh})`
        ).get(...params, ...ftsIds);
        total = totalRow.total;
        const offset = (page - 1) * pageSize;
        rows = db.prepare(
          `SELECT p.id, p.title, p.content, p.cover, p.category, p.tags,
                  p.author_id, p.views, p.created_at, p.updated_at,
                  u.username, u.avatar
           FROM posts p JOIN users u ON u.id = p.author_id
           ${whereSql} AND p.id IN (${ftsPh})
           ORDER BY p.created_at DESC LIMIT ? OFFSET ?`
        ).all(...params, ...ftsIds, pageSize, offset);
      } else {
        // 回退 LIKE
        where.push('(p.title LIKE ? OR p.content LIKE ?)');
        params.push(`%${keyword}%`, `%${keyword}%`);
        const ws = 'WHERE ' + where.join(' AND ');
        const tr = db.prepare(`SELECT COUNT(*) AS total FROM posts p ${ws}`).get(...params);
        total = tr.total;
        const offset = (page - 1) * pageSize;
        rows = db.prepare(
          `SELECT p.id, p.title, p.content, p.cover, p.category, p.tags,
                  p.author_id, p.views, p.created_at, p.updated_at,
                  u.username, u.avatar
           FROM posts p JOIN users u ON u.id = p.author_id
           ${ws}
           ORDER BY p.created_at DESC LIMIT ? OFFSET ?`
        ).all(...params, pageSize, offset);
      }
    } else {
      const totalRow = db.prepare(`SELECT COUNT(*) AS total FROM posts p ${whereSql}`).get(...params);
      total = totalRow.total;
      const offset = (page - 1) * pageSize;
      rows = db.prepare(
        `SELECT p.id, p.title, p.content, p.cover, p.category, p.tags,
                p.author_id, p.views, p.created_at, p.updated_at,
                u.username, u.avatar
         FROM posts p JOIN users u ON u.id = p.author_id
         ${whereSql}
         ORDER BY p.created_at DESC LIMIT ? OFFSET ?`
      ).all(...params, pageSize, offset);
    }

    // 组装基础对象
    let list = rows.map((r) => ({
      id: r.id, title: r.title, cover: r.cover, category: r.category,
      tags: parseTags(r), author_id: r.author_id,
      author: { id: r.author_id, username: r.username, avatar: r.avatar },
      views: r.views, created_at: r.created_at, updated_at: r.updated_at,
      summary: r.content.replace(/[#*`>\-\[\]()]/g, '').slice(0, 120),
      reading_time_min: readingMinutes(r.content),
    }));

    const userId = req.user?.id || null;
    list = attachSocial(list, userId);
    ok(res, { list, total, page, pageSize });
  } catch (e) { next(e); }
};

exports.detail = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!id) throw new AppError('文章 ID 无效');

    const row = queryOne(
      `SELECT p.*, u.username, u.avatar
       FROM posts p JOIN users u ON u.id = p.author_id
       WHERE p.id = ? LIMIT 1`,
      [id]
    );
    if (!row) throw new AppError('文章不存在', 404);
    // 草稿：只有作者本人能看
    if (row.is_draft === 1 && req.user?.id !== row.author_id) {
      throw new AppError('文章不存在', 404);
    }

    exec(`UPDATE posts SET views = views + 1 WHERE id = ?`, [id]);

    const post = {
      id: row.id, title: row.title, content: row.content, cover: row.cover,
      category: row.category, tags: parseTags(row),
      author_id: row.author_id,
      author: { id: row.author_id, username: row.username, avatar: row.avatar },
      views: row.views + 1,
      created_at: row.created_at, updated_at: row.updated_at,
      is_draft: row.is_draft === 1,
      reading_time_min: readingMinutes(row.content),
    };
    const enriched = attachSocial([post], req.user?.id || null);
    ok(res, enriched[0]);
  } catch (e) { next(e); }
};

exports.update = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const post = queryOne(`SELECT * FROM posts WHERE id = ?`, [id]);
    if (!post) throw new AppError('文章不存在', 404);
    if (post.author_id !== req.user.id) throw new AppError('只能编辑自己的文章', 403);

    const { title, content, category, tags, cover, is_draft } = req.body || {};
    const parts = [];
    const params = [];
    if (title !== undefined) {
      if (!title.trim()) throw new AppError('标题不能为空');
      parts.push('title = ?'); params.push(title);
    }
    if (content !== undefined) { parts.push('content = ?'); params.push(content); }
    if (category !== undefined) { parts.push('category = ?'); params.push(category); }
    if (tags !== undefined) {
      parts.push('tags = ?');
      params.push(JSON.stringify(Array.isArray(tags) ? tags : []));
    }
    if (cover !== undefined) { parts.push('cover = ?'); params.push(cover); }
    if (is_draft !== undefined) { parts.push('is_draft = ?'); params.push(is_draft ? 1 : 0); }
    if (!parts.length) throw new AppError('没有需要更新的字段');
    params.push(id);
    exec(`UPDATE posts SET ${parts.join(', ')} WHERE id = ?`, params);
    ok(res, null, '更新成功');
  } catch (e) { next(e); }
};

exports.remove = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const post = queryOne(`SELECT * FROM posts WHERE id = ?`, [id]);
    if (!post) throw new AppError('文章不存在', 404);
    if (post.author_id !== req.user.id) throw new AppError('只能删除自己的文章', 403);

    exec(`DELETE FROM posts WHERE id = ?`, [id]);
    ok(res, null, '删除成功');
  } catch (e) { next(e); }
};
