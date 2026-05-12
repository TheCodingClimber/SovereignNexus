import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://127.0.0.1:3001',
    },
  },
  build: {
    // The scroll assembly scene lazy-loads Three.js, so the large vendor chunk is intentional.
    chunkSizeWarningLimit: 750,
  },
})
