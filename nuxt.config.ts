export default defineNuxtConfig({
  ssr: false,
  devtools: { enabled: false },
  compatibilityDate: '2026-09-17',
  modules: ['@nuxt/eslint', '@vite-pwa/nuxt'],
  app: {
    head: {
      link: [{ rel: 'apple-touch-icon', sizes: '180x180', href: '/icons/apple-touch-icon.png' }],
      meta: [{ name: 'theme-color', content: '#E2572B' }],
    },
  },
  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: 'Laulau & Coco',
      short_name: 'L&C',
      description: 'Guide de voyage hors ligne pour notre séjour à Valence.',
      display: 'standalone',
      theme_color: '#E2572B',
      background_color: '#FFF8F0',
      icons: [
        { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
        { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
        { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
      ],
    },
    workbox: {
      globPatterns: ['**/*.{js,css,html,ico,png,svg,json,woff2,pbf}'],
      runtimeCaching: [
        {
          urlPattern: /\/valencia\.pmtiles$/,
          handler: 'CacheFirst',
          options: {
            cacheName: 'map',
            rangeRequests: true,
            cacheableResponse: { statuses: [200] },
          },
        },
      ],
    },
  },
})
