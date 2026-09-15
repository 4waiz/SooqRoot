import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * base: './' keeps every asset reference relative, so the same build runs from
 * a domain root, a GitHub Pages project subpath, or a local file server.
 * The app uses a hash router, so there is no SPA rewrite to configure either.
 */
export default defineConfig({
  plugins: [react()],
  base: './',
  server: {
    port: 5173,
    host: true,
  },
  build: {
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          charts: ['recharts'],
          icons: ['lucide-react'],
        },
      },
    },
  },
});
