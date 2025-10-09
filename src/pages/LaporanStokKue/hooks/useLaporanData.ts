import { useState } from "react";
import toast from "react-hot-toast";
import { supabase } from "../../../lib/supabaseClient";
import { deleteEntry } from "../../../utils/storage";
import { deleteStokCloud } from "../../../utils/supabaseStorage";
import type { LaporanRecord } from "../types";

export function useLaporanData() {
  const [data, setData] = useState<LaporanRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const getData = async (filterDate?: string) => {
    setLoading(true);
    let query = supabase
      .from("fafifa-costing")
      .select("*")
      .order("tanggal", { ascending: false });

    if (filterDate) {
      query = query.eq('tanggal', filterDate);
    }

    const { data: res, error } = await query;

    if (error) {
      toast.error("⚠️  Gagal mengambil data laporan.");
      setData([]);
    } else {
      setData(res || []);
    }
    setLoading(false);
  };

  const hapusData = async (id: number, tanggal: string) => {
    if (!window.confirm(`Yakin hapus data tanggal ${tanggal}?`)) return;

    const { error } = await supabase
      .from("fafifa-costing")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Gagal menghapus data");
      return;
    }

    try {
      deleteEntry && deleteEntry(tanggal);
      deleteStokCloud && deleteStokCloud(tanggal);
    } catch (e) {}

    setData((prev) => prev.filter((row) => row.id !== id));
    toast.success("Data berhasil dihapus");
  };

  return { data, loading, getData, hapusData, setData };
}