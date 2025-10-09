import { useEffect, useState } from "react";
import toast from "react-hot-toast";
// Type StokEntry diimpor dari utils/storage, sehingga sudah menggunakan created_at
import { addEntry, deleteEntry, loadEntries } from "../../../utils/storage";
import {
  addStokCloud,
  deleteStokCloud,
  getAllStokCloud,
} from "../../../utils/supabaseStorage";
import { KUE_LIST } from "../index";
import type { StokMap, LaporanRecord, StokEntry } from "../types";

const getToday = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
};

export function useInputStok({ onSuccess }: { onSuccess?: () => void }) {
  const [tanggal, setTanggal] = useState(getToday());
  const [stok, setStok] = useState<StokMap>(() =>
    KUE_LIST.reduce((acc, k) => ({ ...acc, [k.key]: 0 }), {} as StokMap)
  );
  const [entries, setEntries] = useState<(StokEntry | LaporanRecord)[]>([]);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [saving, setSaving] = useState(false);

  // Pantau status online/offline
  useEffect(() => {
    const updateOnline = () => setIsOnline(navigator.onLine);
    window.addEventListener("online", updateOnline);
    window.addEventListener("offline", updateOnline);
    return () => {
      window.removeEventListener("online", updateOnline);
      window.removeEventListener("offline", updateOnline);
    };
  }, []);

  // Muat data awal
  useEffect(() => {
    (async () => {
      try {
        const data = await getAllStokCloud();
        setEntries(data || []);
      } catch {
        toast.error("Offline, memuat data dari cache lokal.");
        setEntries(loadEntries() as (StokEntry | LaporanRecord)[]);
      }
    })();
  }, []);

  const handleChange = (key: string, val: string) => {
    const num = val === "" ? 0 : Math.max(0, Number(val));
    setStok((prev: StokMap) => ({ ...prev, [key]: Number.isNaN(num) ? 0 : num }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!tanggal) {
      toast.error("Tanggal belum dipilih.");
      return;
    }

    // CATATAN: Karena StokEntry dan LaporanRecord mungkin memiliki struktur berbeda,
    // kita perlu memastikan item di entries memiliki properti 'tanggal'.
    if (entries.some((entry) => entry.tanggal === tanggal)) {
      toast.error(`Data untuk tanggal ${tanggal} sudah ada.`);
      return;
    }

    // Gunakan StokEntry agar kompatibel dengan addEntry()
    const entry: StokEntry = {
      id: Date.now(),
      tanggal,
      items: stok,
      // PERBAIKAN 1: Mengubah 'createdAt' menjadi 'created_at' (Baris 75 & 78)
      created_at: new Date().toISOString(),
    };

    // PERBAIKAN 2: Karena 'entry' kini memiliki 'created_at', bukan 'createdAt',
    // Type checking pada addEntry (Baris 78) akan lolos.
    addEntry(entry); 
    setEntries(loadEntries() as (StokEntry | LaporanRecord)[]);
    setSaving(true);
    const toastId = toast.loading("Menyimpan data...");

    try {
      // Supabase masih bisa pakai struktur sama
      await addStokCloud({
        ...entry,
        // PERBAIKAN 3: Mengubah entry.createdAt menjadi entry.created_at (Baris 87)
        created_at: entry.created_at, // sinkronisasi nama kolom untuk cloud
      });
      toast.dismiss(toastId);
      toast.success("✅ Data stok tersimpan.");
      const updatedData = await getAllStokCloud();
      setEntries(updatedData);
    } catch {
      toast.dismiss(toastId);
      toast.error("🔴 Gagal menyimpan ke cloud.");
    } finally {
      setSaving(false);
      onSuccess?.();
      setStok(KUE_LIST.reduce((acc, k) => ({ ...acc, [k.key]: 0 }), {} as StokMap));
    }
  };

  const handleDelete = async (id: number, tanggal: string) => {
    if (!confirm(`Hapus data tanggal ${tanggal}?`)) return;

    deleteEntry(id);
    setEntries(loadEntries() as (StokEntry | LaporanRecord)[]);
    try {
      await deleteStokCloud(id);
      toast.success("🗑️ Data berhasil dihapus.");
    } catch {
      toast.error("Gagal menghapus dari cloud.");
    }
  };

  return {
    tanggal,
    stok,
    entries,
    isOnline,
    saving,
    setTanggal,
    handleChange,
    handleSubmit,
    handleDelete,
  };
}