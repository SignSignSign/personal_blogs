# 薄荷随笔 🌿 · 个人博客系统

> 绿色清新文艺风 + 暗黑模式 / React+TS+Vite+Tailwind · Node.js+Express+SQLite+JWT

---

## 📁 项目结构

```
个人博客/
├── database.md               # 数据库设计文档（MySQL 版参考）
├── PRD.md                    # 产品需求文档
├── README.md                 # 启动说明（本文件）
├── blog-backend/             # 后端
│   ├── blog.db               # SQLite 数据库文件（首次运行后生成）
│   ├── uploads/              # 图片上传目录（首次运行后生成）
│   ├── schema.sql            # V1 基础表：users/categories/posts
│   ├── migrate-v2.sql        # V2 增量：草稿/is_draft + 评论 + 点赞 + 收藏 + FTS5
│   ├── init-db.js            # 全新初始化（V1+V2 一起建）
│   ├── migrate-v2.js         # 基于现有 blog.db 执行 V2 升级
│   ├── src/
│   │   ├── app.js                # 入口（所有路由挂载点）
│   │   ├── config/db.js          # SQLite 连接（better-sqlite3）
│   │   ├── middleware/           # JWT 鉴权 / 全局错误
│   │   ├── routes/               # 10 个路由模块
│   │   ├── controllers/          # 10 个 controller
│   │   └── utils/response.js
│   └── package.json
└── blog-frontend/            # 前端
    ├── src/
    │   ├── App.tsx               # 路由总入口（已包 ThemeProvider）
    │   ├── index.css             # Tailwind + 薄荷绿主题 + 暗黑适配
    │   ├── context/              # AuthContext + ThemeContext
    │   ├── components/          # Navbar/Layout/Card/ThemeToggle/Progress/TOC/Like/Fav/Comment/ImageUploader...
    │   ├── pages/                # Home/PostDetail/WritePost/Profile/Login/Register/Archive
    │   ├── utils/api.ts          # 全部接口封装（V1+V2 共 20+ 函数）
    │   └── types.ts
    ├── tailwind.config.js        # darkMode: 'class' + mint 全色阶
    ├── vite.config.ts            # 代理 /api → localhost:3000
    └── package.json
```

---

## 🚀 快速启动

### 1. 环境准备
- Node.js ≥ 18
- 后端数据库：**SQLite**（零配置，文件自动生成）

### 2. 后端启动

```bash
cd blog-backend

# ① 安装依赖（仅首次）
npm install

# ② 配置环境变量
cp .env.example .env
# 编辑 .env，重点改 JWT_SECRET（随便一段长字符串）

# ③ 初始化数据库（全新项目）
npm run init-db
# 或：已有 blog.db 只升 V2
# node migrate-v2.js

# ④ 启动开发服务
npm run dev
# → http://localhost:3000
#   /api/health        健康检查
#   /api/rss           RSS 订阅
#   /uploads/*         静态图片
```

### 3. 前端启动

```bash
cd blog-frontend

# ① 安装依赖
npm install

# ② 启动开发服务
npm run dev
# → http://localhost:5173
#   已自动代理 /api → http://localhost:3000

# ③ 打包生产
npm run build
npm run preview
```

---

## ✨ 功能清单

### V1 基础功能
| 模块 | 功能 | 状态 |
|---|---|---|
| 用户 | 注册（用户名 3–20 / 邮箱唯一 / bcrypt） · 登录（JWT 7 天） · 个人中心资料编辑 | ✅ |
| 文章 | 发布 · 编辑 · 删除（仅作者） · 详情（views+1） · 列表（分页 + 分类筛选 + 搜索） | ✅ |
| 分类 | 6 条种子分类数据 | ✅ |

### V2 新增功能

| 功能 | 说明 | 状态 |
|---|---|---|
| 📝 **文章草稿** | is_draft 字段 · 写文章页"保存草稿"按钮 · 个人中心草稿列表 · 发布草稿 | ✅ |
| 🖼️ **图片上传** | multer 本地保存 · jpg/png/webp/gif ≤ 5MB · Markdown 编辑器粘贴/拖拽自动上传 · 封面上传组件 | ✅ |
| 📖 **阅读进度 + 目录导航** | 固定顶部细横条 · 右侧悬浮目录 · h1–h3 自动扫描 · 移动端自动收起 | ✅ |
| ⏱️ **阅读时长预估** | 中文 400 字/分钟估算 · 卡片/详情页展示 "⏱️ X min read" | ✅ |
| ❤️ **文章点赞** | 一人一次 · 切换状态 · 列表/详情/接口返回 count | ✅ |
| ⭐ **收藏** | 切换收藏 · 个人中心"我的收藏"Tab | ✅ |
| 💬 **评论 + 楼中楼回复** | 嵌套树结构 · 评论点赞 · 作者/文章作者双维度删除权限 | ✅ |
| 📚 **归档时间轴** | `/archive` 年份聚合 · `/archive/:year/:month` 月份筛选 | ✅ |
| 🔍 **SQLite FTS5 全文搜索** | 替代 MySQL FULLTEXT · 自动同步触发器 · 关键词高亮（BM25 排序） | ✅ |
| 🌓 **暗黑模式** | Tailwind `darkMode: 'class'` · ThemeContext 全局管理 · localStorage 持久化 · 全站组件适配 | ✅ |
| 📡 **RSS 订阅** | `/api/rss` 输出标准 XML · 阅读器可直接订阅 | ✅ |

