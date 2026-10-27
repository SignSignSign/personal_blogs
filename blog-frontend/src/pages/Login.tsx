import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();
  const { login } = useAuth();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authApi.login({ username, password });
      login(res.token, res.user);
      nav('/', { replace: true });
    } catch (err: any) {
      alert(err.message);
    } finally { setLoading(false); }
  };

  return (
    <div className="max-w-md mx-auto px-6 py-16">
      <div className="card p-8">
        <h1 className="text-2xl font-bold text-sage-700 mb-2">欢迎回来 🌿</h1>
        <p className="text-sm text-sage-700/60 mb-6">登录后继续你的写作</p>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm text-sage-700/70 mb-1">用户名</label>
            <input value={username} onChange={(e) => setUsername(e.target.value)} className="input" required />
          </div>
          <div>
            <label className="block text-sm text-sage-700/70 mb-1">密码</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input" required />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full !py-2.5">{loading ? '登录中...' : '登录'}</button>
        </form>
        <p className="text-sm text-center text-sage-700/60 mt-6">
          还没有账号？<Link to="/register" className="text-mint-600 hover:text-mint-500">去注册</Link>
        </p>
      </div>
    </div>
  );
}
