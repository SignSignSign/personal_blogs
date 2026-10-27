const { queryOne, exec } = require('../config/db');
const { ok, AppError } = require('../utils/response');

exports.getMe = async (req, res, next) => {
  try {
    const user = queryOne(
      `SELECT id, username, email, avatar, created_at FROM users WHERE id = ?`,
      [req.user.id]
    );
    if (!user) throw new AppError('用户不存在', 404);
    ok(res, user);
  } catch (e) { next(e); }
};

exports.updateMe = async (req, res, next) => {
  try {
    const { username, avatar } = req.body || {};
    const parts = [];
    const params = [];

    if (username !== undefined) {
      if (username.length < 3 || username.length > 20)
        throw new AppError('用户名需 3-20 个字符');
      const dup = queryOne(
        `SELECT id FROM users WHERE username = ? AND id != ? LIMIT 1`,
        [username, req.user.id]
      );
      if (dup) throw new AppError('用户名已被占用');
      parts.push('username = ?'); params.push(username);
    }
    if (avatar !== undefined) {
      parts.push('avatar = ?'); params.push(avatar);
    }

    if (!parts.length) throw new AppError('没有需要更新的字段');
    params.push(req.user.id);
    exec(`UPDATE users SET ${parts.join(', ')} WHERE id = ?`, params);

    const user = queryOne(
      `SELECT id, username, email, avatar, created_at FROM users WHERE id = ?`,
      [req.user.id]
    );
    ok(res, user, '更新成功');
  } catch (e) { next(e); }
};
