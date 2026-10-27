import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';
import { rssUrl } from '../utils/api';

export default function Navbar() {
  const { user, logout } = useAuth();
  const nav = useNavigate();

  return (
    <header className="sticky top-0 z-30 bg-cream-50/85 dark:bg-slate-900/85 backdrop-blur border-b border-mint-100 dark:border-mint-800">
      <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-bold text-sage-700 dark:text-mint-100 text-lg">
          <span className="w-7 h-7 rounded-full bg-gradient-to-br from-mint-300 to-mint-500 flex items-center justify-center text-white text-xs">🌿</span>
          薄荷随笔
        </Link>

        <nav className="flex items-center gap-1 text-sm">
          <NavLink to="/" end className={({ isActive }) => `px-3 py-1.5 rounded-lg transition ${isActive ? 'text-mint-700 dark:text-mint-300 bg-mint-50 dark:bg-mint-900/30' : 'text-sage-700/70 dark:text-mint-100/60 hover:text-mint-600'}`}>首页</NavLink>
          <NavLink to="/archive" className={({ isActive }) => `px-3 py-1.5 rounded-lg transition ${isActive ? 'text-mint-700 dark:text-mint-300 bg-mint-50 dark:bg-mint-900/30' : 'text-sage-700/70 dark:text-mint-100/60 hover:text-mint-600'}`}>归档</NavLink>
          <a href={rssUrl} target="_blank" rel="noreferrer" className="px-3 py-1.5 rounded-lg text-sage-700/70 dark:text-mint-100/60 hover:text-mint-600">RSS</a>
          {user && (
            <NavLink to="/write" className={({ isActive }) => `px-3 py-1.5 rounded-lg transition ${isActive ? 'text-mint-700 dark:text-mint-300 bg-mint-50 dark:bg-mint-900/30' : 'text-sage-700/70 dark:text-mint-100/60 hover:text-mint-600'}`}>写文章</NavLink>
          )}
        </nav>

        <div className="flex items-center gap-2 text-sm">
          <ThemeToggle />
          {user ? (
            <>
              <Link to="/profile" className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-mint-50 hover:dark:bg-mint-900/30">
                <span className="w-7 h-7 rounded-full bg-mint-200 dark:bg-mint-800 flex items-center justify-center text-mint-700 dark:text-mint-200 font-medium text-xs overflow-hidden">
                  {user.avatar ? <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" /> : user.username[0]?.toUpperCase()}
                </span>
                <span className="text-sage-700 dark:text-mint-100">{user.username}</span>
              </Link>
              <button onClick={() => { logout(); nav('/'); }} className="btn-ghost !py-1.5">退出</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-ghost !py-1.5">登录</Link>
              <Link to="/register" className="btn-primary !py-1.5">注册</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
