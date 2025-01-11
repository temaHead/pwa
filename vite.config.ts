import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { ManifestOptions, VitePWA } from 'vite-plugin-pwa';

const manifest: Partial<ManifestOptions> = {
    theme_color: '#f3ff52',
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
};
// https://vite.dev/config/
export default defineConfig({
    plugins: [
        react(),
        VitePWA({
            registerType: 'autoUpdate',
            workbox: {
                globPatterns: ['**/*.{html, css, js, ico, png, svg }'],
            },
            manifest: manifest,
        }),
    ],
});
