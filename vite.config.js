import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: '장비 관리 시스템',
        short_name: '장비맵',
        description: '지도 기반 장비 관리 PWA',
        theme_color: '#ffffff',
        icons: [
          {
            src: 'icon-192x192.svg', // public 폴더 기준 경로
            sizes: '192x192',
            type: 'image/svg+xml'
          },
          {
            src: 'icon-512x512.svg', // public 폴더 기준 경로
            sizes: '512x512',
            type: 'image/svg+xml'
          }
        ]
      }
    })
  ],
}) 