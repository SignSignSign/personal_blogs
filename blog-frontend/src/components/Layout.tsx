import Navbar from './Navbar';
import { Outlet } from 'react-router-dom';

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-cream-50">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-mint-100 dark:border-mint-800 mt-16 py-6 text-center text-sm text-sage-700/50 dark:text-mint-100/40 relative overflow-hidden">
        {/* 底部草丛装饰 */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-1 text-mint-400/30">
          <span className="text-xl">🌾</span><span>🌿</span><span>🌱</span><span className="text-lg">🍀</span><span>🌿</span><span>🌾</span><span>🌱</span>
        </div>
        <div className="relative z-10 flex items-center justify-center gap-2">
          <span>🌼</span>
          <span>© {new Date().getFullYear()} 薄荷随笔 · 一片安静的个人写作角落</span>
          <span>🌼</span>
        </div>
      </footer>
    </div>
  );
}
