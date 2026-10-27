// ===== 原有类型保留 =====
export interface User {
  id: number;
  username: string;
  email?: string;
  avatar?: string | null;
  created_at?: string;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
}

/** V2 增强：新增字段 reading_time_min / like_count / favorite_count / is_liked / is_favorited */
export interface PostSummary {
  id: number;
  title: string;
  cover: string | null;
  category: string;
  tags: string[];
  author_id: number;
  author: User;
  views: number;
  created_at: string;
  updated_at: string;
  summary: string;
  reading_time_min?: number;
  like_count?: number;
  favorite_count?: number;
  is_liked?: boolean;
  is_favorited?: boolean;
}

export interface PostDetail extends PostSummary {
  content: string;
  is_draft?: boolean;
}

export interface ApiResp<T> {
  code: number;
  message: string;
  data: T;
}

// ===== V2 新增类型 =====
export interface Comment {
  id: number;
  post_id: number;
  author_id: number;
  parent_id: number;
  content: string;
  created_at: string;
  author: User;
  children: Comment[];
  like_count: number;
  liked_by_me: boolean;
}

export interface DraftItem {
  id: number;
  title: string;
  category: string;
  tags: string[];
  views: number;
  created_at: string;
  updated_at: string;
}

export interface ArchiveYear {
  year: string;
  months: { month: number; count: number }[];
  total: number;
}
