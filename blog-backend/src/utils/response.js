/**
 * 全局响应格式 + 业务错误类
 */
class AppError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.status = status;
  }
}

const ok = (res, data = null, msg = 'ok') =>
  res.status(200).json({ code: 0, message: msg, data });

const fail = (res, err) => {
  const status = err instanceof AppError ? err.status : 500;
  const message = err instanceof AppError ? err.message : '服务器内部错误';
  return res.status(status).json({ code: status, message, data: null });
};

module.exports = { AppError, ok, fail };
