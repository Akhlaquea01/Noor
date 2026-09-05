import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  // Default (lightningcss) autoprefixing rewrites `backdrop-filter` down to
  // only `-webkit-backdrop-filter` for its default browser targets, which
  // silently breaks the glassmorphism surfaces in modern Chromium (which
  // supports the unprefixed property but not the -webkit- one). 'postcss'
  // passes our hand-written dual declarations through unmodified.
  css: {
    transformer: 'postcss',
  },
  build: {
    // lightningcss's minifier also rewrites backdrop-filter regardless of
    // the css.transformer setting above; esbuild isn't bundled as a
    // dependency here to fall back to, so disable CSS minification outright
    // (the stylesheet is small — this costs a few KB, not correctness).
    cssMinify: false,
  },
  plugins: [
    react(),
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src/sw',
      filename: 'sw.ts',
      injectRegister: false,
      manifest: {
        name: 'Noor — Islamic Companion',
        short_name: 'Noor',
        description: "Noor — Your Islamic Companion, Wherever You Are.",
        start_url: '/',
        scope: '/',
        display: 'standalone',
        background_color: '#0f5132',
        theme_color: '#0f5132',
        lang: 'en',
        dir: 'ltr',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
        // Routing is hash-based (see router.tsx) — a shortcut url must include
        // the '#/...' segment itself. A bare '/quran' would launch the app at
        // path "/" with an empty hash, landing on Home instead of the
        // intended screen, since the router only ever reads location.hash.
        shortcuts: [
          { name: 'Quran', url: '/#/quran', icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }] },
          { name: 'Prayer Times', url: '/#/prayer-times', icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }] },
          { name: 'Qibla', url: '/#/qibla', icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }] },
          { name: 'Tasbih', url: '/#/tasbih', icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }] },
        ],
      },
      injectManifest: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}', 'data/**/*.json'],
        globIgnores: ['**/*-ext-*', '**/*.woff'],
      },
      devOptions: {
        enabled: true,
        type: 'module',
      },
    }),
  ],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/setupTests.ts'],
    exclude: ['node_modules', 'dist', 'dev-dist'],
  },
})
