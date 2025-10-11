// src/pages/InputStokKue/components/HeaderBar.tsx (Versi Bersih & Benar)

interface HeaderBarProps {
  isOnline: boolean;
  // Jika kamu butuh tombol tambah di sini, tambahkan prop ini
  // onAddStok?: () => void; 
}

export default function HeaderBar({ isOnline }: HeaderBarProps) {
  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-2xl font-bold text-gray-800">🍰 Stok Kue Fafifa</h1>
      <span
        className={`text-sm font-medium ${
          isOnline ? "text-green-600" : "text-red-500"
        }`}
      >
        {isOnline ? "🟢 Online" : "🔴 Offline (Data Lokal)"}
      </span>

      {/* 
        Jika kamu ingin tombol "Tambah Stok" ada di sini, hapus komentar di bawah ini
        dan jangan lupa tambahkan prop `onAddStok` di atas.
      */}
      {/* 
      <button
        onClick={onAddStok}
        className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg"
      >
        ➕ Tambah Stok Kue Baru
      </button> 
      */}
    </div>
  );
}