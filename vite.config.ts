import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/khytriachok-adventures/',

  plugins: [
    react(),

    VitePWA({
      registerType: 'autoUpdate',

      injectRegister: 'auto',

      includeAssets: [
        'favicon.png',
        'icons/apple-touch-icon.png',
        'icons/icon-72.png',
        'icons/icon-96.png',
        'icons/icon-128.png',
        'icons/icon-144.png',
        'icons/icon-152.png',
        'icons/icon-180.png',
        'icons/icon-192.png',
        'icons/icon-384.png',
        'icons/icon-512.png',
      ],

      manifest: {
        id: '/khytriachok-adventures/',

        name: 'Пригоди Їжачка Хитрячка',
        short_name: 'Хитрячок',

        description:
          'Весела математична гра для дітей з Їжачком Хитрячком',

        lang: 'uk',
        dir: 'ltr',

        start_url: '/khytriachok-adventures/',
        scope: '/khytriachok-adventures/',

        display: 'standalone',
        display_override: [
          'window-controls-overlay',
          'standalone',
          'minimal-ui',
        ],

        orientation: 'landscape',

        background_color: '#cceeff',
        theme_color: '#7eb043',

        categories: [
          'education',
          'games',
          'kids',
        ],

        icons: [
          {
            src: 'icons/icon-72.png',
            sizes: '72x72',
            type: 'image/png',
          },
          {
            src: 'icons/icon-96.png',
            sizes: '96x96',
            type: 'image/png',
          },
          {
            src: 'icons/icon-128.png',
            sizes: '128x128',
            type: 'image/png',
          },
          {
            src: 'icons/icon-144.png',
            sizes: '144x144',
            type: 'image/png',
          },
          {
            src: 'icons/icon-152.png',
            sizes: '152x152',
            type: 'image/png',
          },
          {
            src: 'icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'icons/icon-192-maskable.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable',
          },
          {
            src: 'icons/icon-384.png',
            sizes: '384x384',
            type: 'image/png',
          },
          {
            src: 'icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'icons/icon-512-maskable.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },

      workbox: {
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,

        globPatterns: [
          '**/*.{js,css,html,png,svg,ico,webp,woff,woff2}',
        ],

        navigateFallback: 'index.html',

        runtimeCaching: [
          {
            urlPattern: ({ request }) =>
              request.destination === 'image',

            handler: 'CacheFirst',

            options: {
              cacheName: 'khytriachok-images',

              expiration: {
                maxEntries: 80,
                maxAgeSeconds:
                  60 * 60 * 24 * 30,
              },

              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },

      devOptions: {
        enabled: true,
        type: 'module',
      },
    }),
  ],
})
