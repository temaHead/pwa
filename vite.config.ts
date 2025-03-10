import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { ManifestOptions, VitePWA } from 'vite-plugin-pwa';

const manifest: Partial<ManifestOptions> = {
    theme_color: '#edf2f5',
    background_color: '#edf2f5',
    icons: [
        { purpose: 'maskable', sizes: '512x512', src: 'icon512_maskable.png', type: 'image/png' },
        { purpose: 'any', sizes: '512x512', src: 'icon512_rounded.png', type: 'image/png' },
    ],
    display: 'standalone',
    lang: 'ru-RU',
    name: 'Sport App',
    short_name: 'Sport',
    start_url: '/',
    scope: '/',
    orientation: 'portrait',
};

export default defineConfig({
    plugins: [
        react(),
        VitePWA({
            registerType: 'autoUpdate',
            // registerType: 'prompt', // Запрашивать подтверждение перед обновлением
            workbox: {
                skipWaiting: true,
                clientsClaim: true,
                globPatterns: ['**/*.{html,css,scss,js,ico,png,svg,woff2,woff,ttf,tsx,ts,jsx,jpg}'],
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
                        urlPattern: /\.(?:js|css|scss)$/,
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
                                maxAgeSeconds: 365 * 24 * 60 * 60, // 60 дней
                            },
                        },
                    },
                    {
                        urlPattern: ({ request }) => request.destination === 'document',
                        handler: 'NetworkFirst',
                        options: {
                            cacheName: 'pages-cache',
                            networkTimeoutSeconds: 5,
                            expiration: {
                                maxEntries: 10,
                                maxAgeSeconds: 24 * 60 * 60, // 1 день
                            },
                        },
                    },
                ],
            },
            manifest: manifest,
            // injectManifest: {
            //     swSrc: 'src/sw.ts',
            //     swDest: 'dist/sw.js',
            // },
        }),
    ],
    css: {
        preprocessorOptions: {
            scss: {
            },
        },
        modules: {
            localsConvention: 'camelCaseOnly', // Оптимизация имен классов
        },
    },
    build: {
        target: 'esnext',
        minify: 'terser',
        terserOptions: {
            compress: {
                drop_console: true,
                drop_debugger: true,
                pure_funcs: ['console.log', 'console.info'],
            },
        },
        rollupOptions: {
            output: {
                manualChunks: {
                    vendor: ['react', 'react-dom'],
                    antd: ['antd'],
                },
            },
        },
        modulePreload: {
            polyfill: false,
        },
    },
    optimizeDeps: {
        include: ['react', 'react-dom', 'antd'],
    },
});
