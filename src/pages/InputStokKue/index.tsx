import { useEffect } from "react";
import HeaderBar from "./components/HeaderBar";
import StockForm from "./components/StockForm";
import RecapList from "./components/RecapList";
import { useInputStok } from "./hooks/useInputStok";
import type { LaporanRecord } from "./types";

// ✅ 1. DEFINISIKAN DAN EKSPOR KUE_LIST DI SINI. Ini adalah sumber kebenaran.
export const KUE_LIST = [
  { key: "boluKukus", label: "Bolu Kukus" },
  { key: "rotiGabin", label: "Roti Gabin" },
  { key: "pastel", label: "Pastel" },
  { key: "martabakTelur", label: "Martabak Telur" },
  { key: "moci", label: "Moci" },
  { key: "lainnya", label: "Lainnya" },
];

interface InputStokKueProps {
  defaultTanggal?: string;
  defaultItems?: Record<string, number>;
  onSuccess?: () => void;
  isModalMode?: boolean;
}

export default function InputStokKue({
  defaultTanggal,
  defaultItems,
  onSuccess,
  isModalMode = false,
}: InputStokKueProps) {
  const {
    tanggal,
    stok,
    sisaKemarin,
    entries,
    isOnline,
    saving,
    setTanggal,
    handleChange,
    handleSubmit,
    handleDelete,
    applyDefaultItems,
  } = useInputStok({ onSuccess });

  useEffect(() => {
    if (defaultTanggal) setTanggal(defaultTanggal);
    if (defaultItems && applyDefaultItems) applyDefaultItems(defaultItems);
  }, [defaultTanggal, defaultItems, setTanggal, applyDefaultItems]);

  const laporanEntries: LaporanRecord[] = entries ?? [];

  if (isModalMode) {
    return (
      <StockForm
        tanggal={tanggal}
        stok={stok}
        sisaKemarin={sisaKemarin}
        saving={saving}
        onTanggalChange={setTanggal}
        onItemChange={handleChange}
        onSubmit={handleSubmit}
      />
    );
  }

  return (
    <div className="bg-gray-50 flex items-start justify-center p-4 md:p-6">
      <div className="w-full max-w-4xl bg-white shadow-lg rounded-2xl p-6">
        <HeaderBar isOnline={isOnline} />
        <StockForm
          tanggal={tanggal}
          stok={stok}
          sisaKemarin={sisaKemarin}
          saving={saving}
          onTanggalChange={setTanggal}
          onItemChange={handleChange}
          onSubmit={handleSubmit}
        />
        <RecapList entries={laporanEntries} onDelete={handleDelete} />
      </div>
    </div>
  );
}