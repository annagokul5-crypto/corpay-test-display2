import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true,
      },
      manifest: {
        name: 'dashboard 2 - FINAL',
        short_name: 'Corpay',
        theme_color: '#981239',
        background_color: '#ffffff',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        icons: [
          { src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,svg,json,woff2,ico}'],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5 MB to allow PWA icons
        cleanupOutdatedCaches: true,
      },
      includeAssets: ['pwa-192x192.png', 'pwa-512x512.png', 'placeholder.svg', 'favicon.ico'],
    }),
  ],
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    target: 'esnext',
    outDir: 'build',
  },
  server: {
    port: 5174,
    host: true,
    open: true,
    // Proxy Unsplash to avoid ERR_CERT_AUTHORITY_INVALID when using HTTPS localhost or strict SSL
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/unsplash': {
        target: 'https://images.unsplash.com',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/unsplash/, ''),
      },
    },
  },
});