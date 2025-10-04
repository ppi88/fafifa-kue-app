import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// ✅ Konfigurasi Vite untuk proyek React + FastAPI backend
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"), // ✅ alias @ diarahkan ke folder src
    },
  },
  server: {
    port: 5173, // Port default untuk Vite dev server
    proxy: {
      // ✅ Proxy semua request yang diawali dengan /api ke backend FastAPI
      "/api": {
        target: "http://localhost:8000", // Alamat backend FastAPI
        changeOrigin: true,              // Ubah origin agar cocok dengan target
        secure: false,                   // Nonaktifkan SSL verification (untuk HTTP)
        rewrite: (path) => path.replace(/^\/api/, ""), // Hapus prefix /api sebelum diteruskan ke backend
      },
    },
  },
});
