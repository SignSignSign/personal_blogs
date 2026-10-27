/**
 * 后端入口 — V2 已挂载新功能路由 + uploads 静态目录
 */
require('dotenv').config();

// === 首次启动自动建表（幂等） ===
const path = require('path');
const fs = require('fs');
const autoInit = require('./config/auto-init');
const dbFile = process.env.DB_FILE
  || (fs.existsSync('/data') ? '/data/blog.db' : path.join(__dirname, '..', 'blog.db'));
autoInit(dbFile);

const express = require('express');
const cors = require('cors');
const errorHandler = require('./middleware/error');

const app = express();

// === 中间件 ===
app.use(cors({ origin: process.env.CORS_ORIGIN || '*', credentials: true }));
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));

// === 静态：uploads 目录 ===
const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(__dirname, '..', 'uploads');
app.use('/uploads', express.static(UPLOAD_DIR));

// === 健康检查 ===
app.get('/api/health', (_req, res) => res.json({ ok: true, time: new Date().toISOString() }));

// === 原有路由（全部保留） ===
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/posts', require('./routes/postRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));

// === V2 新增路由 ===
app.use('/api/upload', require('./routes/uploadRoutes'));
app.use('/api/comments', require('./routes/commentRoutes'));
app.use('/api/likes', require('./routes/likeRoutes'));
app.use('/api/favorites', require('./routes/favoriteRoutes'));
app.use('/api/drafts', require('./routes/draftRoutes'));
app.use('/api/rss', require('./routes/rssRoutes'));
app.use('/api/archive', require('./routes/archiveRoutes'));

// === 404 ===
app.use((_req, res) => res.status(404).json({ code: 404, message: '接口不存在' }));

// === 全局错误处理 ===
app.use(errorHandler);

const PORT = Number(process.env.PORT) || 3000;
app.listen(PORT, () => {
  console.log(`🌿 Blog Backend 已启动: http://localhost:${PORT}`);
  console.log(`   上传目录: ${UPLOAD_DIR}`);
  console.log(`   RSS: http://localhost:${PORT}/api/rss`);
});
