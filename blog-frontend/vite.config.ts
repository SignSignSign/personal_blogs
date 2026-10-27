import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base: './' 用相对路径，Netlify / 任意子路径部署都能正常加载资源
export default defineConfig({
  plugins: [react()],
  base: './',
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
