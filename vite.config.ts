import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

declare const process: { env: Record<string, string | undefined> };

// GitHub Pages 프로젝트 사이트 하위 경로. 로컬 dev에서는 '/'.
const base = process.env.GITHUB_PAGES ? '/bible-memo/' : '/';

// https://vite.dev/config/
export default defineConfig({
  base,
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/icon-192.png', 'icons/icon-512.png'],
      manifest: {
        name: '성경 암송 도우미',
        short_name: 'BibleMemo',
        description: '매주 말씀을 암송하고 묶음 시험으로 점검하세요',
        theme_color: '#4A6741',
        background_color: '#FBF8F1',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '.',
        scope: base,
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
      },
    }),
  ],
});
