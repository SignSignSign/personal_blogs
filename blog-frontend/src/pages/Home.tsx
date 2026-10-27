import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import PostCard from '../components/PostCard';
import Pagination from '../components/Pagination';
import { categoryApi, postApi } from '../utils/api';
import type { Category, PostSummary } from '../types';

export default function Home() {
  const [sp, setSp] = useSearchParams();
  const page = Number(sp.get('page')) || 1;
  const keyword = sp.get('keyword') || '';
  const category = sp.get('category') || '';

  const [list, setList] = useState<PostSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [kwInput, setKwInput] = useState(keyword);

  useEffect(() => {
    categoryApi.list().then(setCategories).catch(() => { });
  }, []);

  useEffect(() => {
    setLoading(true);
    postApi.list({ page, category, keyword, pageSize: 9 })
      .then((res) => { setList(res.list); setTotal(res.total); })
      .catch((e) => alert(e.message))
      .finally(() => setLoading(false));
  }, [page, category, keyword]);

  const goPage = (p: number) => {
    setSp({ ...(category ? { category } : {}), ...(keyword ? { keyword } : {}), page: String(p) });
  };
  const goCategory = (c: string) => {
    if (c === category) setSp({ page: '1', ...(keyword ? { keyword } : {}) });
    else setSp({ category: c, page: '1', ...(keyword ? { keyword } : {}) });
  };
  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSp({ ...(category ? { category } : {}), ...(kwInput.trim() ? { keyword: kwInput.trim() } : {}), page: '1' });
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      {/* Hero */}
      <section className="mb-10 relative overflow-hidden rounded-2xl bg-gradient-to-br from-mint-50 via-cream-50 to-mint-100/60 dark:from-mint-900/20 dark:via-slate-800/50 dark:to-mint-800/15 border border-mint-100 dark:border-mint-800 p-8">
        {/* 浮动装饰叶子 */}
        <svg className="absolute -top-4 -right-4 w-32 h-32 text-mint-300/60 dark:text-mint-700/40 animate-[float_6s_ease-in-out_infinite]" viewBox="0 0 100 100" fill="currentColor">
          <path d="M20 50 Q50 10 90 30 Q70 70 30 65 Q15 60 20 50 Z" />
          <path d="M15 60 Q45 30 85 45 Q65 75 25 72 Q12 68 15 60 Z" opacity="0.7" />
        </svg>
        <svg className="absolute -bottom-6 -left-6 w-28 h-28 text-mint-400/40 dark:text-mint-600/30 animate-[float_7s_ease-in-out_infinite_reverse]" viewBox="0 0 100 100" fill="currentColor">
          <path d="M80 50 Q50 10 10 30 Q30 70 70 65 Q85 60 80 50 Z" />
          <path d="M85 60 Q55 30 15 45 Q35 75 75 72 Q88 68 85 60 Z" opacity="0.6" />
        </svg>
        <span className="absolute top-4 right-4 text-3xl animate-[sway_4s_ease-in-out_infinite]">🌸</span>
        <span className="absolute bottom-3 right-16 text-xl animate-[sway_5s_ease-in-out_infinite_reverse]">🌱</span>
        <span className="absolute top-6 left-6 text-2xl animate-[sway_6s_ease-in-out_infinite] opacity-80">🍃</span>

        <div className="relative z-10">
          <h1 className="text-3xl font-bold text-sage-700 dark:text-mint-100 mb-2 flex items-center gap-2">
            一片安静的写作角落 <span className="inline-block animate-[sway_3s_ease-in-out_infinite]">🌿</span>
          </h1>
          <p className="text-sage-700/60 dark:text-mint-100/60">分享技术、生活、读书与旅途的碎片</p>
        </div>
      </section>

      {/* 搜索 */}
      <form onSubmit={submitSearch} className="mb-6 flex gap-2">
        <input
          value={kwInput}
          onChange={(e) => setKwInput(e.target.value)}
          placeholder="搜索文章标题或内容..."
          className="input !py-2.5"
        />
        <button type="submit" className="btn-primary">搜索</button>
      </form>

      {/* 分类筛选 */}
      <div className="flex flex-wrap gap-2 mb-8">
        <button onClick={() => goCategory('')}
          className={`category-chip ${!category ? 'bg-mint-400 text-white shadow-soft' : 'bg-white border border-mint-200 text-sage-700/70 hover:bg-mint-50'}`}>
          全部
        </button>
        {categories.map((c) => (
          <button key={c.id} onClick={() => goCategory(c.name)}
            className={`category-chip ${category === c.name ? 'bg-mint-400 text-white shadow-soft' : 'bg-white border border-mint-200 text-sage-700/70 hover:bg-mint-50'}`}>
            {c.name}
          </button>
        ))}
      </div>

      {/* 列表 */}
      {loading ? (
        <div className="text-center py-20 text-sage-700/50">加载中...</div>
      ) : list.length === 0 ? (
        <div className="text-center py-20 text-sage-700/50">暂无文章，换个关键词试试～</div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {list.map((p) => <PostCard key={p.id} post={p} />)}
        </div>
      )}

      <Pagination page={page} total={total} pageSize={9} onChange={goPage} />
    </div>
  );
}
