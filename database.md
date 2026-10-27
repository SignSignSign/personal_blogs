# 个人博客系统 · 数据库设计（MySQL 8.0）

> 字符集：`utf8mb4`，排序规则：`utf8mb4_unicode_ci`，引擎：`InnoDB`

## 1. users 用户表

| 字段 | 类型 | 约束 | 说明 |
|---|---|---|---|
| id | INT UNSIGNED | PRIMARY KEY AUTO_INCREMENT | 用户 ID |
| username | VARCHAR(32) | NOT NULL UNIQUE | 用户名，唯一 |
| email | VARCHAR(128) | NOT NULL UNIQUE | 邮箱，唯一 |
| password | VARCHAR(255) | NOT NULL | bcrypt 加密密码 |
| avatar | VARCHAR(512) | DEFAULT NULL | 头像 URL |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | 创建时间 |

## 2. posts 文章表

| 字段 | 类型 | 约束 | 说明 |
|---|---|---|---|
| id | INT UNSIGNED | PRIMARY KEY AUTO_INCREMENT | 文章 ID |
| title | VARCHAR(200) | NOT NULL | 文章标题 |
| content | LONGTEXT | NOT NULL | Markdown 内容 |
| cover | VARCHAR(512) | DEFAULT NULL | 封面图 URL |
| category | VARCHAR(64) | DEFAULT '未分类' | 分类 |
| tags | JSON | DEFAULT (JSON_ARRAY()) | 标签数组 |
| author_id | INT UNSIGNED | NOT NULL FOREIGN KEY → users.id | 作者 |
| views | INT UNSIGNED | DEFAULT 0 | 浏览次数 |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | 发布时间 |
| updated_at | DATETIME | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | 更新时间 |

## 3. categories 分类表

| 字段 | 类型 | 约束 | 说明 |
|---|---|---|---|
| id | INT UNSIGNED | PRIMARY KEY AUTO_INCREMENT | 分类 ID |
| name | VARCHAR(64) | NOT NULL UNIQUE | 分类名称 |
| description | VARCHAR(255) | DEFAULT NULL | 分类描述 |

---

## 完整建表 SQL（可直接执行）

```sql
-- 切换字符集
SET NAMES utf8mb4;

-- 如果你需要先创建数据库
-- CREATE DATABASE IF NOT EXISTS blog_system DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- USE blog_system;

-- ========== 1. users 用户表 ==========
DROP TABLE IF EXISTS posts;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
  id          INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  username    VARCHAR(32)   NOT NULL,
  email       VARCHAR(128)  NOT NULL,
  password    VARCHAR(255)  NOT NULL,
  avatar      VARCHAR(512)  DEFAULT NULL,
  created_at  DATETIME      DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_username (username),
  UNIQUE KEY uk_email    (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========== 2. categories 分类表 ==========
CREATE TABLE categories (
  id          INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  name        VARCHAR(64)   NOT NULL,
  description VARCHAR(255)  DEFAULT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========== 3. posts 文章表 ==========
CREATE TABLE posts (
  id          INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  title       VARCHAR(200)  NOT NULL,
  content     LONGTEXT      NOT NULL,
  cover       VARCHAR(512)  DEFAULT NULL,
  category    VARCHAR(64)   DEFAULT '未分类',
  tags        JSON          DEFAULT (JSON_ARRAY()),
  author_id   INT UNSIGNED  NOT NULL,
  views       INT UNSIGNED  DEFAULT 0,
  created_at  DATETIME      DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_author   (author_id),
  KEY idx_category (category),
  KEY idx_views    (views),
  CONSTRAINT fk_posts_author FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========== 初始化分类数据 ==========
INSERT INTO categories (name, description) VALUES
  ('随笔', '日常碎碎念、生活感悟'),
  ('技术', '前端开发、后端、算法笔记'),
  ('读书', '阅读摘录、读书笔记'),
  ('旅行', '游记、旅途见闻'),
  ('摄影', '光影、构图、镜头下的世界'),
  ('未分类', '暂未归类的文章');
```

## Node.js 自动初始化脚本

运行 `node init-db.js` 即可自动创建全部表。脚本位于后端项目根目录。