---

## 🧪 后端接口一览

### 原有接口
| Method | Path | 鉴权 |
|---|---|---|
| POST | `/api/auth/register` | ❌ |
| POST | `/api/auth/login` | ❌ |
| GET  | `/api/users/me` | ✅ |
| PUT  | `/api/users/me` | ✅ |
| POST | `/api/posts` | ✅ |
| GET  | `/api/posts` | ❌（自动过滤 is_draft） |
| GET  | `/api/posts/:id` | ❌（仅作者能看自己的草稿） |
| PUT  | `/api/posts/:id` | ✅ 仅作者 |
| DELETE | `/api/posts/:id` | ✅ 仅作者 |
| GET  | `/api/categories` | ❌ |

### V2 新增接口
| Method | Path | 鉴权 | 说明 |
|---|---|---|---|
| POST | `/api/upload` | ✅ | 图片上传（field: file） |
| POST | `/api/likes/:postId/toggle` | ✅ | 文章点赞切换 |
| POST | `/api/favorites/:postId/toggle` | ✅ | 收藏切换 |
| GET  | `/api/favorites/me` | ✅ | 我的收藏列表 |
| POST | `/api/comments` | ✅ | 发表评论/回复 |
| GET  | `/api/comments/post/:postId` | ❌ | 评论嵌套树 |
| DELETE | `/api/comments/:id` | ✅ 评论作者或文章作者 |
| POST | `/api/comments/:id/like` | ✅ | 评论点赞切换 |
| GET  | `/api/drafts/mine` | ✅ | 我的草稿列表 |
| POST | `/api/drafts/save` | ✅ | 存为草稿（支持 id 字段表示已有文章转草稿） |
| POST | `/api/drafts/:id/publish` | ✅ | 草稿转已发布 |
| GET  | `/api/archive` | ❌ | 年份聚合 |
| GET  | `/api/archive/:year` | ❌ | 该年文章 |
| GET  | `/api/archive/:year/:month` | ❌ | 该年该月文章 |
| GET  | `/api/rss` | ❌ | 标准 RSS XML |

### 统一响应格式
```json
{ "code": 0, "message": "ok", "data": {...} }
```
非 0 code 为错误；HTTP 状态码同步（400 / 401 / 403 / 404 / 500）

---

## 🗄️ 数据库

- **首次初始化**：`npm run init-db`（V1 基础表 + V2 增量表 + 分类种子 + FTS5 全文索引 一次搞定）
- **已有库升 V2**：`node migrate-v2.js`（ALTER posts 加 is_draft · 新建 comments/comment_likes/post_likes/favorites · 建 FTS5 虚表 + 触发器）
- **清空重来**：删掉 `blog.db` + `blog.db-wal` + `blog.db-shm`，重新 `npm run init-db`

| 表 | 说明 |
|---|---|
| users | 用户（username/email 唯一 · bcrypt 密码） |
| categories | 6 条种子：随笔/技术/读书/旅行/摄影/未分类 |
| posts | 文章（**V2 加 is_draft** · tags JSON · 外键→users） |
| comments | 评论（parent_id=0 为顶级，>0 为回复） |
| comment_likes | 评论点赞（UNIQUE comment_id+user_id） |
| post_likes | 文章点赞（UNIQUE post_id+user_id） |
| favorites | 收藏（UNIQUE post_id+user_id） |
| posts_fts | FTS5 全文搜索虚表 + 同步触发器 |

---

## 🎨 主题配色（薄荷绿 + 暗黑模式）

```
浅色：
  mint-300  #86efac  薄荷绿主色
  mint-400  #4ade80  草绿（按钮）
  cream-50  #fbfdfb  米白背景
  sage-700  #365314  深草绿文字

暗黑 (html.dark)：
  背景 #0f172a（slate-900）
  卡片 slate-800 / 边框 mint-800
  文字 mint-100 / mint-300
```

**暗黑切换**：导航栏右上角 🌙 / ☀️，持久化到 localStorage

---

## ⚠️ 开发约束遵守

- 后端敏感配置（DB 路径、JWT 密钥）全部 `.env` 环境变量，零硬编码
- 所有后端新功能放独立文件，原有 controller 只做最小增量改动
- 前端保持绿色清新主视觉，暗黑模式通过 `html.dark` 根类切换
- `POST /api/posts` 默认 `is_draft=0`（已发布），草稿走 `/api/drafts/save`
- SQLite 替代 MySQL（本机无 MySQL），FTS5 替代 FULLTEXT，语法差异已在 migrate-v2.sql 里处理

---

## 🛠️ 可选扩展

图片云存储（阿里云/七牛 OSS · 仅需替换 `src/controllers/uploadController.js` 里的保存逻辑）、归档日历热力图、文章置顶、管理员仪表盘、评论邮件通知、Webhook 触发 RSS 缓存刷新... 随时说 🚀
