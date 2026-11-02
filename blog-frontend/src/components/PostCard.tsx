import { Link } from 'react-router-dom';
import type { PostSummary } from '../types';
import { resolveImageUrl } from '../utils/request';

const DEFAULT_COVER = 'data:image/svg+xml;utf8,' + encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="220" viewBox="0 0 400 220">
    <defs>
      <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
        <stop offset="0%" stop-color="#dcf6e3"/>
        <stop offset="100%" stop-color="#bbf7d0"/>
      </linearGradient>
    </defs>
    <rect width="400" height="220" fill="url(#g)"/>
    <!-- 背景远山 -->
    <path d="M0 160 Q80 120 160 150 Q240 180 320 140 Q360 120 400 140 L400 220 L0 220 Z" fill="#86efac" opacity="0.35"/>
    <!-- 草丛 -->
    <g stroke="#22c55e" stroke-width="2" stroke-linecap="round" opacity="0.7" fill="none">
      <path d="M20 210 Q25 185 22 160"/>
      <path d="M30 212 Q36 180 32 155"/>
      <path d="M42 210 Q48 185 44 162"/>
      <path d="M360 210 Q365 182 362 158"/>
      <path d="M372 212 Q378 185 374 160"/>
      <path d="M384 210 Q390 182 386 158"/>
    </g>
    <!-- 叶子 -->
    <g fill="#4ade80" opacity="0.6">
      <ellipse cx="80" cy="110" rx="22" ry="11" transform="rotate(-30 80 110)"/>
      <ellipse cx="95" cy="85" rx="18" ry="9" transform="rotate(25 95 85)"/>
      <ellipse cx="320" cy="100" rx="20" ry="10" transform="rotate(-25 320 100)"/>
      <ellipse cx="335" cy="75" rx="17" ry="8" transform="rotate(30 335 75)"/>
    </g>
    <!-- 小花 -->
    <g fill="#f9a8d4" opacity="0.85">
      <circle cx="75" cy="140" r="5"/>
      <circle cx="85" cy="138" r="4"/>
      <circle cx="330" cy="130" r="5"/>
      <circle cx="342" cy="128" r="4"/>
    </g>
    <g fill="#fcd34d" opacity="0.8">
      <circle cx="75" cy="140" r="2"/>
      <circle cx="330" cy="130" r="2"/>
    </g>
    <!-- 中间大叶子装饰 -->
    <g fill="#4ade80" opacity="0.2" transform="translate(200 90)">
      <path d="M0 0 Q30 -40 60 -20 Q45 20 15 15 Q0 10 0 0 Z"/>
    </g>
  </svg>`
);

export default function PostCard({ post }: { post: PostSummary }) {
  const readMin = post.reading_time_min ?? Math.max(1, Math.ceil((post.summary?.length || 0) / 400));

  return (
    <Link to={`/post/${post.id}`} className="card group overflow-hidden block post-card-decor relative">
      {/* 卡片角落 tiny 叶子 */}
      <span className="absolute top-2 right-2 text-base opacity-40 group-hover:opacity-80 group-hover:rotate-12 transition-all duration-300">🌿</span>
      <div className="aspect-[16/9] bg-cream-100 dark:bg-mint-900/20 overflow-hidden">
        <img
          src={resolveImageUrl(post.cover) || DEFAULT_COVER}
          alt={post.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_COVER; }}
        />
      </div>
      <div className="p-5">
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <span className="tag">{post.category}</span>
          {post.tags.slice(0, 2).map((t) => <span key={t} className="tag">{t}</span>)}
          <span className="ml-auto text-xs text-sage-700/50 dark:text-mint-100/40">⏱️ {readMin} min read</span>
        </div>
        <h3 className="text-sage-700 dark:text-mint-100 font-semibold text-lg line-clamp-2 group-hover:text-mint-600 dark:group-hover:text-mint-300 transition-colors mb-2">
          {post.title}
        </h3>
        <p className="text-sm text-sage-700/60 dark:text-mint-100/50 line-clamp-2 mb-3">{post.summary}</p>
        <div className="flex items-center gap-3 text-xs text-sage-700/50 dark:text-mint-100/40 pt-2 border-t border-mint-100 dark:border-mint-800">
          <span className="flex items-center gap-1">
            <span className="w-5 h-5 rounded-full bg-mint-200 dark:bg-mint-800 inline-flex items-center justify-center text-[10px] text-mint-700 dark:text-mint-200 font-medium">
              {post.author.username[0]?.toUpperCase()}
            </span>
            {post.author.username}
          </span>
          <span>·</span>
          <span>{post.created_at?.slice(0, 10)}</span>
          <span className="ml-auto flex items-center gap-3">
            <span>👁 {post.views}</span>
            <span>❤️ {post.like_count || 0}</span>
          </span>
        </div>
      </div>
    </Link>
  );
}
