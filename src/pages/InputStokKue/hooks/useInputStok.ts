import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { addEntry, deleteEntry, loadEntries } from "../../../utils/storage";
import {
  addStokCloud,
  deleteStokCloud,
  getAllStokCloud,
} from "../../../utils/supabaseStorage";
import { KUE_LIST } from "../index";
import type { StokMap, LaporanRecord } from "../types";

const getToday = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(d.getDate()).padStart(2, "0")}`;
};

export function useInputStok({ onSuccess }: { onSuccess?: () => void }) {
  const [tanggal, setTanggal] = useState(getToday());
  const [stok, setStok] = useState<StokMap>(() =>
    KUE_LIST.reduce((acc, k) => ({ ...acc, [k.key]: 0 }), {} as StokMap)
  );
  const [entries, setEntries] = useState<LaporanRecord[]>([]);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [saving, setSaving] = useState(false);

  // pantau status online/offline
  useEffect(() => {
    const updateOnline = () => setIsOnline(navigator.onLine);
    window.addEventListener("online", updateOnline);
    window.addEventListener("offline", updateOnline);
    return () => {
      window.removeEventListener("online", updateOnline);
      window.removeEventListener("offline", updateOnline);
    };
  }, []);

  // muat data awal dari cloud / lokal
  useEffect(() => {
    (async () => {
      try {
        const data = await getAllStokCloud();
        setEntries(data || []);
      } catch {
        toast.error("Offline, memuat data dari cache lokal.");
        setEntries(loadEntries());
      }
    })();
  }, []);

  // perubahan nilai input stok
  const handleChange = (key: string, val: string) => {
    const num = val === "" ? 0 : Math.max(0, Number(val));
    setStok((prev) => ({ ...prev, [key]: Number.isNaN(num) ? 0 : num }));
  };

  // simpan stok baru
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tanggal) {
      toast.error("Tanggal belum dipilih.");
      return;
    }

    if (entries.some((entry) => entry.tanggal === tanggal)) {
      toast.error(`Data untuk tanggal ${tanggal} sudah ada.`);
      return;
    }

    const finalStok: StokMap = {};
    const itemsMetadata: Record<
      string,
      { input_baru: number; sisa_kemarin: number }
    > = {};
    const autoFilledItems: Record<string, boolean> = {};

    const dataTerurut = [...entries].sort(
      (a, b) =>
        new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime()
    );
    const dataSebelumnya = dataTerurut.find(
      (entry) => new Date(entry.tanggal) < new Date(tanggal)
    );

    KUE_LIST.forEach((kue) => {
      const inputBaru = stok[kue.key] ?? 0;
      const sisaKemarin = dataSebelumnya?.sisa?.[kue.key] ?? 0;

      finalStok[kue.key] = inputBaru + sisaKemarin;
      itemsMetadata[kue.key] = {
        input_baru: inputBaru,
        sisa_kemarin: sisaKemarin,
      };
      autoFilledItems[kue.key] = sisaKemarin > 0;
    });

    const entry: LaporanRecord = {
      id: Date.now(),
      tanggal,
      items: finalStok,
      sisa: dataSebelumnya?.sisa || {},
      auto_filled_items: autoFilledItems,
      items_metadata: itemsMetadata,
      created_at: new Date().toISOString(),
    };

    addEntry(entry);
    setEntries(loadEntries());
    setSaving(true);
    const toastId = toast.loading("Menyimpan data...");

    try {
      await addStokCloud(entry);
      toast.dismiss(toastId);
      toast.success("✅ Data stok tersimpan.");
      const updatedData = await getAllStokCloud();
      setEntries(updatedData);
    } catch (err) {
      toast.dismiss(toastId);
      toast.error("🔴 Gagal menyimpan ke cloud.");
    } finally {
      setSaving(false);
      if (onSuccess) onSuccess();
      setStok(
        KUE_LIST.reduce((acc, k) => ({ ...acc, [k.key]: 0 }), {} as StokMap)
      );
    }
  };

  // hapus data stok
  const handleDelete = async (id: number, tanggal: string) => {
    if (!confirm(`Hapus data tanggal ${tanggal}?`)) return;
    deleteEntry(id);
    setEntries(loadEntries());
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
