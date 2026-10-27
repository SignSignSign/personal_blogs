const { query } = require('../config/db');
const { ok } = require('../utils/response');

exports.list = async (_req, res, next) => {
  try {
    const rows = query(`SELECT id, name, description FROM categories ORDER BY id ASC`);
    ok(res, rows);
  } catch (e) { next(e); }
};
