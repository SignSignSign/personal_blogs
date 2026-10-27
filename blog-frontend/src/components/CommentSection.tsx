import { useEffect, useState } from 'react';
import { commentApi } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import type { Comment } from '../types';

/**
 * 递归渲染嵌套评论树
 */
function CommentNode({ node, postAuthorId, onDeleted }: { node: Comment; postAuthorId: number; onDeleted: (id: number) => void }) {
  const { user } = useAuth();
  const [replying, setReplying] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [liked, setLiked] = useState(node.liked_by_me);
  const [likeCount, setLikeCount] = useState(node.like_count);

  const canDelete = user && (user.id === node.author_id || user.id === postAuthorId);

  const doReply = async () => {
    if (!replyText.trim()) return;
    try {
      await commentApi.create({ post_id: node.post_id, parent_id: node.id, content: replyText.trim() });
      alert('回复成功');
      setReplyText(''); setReplying(false);
      window.location.reload(); // 简单做法：刷新让评论树重建
    } catch (e: any) { alert(e.message); }
  };

  const doDelete = async () => {
    if (!confirm('删除这条评论？')) return;
    try {
      await commentApi.remove(node.id);
      onDeleted(node.id);
    } catch (e: any) { alert(e.message); }
  };

  const toggleLike = async () => {
    if (!user) return alert('请先登录');
    try {
      const r = await commentApi.toggleLike(node.id);
      setLiked(r.liked); setLikeCount(r.like_count);
    } catch (e: any) { alert(e.message); }
  };

  return (
    <div className="border-l-2 border-mint-100 dark:border-mint-800 pl-4 py-2">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-mint-200 dark:bg-mint-800 flex items-center justify-center text-mint-700 dark:text-mint-200 text-xs font-medium shrink-0">
          {node.author.username[0]?.toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 text-xs text-sage-700/50 dark:text-mint-100/40 mb-1">
            <span className="text-sage-700 dark:text-mint-100 font-medium">{node.author.username}</span>
            <span>{node.created_at?.slice(0, 16)}</span>
          </div>
          <div className="text-sm text-sage-700 dark:text-mint-50 whitespace-pre-wrap break-words">{node.content}</div>
          <div className="flex items-center gap-3 mt-2 text-xs">
            <button onClick={toggleLike} className={`inline-flex items-center gap-1 ${liked ? 'text-red-500' : 'text-sage-700/50 dark:text-mint-100/40 hover:text-red-500'}`}>
              <span>{liked ? '❤️' : '🤍'}</span>
              <span>{likeCount}</span>
            </button>
            {user && (
              <button onClick={() => setReplying((v) => !v)} className="text-sage-700/60 dark:text-mint-100/50 hover:text-mint-500">
                💬 回复
              </button>
            )}
            {canDelete && (
              <button onClick={doDelete} className="text-sage-700/50 hover:text-red-500 dark:text-mint-100/40">🗑 删除</button>
            )}
          </div>

          {replying && user && (
            <div className="mt-2 flex flex-col gap-2">
              <textarea
                value={replyText} onChange={(e) => setReplyText(e.target.value)}
                placeholder={`回复 @${node.author.username}...`}
                className="input min-h-[60px]"
              />
              <div className="flex gap-2">
                <button onClick={doReply} className="btn-primary !py-1.5">发送</button>
                <button onClick={() => setReplying(false)} className="btn-ghost !py-1.5 !px-3">取消</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {node.children?.map((c) => (
        <CommentNode key={c.id} node={c} postAuthorId={postAuthorId} onDeleted={onDeleted} />
      ))}
    </div>
  );
}

/** 评论区主组件 */
export default function CommentSection({ postId, postAuthorId }: { postId: number; postAuthorId: number }) {
  const { user } = useAuth();
  const [list, setList] = useState<Comment[]>([]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    setLoading(true);
    try {
      setList(await commentApi.listByPost(postId));
    } finally { setLoading(false); }
  };

  useEffect(() => { refresh(); }, [postId]);

  const submit = async () => {
    if (!user) return alert('请先登录');
    if (!content.trim()) return;
    try {
      await commentApi.create({ post_id: postId, content: content.trim() });
      setContent('');
      refresh();
    } catch (e: any) { alert(e.message); }
  };

  return (
    <section className="mt-16 pt-8 border-t border-mint-100 dark:border-mint-800">
      <h2 className="text-lg font-bold text-sage-700 dark:text-mint-100 mb-4">💬 评论 ({list.length})</h2>

      {user ? (
        <div className="mb-8">
          <textarea
            value={content} onChange={(e) => setContent(e.target.value)}
            placeholder="留下你的想法..."
            className="input min-h-[80px]"
          />
          <div className="flex justify-end mt-2">
            <button onClick={submit} className="btn-primary">发表评论</button>
          </div>
        </div>
      ) : (
        <div className="mb-8 p-4 rounded-xl bg-mint-50 dark:bg-mint-900/20 text-sm text-sage-700 dark:text-mint-100/80 text-center">
          <Link to="/login" className="text-mint-600 hover:text-mint-500 font-medium">登录</Link> 后才能发表评论 🌿
        </div>
      )}

      {loading ? (
        <div className="text-sage-700/50 text-sm">加载中...</div>
      ) : list.length === 0 ? (
        <div className="text-sage-700/40 dark:text-mint-100/30 text-sm text-center py-6">还没有评论，快来抢沙发～</div>
      ) : (
        <div>
          {list.map((c) => (
            <CommentNode key={c.id} node={c} postAuthorId={postAuthorId} onDeleted={refresh} />
          ))}
        </div>
      )}
    </section>
  );
}
// 顶部用了 Link 但没 import — 补上
import { Link } from 'react-router-dom';
