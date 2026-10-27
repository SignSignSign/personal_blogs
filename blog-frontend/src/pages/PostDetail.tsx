import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { PostDetail } from '../types';
import { postApi } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import ReadingProgress from '../components/ReadingProgress';
import TableOfContents from '../components/TableOfContents';
import LikeButton from '../components/LikeButton';
import FavoriteButton from '../components/FavoriteButton';
import CommentSection from '../components/CommentSection';

const DEFAULT_COVER = 'data:image/svg+xml;utf8,' + encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="320" viewBox="0 0 800 320"><defs><linearGradient id="g" x1="0" x2="1" y1="0" y2="1"><stop offset="0%" stop-color="#dcf6e3"/><stop offset="100%" stop-color="#86efac"/></linearGradient></defs><rect width="800" height="320" fill="url(#g)"/></svg>`
);

export default function PostDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const { user } = useAuth();
  const [post, setPost] = useState<PostDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = () => {
    if (!id) return;
    setLoading(true);
    postApi.detail(Number(id)).then(setPost).catch((e) => alert(e.message)).finally(() => setLoading(false));
  };

  useEffect(() => { refresh(); }, [id]);

  if (loading) return <div className="max-w-3xl mx-auto px-6 py-20 text-center text-sage-700/50 dark:text-mint-100/40">加载中...</div>;
  if (!post) return <div className="max-w-3xl mx-auto px-6 py-20 text-center text-sage-700/50 dark:text-mint-100/40">文章不存在</div>;

  const isAuthor = user?.id === post.author_id;

  const onDelete = async () => {
    if (!confirm('确定要删除这篇文章吗？')) return;
    try { await postApi.remove(post.id); alert('已删除'); nav('/'); }
    catch (e: any) { alert(e.message); }
  };

  const readMin = post.reading_time_min ?? Math.max(1, Math.ceil((post.content?.length || 0) / 400));

  return (
    <div className="relative">
      {/* 细进度条 */}
      <ReadingProgress targetId="article-content" />

      <div className="max-w-3xl mx-auto px-6 py-10 relative">
        {/* 封面 */}
        <div className="rounded-2xl overflow-hidden mb-8 aspect-[16/7] bg-cream-100 dark:bg-mint-900/20">
          <img src={post.cover || DEFAULT_COVER} alt={post.title}
            onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_COVER; }}
            className="w-full h-full object-cover" />
        </div>

        {/* 标题区 */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <span className="tag">{post.category}</span>
            {post.tags.map((t) => <span key={t} className="tag">{t}</span>)}
            <span className="ml-auto text-sm text-sage-700/50 dark:text-mint-100/40">⏱️ {readMin} min read</span>
          </div>
          <h1 className="text-3xl font-bold text-sage-700 dark:text-mint-100 mb-4">{post.title}</h1>
          <div className="flex items-center gap-4 text-sm text-sage-700/60 dark:text-mint-100/50 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-mint-200 dark:bg-mint-800 inline-flex items-center justify-center text-mint-700 dark:text-mint-200 font-medium">
                {post.author.username[0]?.toUpperCase()}
              </span>
              <span className="text-sage-700 dark:text-mint-100 font-medium">{post.author.username}</span>
            </div>
            <span>· {post.created_at?.slice(0, 10)}</span>
            <span>· 👁 {post.views} 次阅读</span>

            {/* 点赞 + 收藏（需要登录） */}
            <div className="ml-auto flex items-center gap-2">
              <LikeButton
                postId={post.id}
                liked={post.is_liked}
                like_count={post.like_count}
                onChange={(liked, count) => setPost((p) => p ? { ...p, is_liked: liked, like_count: count } : p)}
              />
              <FavoriteButton
                postId={post.id}
                favorited={post.is_favorited}
                favorite_count={post.favorite_count}
                onChange={(fav, count) => setPost((p) => p ? { ...p, is_favorited: fav, favorite_count: count } : p)}
              />
            </div>
          </div>
        </div>

        {/* 正文 */}
        <article id="article-content" className="markdown-body">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content}</ReactMarkdown>
        </article>

        {/* 目录导航 */}
        <TableOfContents contentRootId="article-content" />

        {/* 本人操作 */}
        {isAuthor && (
          <div className="mt-12 pt-6 border-t border-mint-100 dark:border-mint-800 flex justify-end gap-3">
            <Link to={`/write?id=${post.id}`} className="btn-ghost">✏️ 编辑</Link>
            <button onClick={onDelete} className="btn-danger">🗑 删除</button>
          </div>
        )}

        {/* 返回 */}
        <div className="mt-10">
          <Link to="/" className="inline-flex items-center gap-1 text-mint-600 hover:text-mint-500 text-sm">← 返回首页</Link>
        </div>

        {/* 评论区 */}
        <CommentSection postId={post.id} postAuthorId={post.author_id} />
      </div>
    </div>
  );
}
