import { Link, useLocation } from "react-router-dom";
// Impor dari file konfigurasi
import { navItems } from "../navigation.config";

export default function BottomNav() {
  const location = useLocation();

  return (
    <nav 
      style={{ bottom: 'env(keyboard-inset-height, 0px)' }}
      className="fixed left-0 right-0 bg-gradient-to-r from-pink-200 to-rose-300 flex justify-around items-center h-12 z-50 shadow-md transition-[bottom] duration-400 ease-[cubic-bezier(0.25,0.8,0.25,1)] will-change-bottom"
    >
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center justify-center text-[10px] w-full h-full rounded-md transition-colors duration-200 active:bg-rose-300/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/80 ${
              isActive ? "text-rose-700 font-semibold" : "text-gray-700 hover:text-rose-500" 
            }`}
          >
            <span className="text-base">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}