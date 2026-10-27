import { useEffect, useMemo, useState } from 'react';

interface Heading { id: string; level: number; text: string; el?: HTMLElement }

/**
 * 文章右侧悬浮目录导航。
 * 自动扫描 #post-content 内的 h1-h3，点击跳转，滚动自动高亮当前。
 */
export default function TableOfContents({ contentRootId }: { contentRootId: string }) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const headings = useMemo<Heading[]>(() => {
    const root = document.getElementById(contentRootId);
    if (!root) return [];
    const list = root.querySelectorAll('h1, h2, h3') as NodeListOf<HTMLElement>;
    const arr: Heading[] = [];
    list.forEach((h, idx) => {
      if (!h.id) h.id = `h-${idx}`;
      arr.push({ id: h.id, level: Number(h.tagName[1]), text: h.textContent || '', el: h });
    });
    return arr;
  }, [contentRootId]);

  useEffect(() => {
    if (!headings.length) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActiveId((e.target as HTMLElement).id);
        });
      },
      { rootMargin: '-80px 0px -70% 0px', threshold: [0, 1] }
    );
    headings.forEach((h) => h.el && obs.observe(h.el));
    return () => obs.disconnect();
  }, [headings]);

  if (!headings.length) return null;

  const jump = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 60, behavior: 'smooth' });
      setMobileOpen(false);
    }
  };

  return (
    <>
      {/* 桌面端：右侧悬浮 */}
      <nav className="hidden lg:block fixed right-4 xl:right-8 top-24 w-52 max-h-[calc(100vh-8rem)] overflow-y-auto pr-2 text-sm">
        <div className="text-xs text-sage-700/50 dark:text-mint-100/40 mb-2 uppercase tracking-wider">目录</div>
        <ul className="space-y-1 border-l border-mint-100 dark:border-mint-800 pl-2">
          {headings.map((h) => (
            <li key={h.id} style={{ paddingLeft: `${(h.level - 1) * 0.5}rem` }}>
              <button
                onClick={() => jump(h.id)}
                className={`text-left w-full py-1 transition truncate ${
                  activeId === h.id
                    ? 'text-mint-600 dark:text-mint-300 font-medium'
                    : 'text-sage-700/60 dark:text-mint-100/50 hover:text-mint-500 hover:dark:text-mint-300'
                }`}
              >
                {h.text}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* 移动端：可收起 */}
      <div className="lg:hidden fixed bottom-4 right-4 z-20">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="w-10 h-10 rounded-full bg-mint-400 text-white shadow-soft flex items-center justify-center"
          title="目录"
        >📑</button>
        {mobileOpen && (
          <ul className="mt-2 bg-white dark:bg-slate-800 rounded-xl border border-mint-100 dark:border-mint-800 shadow-soft p-2 max-h-72 overflow-y-auto w-64">
            {headings.map((h) => (
              <li key={h.id} style={{ paddingLeft: `${(h.level - 1) * 0.5}rem` }}>
                <button
                  onClick={() => jump(h.id)}
                  className={`text-left w-full py-1 text-sm ${
                    activeId === h.id ? 'text-mint-600 dark:text-mint-300 font-medium' : 'text-sage-700/60 dark:text-mint-100/50'
                  }`}
                >{h.text}</button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
