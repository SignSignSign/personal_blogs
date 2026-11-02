import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base 必须是 '/'：本站是 SPA，深路由（/post/2）会被 _redirects 回退到 index.html，
// 若用 './'，静态资源会被解析成 /post/assets/... 而 404
export default defineConfig({
  plugins: [react()],
  base: '/',
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});
