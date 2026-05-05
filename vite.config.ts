import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// PWA/service worker disabled — was caching stale auth responses and breaking app mount
// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [
    react(),
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:18789',
        changeOrigin: true,
      }
    }
  }
})
