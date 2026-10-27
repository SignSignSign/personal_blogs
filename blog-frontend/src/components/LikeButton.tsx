import { useState } from 'react';
import { likeApi } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface Props {
  postId: number;
  liked?: boolean;
  like_count?: number;
  onChange?: (liked: boolean, count: number) => void;
  size?: 'sm' | 'md';
}

export default function LikeButton({ postId, liked = false, like_count = 0, onChange, size = 'md' }: Props) {
  const { token } = useAuth();
  const nav = useNavigate();
  const [busy, setBusy] = useState(false);
  const [anim, setAnim] = useState(false);

  const click = async () => {
    if (!token) return nav('/login');
    if (busy) return;
    setBusy(true); setAnim(true);
    try {
      const r = await likeApi.toggle(postId);
      onChange?.(r.liked, r.like_count);
    } catch (e: any) { alert(e.message); }
    finally { setBusy(false); setTimeout(() => setAnim(false), 300); }
  };

  const cls = size === 'sm' ? 'text-sm gap-1' : 'text-base gap-1.5';
  return (
    <button onClick={click} disabled={busy}
      className={`inline-flex items-center ${cls} px-2.5 py-1.5 rounded-lg border transition ${
        liked
          ? 'text-red-500 border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800'
          : 'text-sage-700/60 border-mint-100 hover:bg-mint-50 dark:text-mint-100/70 dark:border-mint-800 hover:dark:bg-mint-900/30'
      } ${anim ? 'scale-110' : ''}`}>
      <span className="transition-transform">{liked ? '❤️' : '🤍'}</span>
      <span>{like_count}</span>
    </button>
  );
}
