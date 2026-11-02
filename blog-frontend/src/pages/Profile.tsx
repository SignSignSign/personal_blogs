import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userApi, draftApi, favoriteApi } from '../utils/api';
import { resolveImageUrl } from '../utils/request';
import type { DraftItem, PostSummary } from '../types';

type Tab = 'profile' | 'drafts' | 'favorites';

export default function Profile() {
  const { user, refresh } = useAuth();
  const [tab, setTab] = useState<Tab>('profile');
  const [username, setUsername] = useState(user?.username || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [saving, setSaving] = useState(false);
  const [drafts, setDrafts] = useState<DraftItem[]>([]);
  const [favorites, setFavorites] = useState<PostSummary[]>([]);

  useEffect(() => {
    setUsername(user?.username || ''); setAvatar(user?.avatar || '');
  }, [user]);

  const load = async () => {
    if (tab === 'drafts') try { setDrafts(await draftApi.mine()); } catch { }
    if (tab === 'favorites') try { setFavorites(await favoriteApi.mine()); } catch { }
  };
  useEffect(() => { load(); }, [tab]);

  const save = async () => {
    if (!username.trim()) return alert('用户名不能为空');
    setSaving(true);
    try {
      await userApi.updateMe({ username, avatar });
      await refresh();
      alert('保存成功');
    } catch (e: any) { alert(e.message); }
    finally { setSaving(false); }
  };

  if (!user) return null;

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold text-sage-700 dark:text-mint-100 mb-6">个人中心</h1>

      {/* Tab 切换 */}
      <div className="flex gap-1 mb-6 border-b border-mint-100 dark:border-mint-800">
        {[
          { k: 'profile', label: '👤 基本资料' },
          { k: 'drafts', label: '📝 我的草稿' },
          { k: 'favorites', label: '⭐ 我的收藏' },
        ].map((t) => (
          <button key={t.k} onClick={() => setTab(t.k as Tab)}
            className={`px-4 py-2 text-sm border-b-2 transition ${tab === t.k
              ? 'border-mint-400 text-mint-600 dark:text-mint-300 font-medium'
              : 'border-transparent text-sage-700/60 dark:text-mint-100/50 hover:text-mint-500'
              }`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'profile' && (
        <div className="card p-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-mint-300 to-mint-500 flex items-center justify-center text-white text-3xl overflow-hidden shadow-soft">
              {avatar ? <img src={resolveImageUrl(avatar)} alt="avatar" className="w-full h-full object-cover" /> : user.username[0]?.toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-sage-700 dark:text-mint-100">{user.username}</h2>
              <p className="text-sm text-sage-700/60 dark:text-mint-100/50">{user.email}</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-sage-700/70 dark:text-mint-100/60 mb-1">用户名</label>
              <input value={username} onChange={(e) => setUsername(e.target.value)} className="input" />
            </div>
            <div>
              <label className="block text-sm text-sage-700/70 dark:text-mint-100/60 mb-1">头像 URL</label>
              <input value={avatar || ''} onChange={(e) => setAvatar(e.target.value)} placeholder="https://..." className="input" />
            </div>
            <div className="flex justify-end">
              <button onClick={save} disabled={saving} className="btn-primary">{saving ? '保存中...' : '保存修改'}</button>
            </div>
          </div>
        </div>
      )}

      {tab === 'drafts' && (
        <div className="card p-6">
          {drafts.length === 0 ? (
            <div className="text-center py-10 text-sage-700/40 dark:text-mint-100/30 text-sm">
              还没有草稿，<Link to="/write" className="text-mint-600 hover:text-mint-500">开始写吧</Link>
            </div>
          ) : (
            <ul className="divide-y divide-mint-100 dark:divide-mint-800">
              {drafts.map((d) => (
                <li key={d.id} className="py-4 flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <Link to={`/write?id=${d.id}`} className="font-medium text-sage-700 dark:text-mint-100 hover:text-mint-600 hover:dark:text-mint-300 truncate block">
                      📝 {d.title}
                    </Link>
                    <div className="text-xs text-sage-700/50 dark:text-mint-100/40 mt-1">
                      {d.category} · {d.updated_at?.slice(0, 16)} 更新
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Link to={`/write?id=${d.id}`} className="btn-ghost !py-1.5 !px-3 text-xs">继续编辑</Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {tab === 'favorites' && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {favorites.length === 0 ? (
            <div className="col-span-full text-center py-10 text-sage-700/40 dark:text-mint-100/30 text-sm">
              还没有收藏任何文章
            </div>
          ) : (
            favorites.map((p) => (
              <Link key={p.id} to={`/post/${p.id}`} className="card p-5 hover:shadow-soft transition block">
                <div className="flex items-center gap-2 mb-2">
                  <span className="tag">{p.category}</span>
                  <span className="ml-auto text-xs text-sage-700/50 dark:text-mint-100/40">⭐</span>
                </div>
                <h3 className="font-semibold text-sage-700 dark:text-mint-100 truncate mb-1">{p.title}</h3>
                <div className="text-xs text-sage-700/50 dark:text-mint-100/40">{p.created_at?.slice(0, 10)} · 👁 {p.views}</div>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
}
