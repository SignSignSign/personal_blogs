import { useState } from 'react';
import { favoriteApi } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface Props {
  postId: number;
  favorited?: boolean;
  favorite_count?: number;
  onChange?: (favorited: boolean, count: number) => void;
}

export default function FavoriteButton({ postId, favorited = false, favorite_count = 0, onChange }: Props) {
  const { token } = useAuth();
  const nav = useNavigate();
  const [busy, setBusy] = useState(false);

  const click = async () => {
    if (!token) return nav('/login');
    if (busy) return;
    setBusy(true);
    try {
      const r = await favoriteApi.toggle(postId);
      onChange?.(r.favorited, r.favorite_count);
    } catch (e: any) { alert(e.message); }
    finally { setBusy(false); }
  };

  return (
    <button onClick={click} disabled={busy}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition ${
        favorited
          ? 'text-amber-500 border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800'
          : 'text-sage-700/60 border-mint-100 hover:bg-mint-50 dark:text-mint-100/70 dark:border-mint-800 hover:dark:bg-mint-900/30'
      }`}>
      <span>{favorited ? '⭐' : '☆'}</span>
      <span>{favorite_count}</span>
    </button>
  );
}
