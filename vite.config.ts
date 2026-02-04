import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  base: '/spring-festival-planner/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
      },
    },
  },
  server: {
    port: 5173,
    host: true,
    open: true,
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'antd', 'dayjs', 'lunar-javascript'],
  },
});