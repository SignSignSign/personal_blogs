/**
 * JWT 身份校验中间件
 * 请求头 Authorization: Bearer <token>
 * 解析后挂载 req.user = { id, username }
 */
const jwt = require('jsonwebtoken');
const { AppError } = require('../utils/response');

module.exports = function authRequired(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return next(new AppError('未登录或 token 缺失', 401));

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id, username: decoded.username };
    next();
  } catch (e) {
    next(new AppError('token 已失效，请重新登录', 401));
  }
};
