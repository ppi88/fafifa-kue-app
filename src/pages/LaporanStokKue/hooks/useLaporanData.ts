import { useState } from "react";
import toast from "react-hot-toast";
import { supabase } from "../../../lib/supabaseClient";
import { deleteEntry } from "../../../utils/storage";
import { deleteStokCloud } from "../../../utils/supabaseStorage";
import type { LaporanRecord } from "../types";

/**
 * Hook untuk mengambil, memfilter, dan menghapus data laporan stok kue.
 * Menggabungkan data cloud (Supabase) dan local storage (fallback/offline).
 */
export function useLaporanData() {
  const [data, setData] = useState<LaporanRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // --- Ambil data laporan ---
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
      console.error(err);
      toast.error("⚠️ Gagal mengambil data laporan.");
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  // --- Hapus data laporan ---
  const hapusData = async (id: number, tanggal: string) => {
    if (!window.confirm(`Yakin hapus data tanggal ${tanggal}?`)) return;

    const { error } = await supabase
      .from("fafifa-costing")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Gagal menghapus data dari cloud.");
      return;
    }

    try {
      // Hapus juga dari local storage dan Supabase Storage bila tersedia
      await Promise.allSettled([
        Promise.resolve(deleteEntry?.(tanggal)),
        Promise.resolve(deleteStokCloud?.(tanggal)),
      ]);
    } catch {
      // aman diabaikan
    }

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
