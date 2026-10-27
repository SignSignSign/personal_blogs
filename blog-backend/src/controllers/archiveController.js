const { query, db } = require('../config/db');
const { ok } = require('../utils/response');

/**
 * 归档：按年份 / 月份分组聚合
 * GET /api/archive           → { years: [{ year, months:[{month, count}], total }] }
 * GET /api/archive/2026      → 该年所有已发布文章
 * GET /api/archive/2026/10   → 该年该月文章（month 1-12）
 */
exports.index = async (_req, res, next) => {
  try {
    const flat = db.prepare(`
      SELECT strftime('%Y', created_at) AS year,
             strftime('%m', created_at) AS month,
             COUNT(*) AS count
      FROM posts
      WHERE is_draft = 0
      GROUP BY year, month
      ORDER BY year DESC, month DESC
    `).all();

    const grouped = {};
    flat.forEach((r) => {
      if (!grouped[r.year]) grouped[r.year] = { year: r.year, months: [] };
      grouped[r.year].months.push({ month: Number(r.month), count: r.count });
    });
    const years = Object.values(grouped).map((y) => ({
      ...y,
      total: y.months.reduce((a, m) => a + m.count, 0),
    }));
    const totalRow = db.prepare(`SELECT COUNT(*) AS total FROM posts WHERE is_draft = 0`).get();
    ok(res, { years, total: totalRow.total });
  } catch (e) { next(e); }
};

exports.byYearMonth = async (req, res, next) => {
  try {
    const year = String(req.params.year);
    const month = req.params.month ? String(req.params.month).padStart(2, '0') : null;

    let sql = `SELECT id, title, cover, category, tags, views, created_at
               FROM posts WHERE is_draft = 0 AND strftime('%Y', created_at) = ?`;
    const params = [year];
    if (month) {
      sql += ` AND strftime('%m', created_at) = ?`;
      params.push(month);
    }
    sql += ` ORDER BY created_at DESC`;

    const rows = db.prepare(sql).all(...params);
    rows.forEach((r) => {
      try { r.tags = JSON.parse(r.tags || '[]'); } catch { r.tags = []; }
    });
    ok(res, rows);
  } catch (e) { next(e); }
};
