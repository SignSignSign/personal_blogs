/**
 * 全局错误处理中间件
 * 放在所有路由之后
 */
const { fail } = require('../utils/response');

// eslint-disable-next-line no-unused-vars
module.exports = function errorHandler(err, req, res, next) {
  console.error('[ERROR]', err.message);
  fail(res, err);
};
