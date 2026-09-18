export default defineNuxtConfig({
  ssr: false,
  devtools: { enabled: true },
  compatibilityDate: '2026-09-17',
  modules: ['@nuxt/eslint', '@vite-pwa/nuxt'],
  css: ['~/assets/css/app.css'],
  app: {
    head: {
      link: [
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/icons/apple-touch-icon.png' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&family=Instrument+Serif:ital@0;1&family=IBM+Plex+Mono:wght@400;500&display=swap',
        },
      ],
      meta: [
        { name: 'theme-color', content: '#F2ECE7' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-title', content: 'Laulau & Coco' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'default' },
      ],
    },
  },
  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: 'Laulau & Coco',
      short_name: 'L&C',
      description: 'Guide de voyage hors ligne pour notre séjour à Séville.',
      id: '/carte/',
      start_url: '/carte/',
      scope: '/',
      display: 'standalone',
      theme_color: '#F2ECE7',
      background_color: '#F2ECE7',
      icons: [
        { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
        { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
        { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
      ],
    },
    workbox: {
      navigateFallback: '/',
      // mjs : le worker MapLibre GL et son chunk partagé (public/maplibre-gl-worker.mjs,
      // public/maplibre-gl-shared.mjs) — nécessaires au décodage des tuiles vectorielles,
      // sans quoi la carte affiche un fond vide sans aucune erreur visible.
      globPatterns: ['**/*.{js,mjs,css,html,ico,png,svg,json,woff2,pbf}'],
      runtimeCaching: [
        {
          urlPattern: /\/seville\.pmtiles$/,
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
