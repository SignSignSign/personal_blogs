/**
 * 图片上传 Controller
 * 本地保存到 ./uploads，返回 /uploads/xxx 访问 URL
 * 校验：格式 jpg/png/webp/gif，大小 ≤ 5MB
 * 预留配置：UPLOAD_DIR / UPLOAD_MAX_SIZE / UPLOAD_ALLOWED_MIME
 */
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { ok, AppError } = require('../utils/response');

const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(__dirname, '..', '..', 'uploads');
const MAX_SIZE = Number(process.env.UPLOAD_MAX_SIZE) || 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME = (process.env.UPLOAD_ALLOWED_MIME || 'image/jpeg,image/png,image/webp,image/gif').split(',');

fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const base = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
    cb(null, `${base}${ext}`);
  },
});

const fileFilter = (_req, file, cb) => {
  if (!ALLOWED_MIME.includes(file.mimetype)) {
    return cb(new Error(`不支持的格式，仅允许 ${ALLOWED_MIME.join('/')}`));
  }
  cb(null, true);
};

const upload = multer({ storage, fileFilter, limits: { fileSize: MAX_SIZE } });

exports.uploadMw = upload.single('file');

exports.uploadHandler = (req, res, next) => {
  try {
    if (!req.file) throw new AppError('请选择文件');
    const url = `/uploads/${req.file.filename}`;
    ok(res, { url, filename: req.file.filename, size: req.file.size });
  } catch (e) { next(e); }
};

exports.uploadError = (err, _req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') return ok(res, null, '文件过大（最大 5MB）', 413);
  }
  if (err.message) return ok(res, null, err.message, 400);
  next(err);
};
