import request from '../utils/request';
import type { User, Category, PostSummary, PostDetail, Comment, DraftItem, ArchiveYear } from '../types';

// ===== 认证 =====
export const authApi = {
  register: (data: { username: string; email: string; password: string }) =>
    request.post<any, User>('/auth/register', data),
  login: (data: { username: string; password: string }) =>
    request.post<any, { token: string; user: User }>('/auth/login', data),
};

// ===== 用户 =====
export const userApi = {
  me: () => request.get<any, User>('/users/me'),
  updateMe: (data: Partial<User>) => request.put<any, User>('/users/me', data),
};

// ===== 文章 =====
export interface ListParams {
  page?: number;
  pageSize?: number;
  category?: string;
  keyword?: string;
}
export const postApi = {
  list: (params: ListParams) =>
    request.get<any, { list: PostSummary[]; total: number; page: number; pageSize: number }>('/posts', { params }),
  detail: (id: number) => request.get<any, PostDetail>(`/posts/${id}`),
  create: (data: Partial<PostDetail>) => request.post<any, { id: number }>('/posts', data),
  update: (id: number, data: Partial<PostDetail>) => request.put<any, null>(`/posts/${id}`, data),
  remove: (id: number) => request.delete<any, null>(`/posts/${id}`),
};

// ===== 分类 =====
export const categoryApi = {
  list: () => request.get<any, Category[]>('/categories'),
};

// ===== V2 增量 =====

/** 文件上传（multipart/form-data field: file） */
export const uploadApi = {
  post: (file: File) => {
    const fd = new FormData();
    fd.append('file', file);
    return request.post<any, { url: string; filename: string; size: number }>('/upload', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

/** 文章点赞 */
export const likeApi = {
  toggle: (postId: number) => request.post<any, { liked: boolean; like_count: number }>(`/likes/${postId}/toggle`),
};

/** 收藏 */
export const favoriteApi = {
  toggle: (postId: number) => request.post<any, { favorited: boolean; favorite_count: number }>(`/favorites/${postId}/toggle`),
  mine: () => request.get<any, PostSummary[]>('/favorites/me'),
};

/** 评论 */
export const commentApi = {
  listByPost: (postId: number) => request.get<any, Comment[]>(`/comments/post/${postId}`),
  create: (data: { post_id: number; content: string; parent_id?: number }) =>
    request.post<any, { id: number }>('/comments', data),
  remove: (id: number) => request.delete<any, null>(`/comments/${id}`),
  toggleLike: (id: number) => request.post<any, { liked: boolean; like_count: number }>(`/comments/${id}/like`),
};

/** 草稿 */
export const draftApi = {
  mine: () => request.get<any, DraftItem[]>('/drafts/mine'),
  save: (data: { id?: number; title: string; content: string; category?: string; tags?: string[]; cover?: string }) =>
    request.post<any, { id: number }>('/drafts/save', data),
  publish: (id: number) => request.post<any, null>(`/drafts/${id}/publish`),
};

/** 归档 */
export const archiveApi = {
  index: () => request.get<any, { years: ArchiveYear[]; total: number }>('/archive'),
  byYear: (year: string) => request.get<any, PostSummary[]>(`/archive/${year}`),
  byYearMonth: (year: string, month: string) => request.get<any, PostSummary[]>(`/archive/${year}/${month}`),
};

/** RSS（直接拿 xml 文本） */
export const rssUrl = '/api/rss';
