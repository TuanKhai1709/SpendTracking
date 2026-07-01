import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/SpendTracking/',
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/payos': {
        target: 'https://api-merchant.payos.vn',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/payos/, ''),
      },
    },
  }
});
