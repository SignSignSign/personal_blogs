# 个人博客系统 PRD

> 风格：绿色清新文艺 · 主色调薄荷绿 / 浅草绿 / 米白
> 技术栈：React + TS + Vite + Tailwind · Node.js + Express · MySQL · JWT

---

## 一、视觉风格

- **主色**：`#86efac`（薄荷绿）/ `#4ade80`（草绿）
- **背景**：`#fbfdfb`（米白）/ `#f4f8f4`（浅灰绿）
- **文字**：`#365314`（深草绿）/ `#65a30d`
- **卡片**：圆角 12px、米白填充、1px 浅绿描边、柔和阴影
- **按钮**：主色填充 / 浅绿描边，hover 加深，圆角 8px
- **整体留白大、无厚重色块、阅读舒适、偏日系文艺**

---

## 二、用户模块

### 2.1 注册 `POST /api/auth/register`
| 参数 | 校验规则 |
|---|---|
| username | 3–20 字符，唯一 |
| email | 邮箱格式，唯一 |
| password | ≥6 位 |

返回：`{ id, username, email, avatar }`（不返回密码）

### 2.2 登录 `POST /api/auth/login`
- 用户名 + 密码
- 返回 JWT（有效期 7 天） + 用户基础信息

### 2.3 个人中心 `GET /api/users/me` / `PUT /api/users/me`
- 登录后访问，可修改昵称、头像

---

## 三、文章模块

### 3.1 发布 `POST /api/posts`【登录】
- body：title / content / category / tags / cover
- author_id 从 JWT 解析

### 3.2 列表 `GET /api/posts`
Query：
| 参数 | 说明 |
|---|---|
| page | 页码，默认 1 |
| pageSize | 每页条数，默认 10 |
| category | 分类筛选 |
| keyword | 搜索标题 + 内容 |

返回：`{ list: [...], total }`

### 3.3 详情 `GET /api/posts/:id`
- 返回完整文章 + 作者信息
- 访问一次 views + 1

### 3.4 编辑 `PUT /api/posts/:id`【登录】
- 仅作者本人

### 3.5 删除 `DELETE /api/posts/:id`【登录】
- 仅作者本人

---

## 四、前端路由

| 路径 | 页面 | 登录保护 |
|---|---|---|
| `/` | 首页 · 文章列表卡片 | ❌ |
| `/post/:id` | 文章详情 | ❌ |
| `/write` | 写 / 编辑文章 | ✅ |
| `/profile` | 个人中心 | ✅ |
| `/login` | 登录 | ❌ |
| `/register` | 注册 | ❌ |

---

## 五、前端页面结构

1. **首页**：顶部搜索框、分类 Tab 筛选、卡片瀑布流/网格、分页；每卡片含封面、标题、分类、标签、作者、时间、阅读量
2. **详情页**：左侧 Markdown 正文渲染，顶部封面，底部作者信息 + 编辑/删除按钮（本人）
3. **写文章**：双栏——左 Markdown 编辑器、右实时预览；标题输入、分类下拉、标签输入（回车添加）、封面 URL
4. **个人中心**：头像、用户名展示 + 昵称/头像编辑表单
5. **登录/注册**：居中卡片表单，薄荷绿主题
6. **导航栏**：左 Logo、中间导航、右 登录/注册 or 头像+下拉

---

## 六、API 汇总

| Method | Path | Auth | 说明 |
|---|---|---|---|
| POST | `/api/auth/register` | ❌ | 注册 |
| POST | `/api/auth/login` | ❌ | 登录 |
| GET  | `/api/users/me` | ✅ | 当前用户信息 |
| PUT  | `/api/users/me` | ✅ | 更新资料 |
| POST | `/api/posts` | ✅ | 创建文章 |
| GET  | `/api/posts` | ❌ | 文章列表（分页/筛选/搜索） |
| GET  | `/api/posts/:id` | ❌ | 文章详情 |
| PUT  | `/api/posts/:id` | ✅ | 更新文章（仅作者） |
| DELETE | `/api/posts/:id` | ✅ | 删除文章（仅作者） |
| GET  | `/api/categories` | ❌ | 全部分类 |

---

## 七、扩展方向（后续）

评论系统 / 点赞 / 草稿保存 / 图片云存储 / 归档 / RSS / 暗色模式
