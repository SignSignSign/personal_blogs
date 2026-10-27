import { useEffect, useState } from 'react';

/** 细横条阅读进度条：固定顶部，根据正文滚动百分比实时更新 */
export default function ReadingProgress({ targetId }: { targetId: string }) {
  const [pct, setPct] = useState(0);

  useEffect(() => {
    const el = document.getElementById(targetId);
    if (!el) return;

    const onScroll = () => {
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const height = el.clientHeight;
      const offset = -rect.top;
      if (offset <= 0) { setPct(0); return; }
      const max = height - vh;
      setPct(Math.min(100, Math.max(0, (offset / Math.max(1, max)) * 100)));
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [targetId]);

  return (
    <div className="fixed top-14 left-0 right-0 z-10 h-1 bg-cream-100 dark:bg-mint-900/30">
      <div
        className="h-full bg-gradient-to-r from-mint-400 to-mint-500 transition-[width] duration-150"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
