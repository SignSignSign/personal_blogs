import axios from 'axios';

/**
 * API 基础 URL 规则：
 *   开发环境：Vite 代理 /api → localhost:3000，所以 baseURL 留 '/api'
 *   生产环境（Netlify）：从 VITE_API_BASE_URL 读后端实际地址（如 https://your-backend.onrender.com/api）
 *     如果没设环境变量，默认也用 '/api'（假设前后端同域部署，不适用于 Netlify 纯前端）
 */
const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

/** 从 API 地址自动推导图片基地址：https://xxx.onrender.com/api → https://xxx.onrender.com */
function inferUploadsBase(): string {
  if (import.meta.env.VITE_UPLOADS_BASE_URL) return import.meta.env.VITE_UPLOADS_BASE_URL;
  if (!API_BASE.startsWith('http')) return ''; // 走 Vite 代理，无需前缀
  try { return new URL(API_BASE).origin; } catch { return ''; }
}
const UPLOADS_BASE = inferUploadsBase();

const request = axios.create({
  baseURL: API_BASE,
  // Render 免费实例冷启动约 3-5s，超时放宽到 20s
  timeout: 20000,
});

/** 图片 URL 规范化：支持生产环境替换 */
export function resolveImageUrl(url: string | undefined | null): string {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  // 生产环境 /uploads 走后端服务，需要拼完整前缀
  if (UPLOADS_BASE && url.startsWith('/uploads')) {
    return UPLOADS_BASE.replace(/\/$/, '') + url;
  }
  return url;
}

// 请求拦截：自动带 token
request.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// 响应拦截：统一提示
request.interceptors.response.use(
  (res) => {
    const body = res.data;
    if (body.code !== 0) {
      if (body.code === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
      return Promise.reject(new Error(body.message || '请求失败'));
    }
    return body.data;
  },
  (err) => {
    const msg = err?.response?.data?.message || err.message || '网络错误';
    return Promise.reject(new Error(msg));
  }
);

export default request;
