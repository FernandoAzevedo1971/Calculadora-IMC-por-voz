/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'node:path';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons/icon.svg', 'icons/icon-maskable.svg'],
      manifest: {
        name: 'IMC Voz — Calculadora de IMC por Voz',
        short_name: 'IMC Voz',
        description: 'Calcule seu IMC falando o peso e a altura. Histórico, perfis e métricas extras, tudo no seu dispositivo.',
        lang: 'pt-BR',
        dir: 'ltr',
        start_url: '/',
        display: 'standalone',
        background_color: '#0b1020',
        theme_color: '#0ea5e9',
        orientation: 'portrait',
        icons: [
          { src: '/icons/icon.svg', sizes: 'any', type: 'image/svg+xml' },
          { src: '/icons/icon-maskable.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'maskable' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,webmanifest}'],
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.destination === 'font',
            handler: 'CacheFirst',
            options: { cacheName: 'fonts', expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 30 } }
          }
        ]
      }
    })
  ],
  resolve: {
    alias: { '@': path.resolve(__dirname, 'src') }
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    css: false
  }
});
