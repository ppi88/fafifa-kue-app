// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path' // <-- BARU: Import modul path

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // BARU: Menetapkan alias @/ untuk menunjuk ke folder src/
      '@': path.resolve(__dirname, './src'),
    },
  },
})