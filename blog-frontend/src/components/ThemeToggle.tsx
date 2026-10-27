import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return (
    <button
      onClick={toggle}
      title={theme === 'light' ? '切换到暗黑模式' : '切换到浅色模式'}
      className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-mint-50 hover:dark:bg-mint-900/30 transition text-lg"
    >
      {theme === 'light' ? '🌙' : '☀️'}
    </button>
  );
}
