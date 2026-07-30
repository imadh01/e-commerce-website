import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './', // Ensures relative paths for static build assets
  server: {
    host: true, // Listens on all local IP addresses for dev mode
    port: 5173,
    proxy: {
      "/api": {
        target: "https://mamluktest.synergeinsolutions.com",
        changeOrigin: true,
        cookieDomainRewrite: "localhost",
        secure: false,
      },
      "/sundayoffer": {
        target: "https://mamluktest.synergeinsolutions.com",
        changeOrigin: true,
        cookieDomainRewrite: "localhost",
        secure: false,
      },
    },
  },
});