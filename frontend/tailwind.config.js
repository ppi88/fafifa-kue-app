// tailwind.config.js

/** @type {import('tailwindcss').Config} */
module.exports = {
  // PENTING: HAPUS 'important: true' JIKA TIDAK DIPERLUKAN.
  // Jika ini tetap ada, masalah akan timbul pada class utility Tailwind lainnya.
  // Hapus baris 'important: true,' 

  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {}
  },
  
  // PERBAIKAN: Menonaktifkan reset tabel Preflight
  corePlugins: {
    preflight: true, 
    // Menonaktifkan reset tabel agar react-datepicker yang baru pun stabil
    table: false, 
  },
  
  plugins: [],
};