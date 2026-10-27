import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { archiveApi } from '../utils/api';
import type { ArchiveYear, PostSummary } from '../types';
import PostCard from '../components/PostCard';

export default function ArchivePage() {
  const { year: yearParam, month: monthParam } = useParams();
  const nav = useNavigate();
  const [years, setYears] = useState<ArchiveYear[]>([]);
  const year = yearParam || '';
  const month = monthParam || '';
  const [posts, setPosts] = useState<PostSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    archiveApi.index().then((r) => setYears(r.years)).catch(() => { });
  }, []);

  useEffect(() => {
    setLoading(true);
    const p = month ? archiveApi.byYearMonth(year, month) : year ? archiveApi.byYear(year) : null;
    if (!p) { setPosts([]); setLoading(false); return; }
    p.then((r) => setPosts(r)).finally(() => setLoading(false));
  }, [year, month]);

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold text-sage-700 dark:text-mint-100 mb-2">🗂️ 文章归档</h1>
      <p className="text-sage-700/60 dark:text-mint-100/50 mb-8">时间的脚印，每篇都是一个切片</p>

      {!year && (
        <div className="grid gap-6">
          {years.map((y) => (
            <div key={y.year} className="card p-6">
              <Link to={`/archive/${y.year}`}
                className="text-xl font-bold text-sage-700 dark:text-mint-100 hover:text-mint-500">
                {y.year}
              </Link>
              <span className="ml-2 text-sm text-sage-700/50 dark:text-mint-100/40">共 {y.total} 篇</span>
              <div className="flex flex-wrap gap-2 mt-3">
                {y.months
                  .slice()
                  .sort((a, b) => b.month - a.month)
                  .map((m) => (
                    <Link
                      key={m.month}
                      to={`/archive/${y.year}/${String(m.month).padStart(2, '0')}`}
                      className="category-chip bg-white border border-mint-200 dark:border-mint-800 dark:bg-slate-800 text-sage-700 dark:text-mint-100/80 hover:bg-mint-50 hover:dark:bg-mint-900/30"
                    >
                      {y.year}年{m.month}月 · {m.count}
                    </Link>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {year && (
        <>
          <button onClick={() => nav('/archive')}
            className="text-mint-600 hover:text-mint-500 text-sm mb-4">← 返回年份列表</button>
          <h2 className="text-xl font-semibold text-sage-700 dark:text-mint-100 mb-6">
            {year}{month ? ` 年 ${Number(month)} 月` : ' 年'} 的文章
          </h2>
          {loading ? (
            <div className="text-center py-20 text-sage-700/50 dark:text-mint-100/40">加载中...</div>
          ) : posts.length === 0 ? (
            <div className="text-center py-20 text-sage-700/50 dark:text-mint-100/40">这个时间没有文章</div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {posts.map((p) => <PostCard key={p.id} post={p} />)}
            </div>
          )}
        </>
      )}
    </div>
  );
}
