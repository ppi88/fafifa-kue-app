import React from "react";
import { Link, useLocation } from "react-router-dom";

const menu = [
  { path: "/", label: "Input Stok", icon: "📋" },
  { path: "/laporan", label: "Laporan", icon: "📊" },
];

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();

  return (
    <div className="flex min-h-screen bg-gray-50">

      {/* Sidebar – hanya tampil untuk layar md ke atas */}
      <aside className="hidden md:flex flex-col w-56 bg-white shadow-lg">
        <div className="text-lg font-bold px-6 py-4 border-b bg-blue-600 text-white">
          🍰 Fafifa Stok
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {menu.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2 px-3 py-2 rounded-md font-medium ${
                  active
                    ? "bg-blue-600 text-white"
                    : "text-gray-700 hover:bg-blue-50"
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Bagian utama */}
      <main className="flex-1 overflow-y-auto">
        {/* Navbar – hanya tampil di mobile */}
        <div className="md:hidden flex justify-between items-center px-4 py-3 bg-white shadow">
          <div className="font-bold text-blue-700">🍰 Fafifa Stok</div>
          <div className="flex gap-4 text-xl">
            {menu.map((item) => {
              const active = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={active ? "text-blue-600" : "text-gray-600"}
                >
                  {item.icon}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Konten halaman */}
        <div className="p-4 md:p-6">{children}</div>
      </main>
    </div>
  );
};

export default MainLayout;