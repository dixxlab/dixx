import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      // globPatterns default do workbox não inclui woff2; sem isso a fonte de display
      // não entra no precache e o app abre offline sem ela.
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        // As propostas de marca são material de referência: continuam
        // publicadas, mas não têm por que ocupar o cache offline do app.
        globIgnores: ['**/brand-proposals/**'],
        // As demonstrações ficam FORA do precache de propósito: entrariam ~9MB no
        // PWA instalado por algo que a maioria das séries nem abre. Em vez disso
        // cada exercício é cacheado na primeira vez que o usuário abre a
        // demonstração dele, e a partir daí funciona offline na academia.
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/cdn\.jsdelivr\.net\/gh\/yuhonas\/free-exercise-db@main\/exercises\//,
            handler: 'CacheFirst',
            options: {
              cacheName: 'dixx-demos-v1',
              expiration: { maxEntries: 140, maxAgeSeconds: 60 * 60 * 24 * 60 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
      manifest: {
        name: 'Dixx - Treino de Academia',
        short_name: 'Dixx',
        description: 'Seu app de treino. Acompanhe progresso, registre treinos e evolua.',
        theme_color: '#08090b',
        background_color: '#08090b',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
})