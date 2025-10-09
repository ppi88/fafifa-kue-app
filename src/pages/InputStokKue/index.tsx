import HeaderBar from "./components/HeaderBar";
import StockForm from "./components/StockForm";
import RecapList from "./components/RecapList";
import { useInputStok } from "./hooks/useInputStok";
import type { StokEntry, StokMap } from "./types"; // Impor tipe jika diperlukan di sini

// Daftar kue diekspor dari sini agar tetap menjadi satu sumber kebenaran
export const KUE_LIST = [
  { key: "boluKukus", label: "Bolu Kukus" },
  { key: "rotiGabin", label: "Roti Gabin" },
  { key: "pastel", label: "Pastel" },
  { key: "martabakTelur", label: "Martabak Telur" },
  { key: "moci", label: "Moci" },
  { key: "lainnya", label: "Lainnya" },
];

export default function InputStokKue({ onSuccess }: { onSuccess?: () => void }) {
  // Panggil custom hook untuk mendapatkan semua state dan handler
  const {
    tanggal,
    stok,
    entries,
    isOnline,
    saving,
    setTanggal,
    handleChange,
    handleSubmit,
    handleDelete,
  } = useInputStok({ onSuccess });

  return (
    <div className="bg-gray-50 flex items-start justify-center p-4 md:p-6">
      <div className="w-full max-w-4xl bg-white shadow-lg rounded-2xl p-6">
        <HeaderBar isOnline={isOnline} />
        <StockForm
          tanggal={tanggal}
          stok={stok}
          saving={saving}
          onTanggalChange={setTanggal}
          onItemChange={handleChange}
          onSubmit={handleSubmit}
        />
        <RecapList entries={entries} onDelete={handleDelete} />
      </div>
    </div>
  );
}