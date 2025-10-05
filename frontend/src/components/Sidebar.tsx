import { Link, useLocation } from "react-router-dom";

const navItems = [
  { label: "Dashboard", icon: "🏠", path: "/" },
  { label: "Input Stok", icon: "📦", path: "/input-stok" },
  { label: "Laporan Stok", icon: "📋", path: "/laporan-stok-produksi" },
  { label: "Analisa", icon: "📊", path: "/analisa" },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <aside className="w-48 bg-white border-r h-screen hidden md:flex flex-col">
      <div className="p-4 font-bold text-lg text-green-600">🍰 Fafifa Kue</div>
      <nav className="flex-1 space-y-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-2 px-4 py-2 rounded ${
                isActive
                  ? "bg-green-100 text-green-700 font-semibold"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}