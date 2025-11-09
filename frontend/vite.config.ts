// frontend/vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa'; // <-- 1. IMPORT THE PLUGIN

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),

    // --- 2. ADD THE PWA PLUGIN ---
    VitePWA({
      // This will automatically update the app in the background
      registerType: 'autoUpdate',

      // This tells the plugin to cache these files
      includeAssets: ['favicon.svg'],

      // This is the "manifest" file that tells the OS about your app
      manifest: {
        name: 'CampusBookEx',
        short_name: 'CampusEx',
        description: 'A peer-to-peer book exchange platform for students.',
        // Use our project's colors
        theme_color: '#0D47A1',
        background_color: '#F8F9FA',

        // This is the magic: it will use our favicon.svg
        // to automatically generate all the app icons.
        icons: [
          {
            src: 'favicon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
        ],
      },
    }),
  ],
});
