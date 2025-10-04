import { ReactNode } from "react";
import Sidebar from "./Sidebar";
import BottomNav from "./BottomNav";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar untuk desktop */}
      <Sidebar />

      {/* Konten utama */}
      <div className="flex-1 flex flex-col">
        {/* Jangan beri padding di layout, biarkan ditangani oleh tiap halaman */}
        <main className="flex-1">{children}</main>

        {/* BottomNav untuk mobile */}
        <BottomNav />
      </div>
    </div>
  );
}