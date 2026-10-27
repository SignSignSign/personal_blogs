import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../utils/api';

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authApi.register({ username, email, password });
      alert('注册成功，请登录');
      nav('/login', { replace: true });
    } catch (err: any) {
      alert(err.message);
    } finally { setLoading(false); }
  };

  return (
    <div className="max-w-md mx-auto px-6 py-16">
      <div className="card p-8">
        <h1 className="text-2xl font-bold text-sage-700 mb-2">加入薄荷随笔 🌱</h1>
        <p className="text-sm text-sage-700/60 mb-6">开启你的写作之旅</p>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm text-sage-700/70 mb-1">用户名（3–20 字符）</label>
            <input value={username} onChange={(e) => setUsername(e.target.value)} className="input" required minLength={3} maxLength={20} />
          </div>
          <div>
            <label className="block text-sm text-sage-700/70 mb-1">邮箱</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input" required />
          </div>
          <div>
            <label className="block text-sm text-sage-700/70 mb-1">密码（至少 6 位）</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input" required minLength={6} />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full !py-2.5">{loading ? '注册中...' : '注册'}</button>
        </form>
        <p className="text-sm text-center text-sage-700/60 mt-6">
          已有账号？<Link to="/login" className="text-mint-600 hover:text-mint-500">去登录</Link>
        </p>
      </div>
    </div>
  );
}
