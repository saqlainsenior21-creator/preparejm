import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'logo192.png'],
      manifest: {
        name: 'PrepareJM — Jamaica Emergency System',
        short_name: 'PrepareJM',
        description: 'Jamaica Disaster Preparedness & Emergency Alert System',
        theme_color: '#1a3a6b',
        background_color: '#0f1e3d',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: '/logo192.png', sizes: '192x192', type: 'image/png' },
          { src: '/logo512.png', sizes: '512x512', type: 'image/png' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https?:\/\/.*\/api\/alerts/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'alerts-cache',
              expiration: { maxEntries: 20, maxAgeSeconds: 300 },
              networkTimeoutSeconds: 5,
            }
          },
          {
            urlPattern: /^https?:\/\/.*\/api\/shelters/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'shelters-cache',
              expiration: { maxEntries: 100, maxAgeSeconds: 3600 },
              networkTimeoutSeconds: 5,
            }
          },
          {
            urlPattern: /^https:\/\/tile\.openstreetmap\.org/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'map-tiles',
              expiration: { maxEntries: 500, maxAgeSeconds: 7 * 24 * 3600 },
            }
          }
        ]
      }
    })
  ],
  server: {
    proxy: {
      '/api': { target: 'http://localhost:4004', changeOrigin: true }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false
  }
});
