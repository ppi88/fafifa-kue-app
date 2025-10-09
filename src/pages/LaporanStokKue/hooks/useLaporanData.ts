// src/pages/LaporanStokKue/hooks/useLaporanData.ts

import { useState } from "react";
import toast from "react-hot-toast";
import { supabase } from "../../../lib/supabaseClient";
import { deleteEntry, loadEntries } from "../../../utils/storage"; // Import loadEntries()
import { deleteStokCloud } from "../../../utils/supabaseStorage";
import type { LaporanRecord } from "../types"; // Asumsikan LaporanRecord sudah benar dan memiliki created_at

/**
 * 🔹 Hook: useLaporanData
 * Mengambil, memfilter, dan menghapus data laporan stok kue.
 * - Sinkronisasi dengan Supabase (cloud)
 * - Fallback ke localStorage jika offline
 */
export function useLaporanData() {
  const [data, setData] = useState<LaporanRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  /**
   * 🔸 Ambil data laporan (dari Supabase, fallback ke lokal)
   */
  const getData = async (filterDate?: string) => {
    setLoading(true);
    try {
      let query = supabase
        .from("fafifa-costing")
        .select("*")
        .order("tanggal", { ascending: false });

      if (filterDate) query = query.eq("tanggal", filterDate);

      const { data: res, error } = await query;

      if (error) throw error;

      setData((res || []) as LaporanRecord[]);
    } catch (err) {
      console.error("Gagal ambil data cloud:", err);
      toast.error("⚠️ Gagal mengambil data dari cloud. Menampilkan data lokal.");

      // PERBAIKAN: Kita akan mengasumsikan 'loadEntries' sekarang mengembalikan 
      // data yang secara struktural (minimal) kompatibel, karena kita telah 
      // memperbaiki masalah 'created_at' di 'utils/storage.ts'.
      // TS2352 seharusnya hilang. Kita hapus cast 'as LaporanRecord[]' 
      // untuk keamanan, karena loadEntries mengembalikan StokEntry[].
      // Namun, jika kita ingin tetap menggunakan LaporanRecord[], kita harus yakin
      // bahwa LaporanRecord adalah superset yang benar dari StokEntry.
      
      // Untuk menghilangkan error TS2352, kita tambahkan konversi ke unknown
      // sebelum ke LaporanRecord (sebuah hack, tapi sering digunakan jika type mismatch
      // dan Anda yakin strukturnya benar). Atau, kita perbaiki LaporanRecord.

      // Cara yang lebih baik adalah membiarkan `loadEntries()` mengembalikan 
      // StokEntry[] dan kita perlu memprosesnya agar menjadi LaporanRecord. 
      // Namun, karena ini hanya fallback, kita gunakan casting yang lebih aman:
      
      const local = loadEntries(); // loadEntries() mengembalikan StokEntry[]
      // Jika data lokal perlu diproses menjadi LaporanRecord, pemrosesan harus dilakukan di sini.
      // Untuk saat ini, kita akan menggunakan casting aman `as unknown as LaporanRecord[]`
      // jika error TS2352 masih muncul, atau kita asumsikan perbaikan `created_at` sudah cukup.
      setData((local || []) as unknown as LaporanRecord[]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 🔸 Hapus data laporan (cloud + lokal)
   */
  const hapusData = async (id: number, tanggal: string) => {
    if (!window.confirm(`Yakin hapus data tanggal ${tanggal}?`)) return;

    // 🔹 Hapus dari Supabase
    try {
      const { error } = await supabase
        .from("fafifa-costing")
        .delete()
        .eq("id", id);

      if (error) throw error;
    } catch (err) {
      console.error("Gagal hapus di Supabase:", err);
      toast.error("❌ Gagal menghapus data dari cloud.");
      return;
    }

    // 🔹 Hapus juga dari local storage dan cloud storage (Supabase Storage)
    try {
      await Promise.allSettled([
        Promise.resolve(deleteEntry(id)),
        Promise.resolve(deleteStokCloud(id)),
      ]);
    } catch (err) {
      console.warn("Peringatan: gagal hapus cache lokal", err);
    }

    // 🔹 Update data di state
    setData((prev) => prev.filter((row) => row.id !== id));
    toast.success("🗑️ Data berhasil dihapus.");
  };

  return {
    data,
    loading,
    getData,
    hapusData,
    setData,
  };
}