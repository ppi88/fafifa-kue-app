import React from "react";
import { BrowserRouter, Routes, Route, Link, Outlet, useLocation } from "react-router-dom";
import InputStokKue from "./pages/InputStokKue";
import LaporanStokKue from "./pages/LaporanStokKue";

function Layout() {
  const location = useLocation();
  const menu = [
    { path: "/", label: "Input", icon: "📋" },
    { path: "/laporan", label: "Laporan", icon: "📊" },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50 relative">
      <aside className="hidden md:flex flex-col w-56 bg-white shadow-lg">
        <div className="text-lg font-bold px-6 py-4 border-b bg-blue-600 text-white">🍰 Fafifa Stok</div>
        <nav className="flex-1 p-4 space-y-2">
          {menu.map((m) => {
            const active = location.pathname === m.path;
            return (
              <Link key={m.path} to={m.path} className={`flex items-center gap-2 px-3 py-2 rounded-md font-medium transition ${active ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-blue-50"}`}>
                <span>{m.icon}</span>
                <span>{m.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
      <main className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto p-4 md:p-6 pb-20 md:pb-6">
          <Outlet />
        </div>
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white shadow-inner border-t">
          <div className="flex justify-around py-2">
            {menu.map((m) => {
              const active = location.pathname === m.path;
              return (
                <Link key={m.path} to={m.path} className={`flex flex-col items-center text-sm transition ${active ? "text-blue-600" : "text-gray-600 hover:text-blue-500"}`}>
                  <span className="text-xl">{m.icon}</span>
                  <span>{m.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<InputStokKue />} />
          <Route path="/laporan" element={<LaporanStokKue />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}