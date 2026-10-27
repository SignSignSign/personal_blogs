const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { queryOne, exec } = require('../config/db');
const { ok, AppError } = require('../utils/response');

function pickUser(row) {
  if (!row) return null;
  const { password, ...rest } = row;
  return rest;
}

exports.register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body || {};

    if (!username || username.length < 3 || username.length > 20)
      throw new AppError('用户名需 3-20 个字符');
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      throw new AppError('邮箱格式不正确');
    if (!password || password.length < 6)
      throw new AppError('密码至少 6 位');

    // 查重
    const dup = queryOne(
      `SELECT id FROM users WHERE username = ? OR email = ? LIMIT 1`,
      [username, email]
    );
    if (dup) throw new AppError('用户名或邮箱已被注册');

    const hash = await bcrypt.hash(password, 10);
    const r = exec(
      `INSERT INTO users (username, email, password) VALUES (?, ?, ?)`,
      [username, email, hash]
    );

    const user = queryOne(`SELECT * FROM users WHERE id = ?`, [r.lastInsertRowid]);
    return ok(res, pickUser(user), '注册成功');
  } catch (e) { next(e); }
};

exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) throw new AppError('用户名和密码必填');

    const user = queryOne(`SELECT * FROM users WHERE username = ? LIMIT 1`, [username]);
    if (!user) throw new AppError('用户名或密码错误', 401);

    const match = await bcrypt.compare(password, user.password);
    if (!match) throw new AppError('用户名或密码错误', 401);

    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    return ok(res, { token, user: pickUser(user) }, '登录成功');
  } catch (e) { next(e); }
};
