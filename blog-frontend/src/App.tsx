import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import PostDetail from './pages/PostDetail';
import WritePost from './pages/WritePost';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';
import ArchivePage from './pages/ArchivePage';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
              <Route path="/post/:id" element={<PostDetail />} />
              <Route path="/archive" element={<ArchivePage />} />
              <Route path="/archive/:year" element={<ArchivePage />} />
              <Route path="/archive/:year/:month" element={<ArchivePage />} />
              <Route path="/write" element={<ProtectedRoute><WritePost /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="*" element={<div className="text-center py-32 text-sage-700/50 dark:text-mint-100/40">页面不存在 🌿</div>} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
