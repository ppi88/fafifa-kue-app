export const navItems = [
  { label: "Dashboard", icon: "🏠", path: "/" },
  { label: "Input Stok", icon: "📦", path: "/input-stok" },
  { label: "Laporan Stok", icon: "📋", path: "/laporan-stok-produksi" },
  { label: "Analisa", icon: "📊", path: "/analisa" },
];

// Membuat map untuk pencarian cepat path -> index
export const pathMap = new Map(navItems.map((item, index) => [item.path, index]));