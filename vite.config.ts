import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { ManifestOptions, VitePWA } from 'vite-plugin-pwa';

const manifest: Partial<ManifestOptions> = {
    theme_color: '#ffffff',
    background_color: '#ffffff',
    icons: [
        { purpose: 'maskable', sizes: '512x512', src: 'icon512_maskable.png', type: 'image/png' },
        { purpose: 'any', sizes: '512x512', src: 'icon512_rounded.png', type: 'image/png' },
    ],
    orientation: 'any',
    display: 'standalone',
    lang: 'ru-RU',
    name: 'Sport App',
    short_name: 'Sport',
    start_url: '/', // Стартовая страница
    scope: '/', // Область действия PWA
};
export default defineConfig({
    plugins: [
        react(),
        VitePWA({
            registerType: 'autoUpdate',
            workbox: {
                skipWaiting: true, // Немедленно применяем новый Service Worker
                clientsClaim: true, // Контроль над всеми клиентами
                globPatterns: ['**/*.{html,css,js,ico,png,svg,woff2,woff,ttf,scss,tsx,ts,jsx,jpg}'],
                globDirectory: 'dist',
                maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
                runtimeCaching: [
                    {
                        urlPattern: /\.(?:png|jpg|jpeg|svg|ico)$/,
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'images-cache',
                            expiration: {
                                maxEntries: 50,
                                maxAgeSeconds: 30 * 24 * 60 * 60, // 30 дней
                            },
                        },
                    },
                    {
                        urlPattern: /\.(?:js|css)$/,
                        handler: 'StaleWhileRevalidate',
                        options: {
                            cacheName: 'static-resources',
                        },
                    },
                    {
                        urlPattern: /\.(?:woff2|woff|ttf)$/,
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'fonts-cache',
                            expiration: {
                                maxEntries: 10,
                                maxAgeSeconds: 60 * 24 * 60 * 60, // 60 дней
                            },
                        },
                    },
                    {
                        urlPattern: ({ request }) => request.destination === 'document',
                        handler: 'NetworkFirst',
                        options: {
                            cacheName: 'pages-cache',
                            networkTimeoutSeconds: 3,
                            expiration: {
                                maxEntries: 10,
                                maxAgeSeconds: 24 * 60 * 60, // 1 день
                            },
                        },
                    },
                    
                ],
            },
            manifest: manifest,
            injectManifest: {
                swSrc: 'src/sw.ts', // Путь к вашему кастомному Service Worker
                swDest: 'dist/sw.js', // Куда сохранить сгенерированный Service Worker
            },
        }),
    ],
    build: {
        minify: 'terser',
        terserOptions: {
            compress: {
                drop_console: true, // Удалить console.log в production
            },
        },
        rollupOptions: {
            output: {
                manualChunks: {
                    vendor: ['react', 'react-dom'],
                },
            },
        },
    },
});
