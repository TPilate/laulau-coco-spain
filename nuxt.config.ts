export default defineNuxtConfig({
  ssr: false,
  devtools: { enabled: true },
  compatibilityDate: '2026-09-17',
  modules: ['@nuxt/eslint', '@vite-pwa/nuxt'],
  // Polices auto-hébergées (@fontsource) plutôt que Google Fonts : le service worker
  // ne peut mettre en cache que ce qui vient de notre propre origine, donc charger les
  // polices depuis fonts.googleapis.com laisserait l'app sans texte lisible hors ligne
  // tant que le cache navigateur du CDN n'a pas déjà servi ces fichiers.
  // Sous-ensembles latin/latin-ext uniquement (pas cyrillic/vietnamese, absents du
  // contenu français/espagnol de l'app) pour ne pas gonfler le précache PWA.
  css: [
    '@fontsource/dm-sans/latin-400.css',
    '@fontsource/dm-sans/latin-ext-400.css',
    '@fontsource/dm-sans/latin-500.css',
    '@fontsource/dm-sans/latin-ext-500.css',
    '@fontsource/dm-sans/latin-700.css',
    '@fontsource/dm-sans/latin-ext-700.css',
    '@fontsource/space-grotesk/latin-400.css',
    '@fontsource/space-grotesk/latin-ext-400.css',
    '@fontsource/space-grotesk/latin-500.css',
    '@fontsource/space-grotesk/latin-ext-500.css',
    '@fontsource/space-grotesk/latin-700.css',
    '@fontsource/space-grotesk/latin-ext-700.css',
    '@fontsource/jetbrains-mono/latin-400.css',
    '@fontsource/jetbrains-mono/latin-ext-400.css',
    '@fontsource/jetbrains-mono/latin-500.css',
    '@fontsource/jetbrains-mono/latin-ext-500.css',
    '~/assets/css/app.css',
  ],
  app: {
    head: {
      link: [{ rel: 'apple-touch-icon', sizes: '180x180', href: '/icons/apple-touch-icon.png' }],
      meta: [
        { name: 'theme-color', content: '#F2F0F7' },
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
      theme_color: '#F2F0F7',
      background_color: '#F2F0F7',
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
