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
      .from("fafifa_costing")
      .select("*")
      .order("tanggal", { ascending: false });

    if (filterDate) {
      query = query.eq("tanggal", filterDate);
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
      .from("fafifa_costing")
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

  const updateSisaKemarinNextDay = async (
    currentDate: string,
    items_metadata: any
  ) => {
    try {
      const d = new Date(currentDate);
      d.setDate(d.getDate() + 1);
      const nextDate = d.toISOString().split("T")[0];

      const { data: nextRows, error: fetchErr } = await supabase
        .from("fafifa_costing")
        .select("*")
        .eq("tanggal", nextDate);

      if (fetchErr) throw fetchErr;
      if (!nextRows || nextRows.length === 0) return;

      const nextRow = nextRows[0];
      const updatedItems = { ...(nextRow.items_metadata || {}) };

      Object.keys(items_metadata || {}).forEach((kueKey) => {
        if (!updatedItems[kueKey]) updatedItems[kueKey] = {};
        updatedItems[kueKey].sisa_kemarin = items_metadata[kueKey]?.sisa_hari_ini ?? 0;
      });

      const { error: updateErr } = await supabase
        .from("fafifa_costing")
        .update({ items_metadata: updatedItems })
        .eq("id", nextRow.id);

      if (updateErr) throw updateErr;

      toast.success(`✅ Sisa Kemarin untuk ${nextDate} telah diperbarui`);
    } catch (err) {
      console.error(err);
      toast.error("Gagal update sisa kemarin pada tanggal berikutnya");
    }
  };

  const sinkronkanSisaKemarinHariIni = async (tanggalHariIni: string) => {
    try {
      const d = new Date(tanggalHariIni);
      d.setDate(d.getDate() - 1);
      const prevDate = d.toISOString().split("T")[0];

      const { data: prevRows, error: errPrev } = await supabase
        .from("fafifa_costing")
        .select("sisa")
        .eq("tanggal", prevDate)
        .limit(1);

      if (errPrev) throw errPrev;
      const sisaKemarin = prevRows?.[0]?.sisa;
      if (!sisaKemarin) return;

      const { data: hariIniRows, error: errToday } = await supabase
        .from("fafifa_costing")
        .select("id, items_metadata")
        .eq("tanggal", tanggalHariIni)
        .limit(1);

      if (errToday) throw errToday;
      const hariIni = hariIniRows?.[0];
      if (!hariIni) return;

      const updatedMeta = { ...(hariIni.items_metadata ?? {}) };

      Object.keys(sisaKemarin).forEach((key) => {
        if (!updatedMeta[key]) updatedMeta[key] = {};
        updatedMeta[key].sisa_kemarin = sisaKemarin[key];
      });

      const { error: updateErr } = await supabase
        .from("fafifa_costing")
        .update({ items_metadata: updatedMeta })
        .eq("id", hariIni.id);

      if (updateErr) throw updateErr;

      toast.success(`✅ Sisa Kemarin di tanggal ${tanggalHariIni} telah disinkronkan`);
    } catch (err) {
      console.error("❌ Gagal sinkronkan sisa_kemarin:", err);
      toast.error("Gagal sinkronkan sisa_kemarin ke tanggal hari ini");
    }
  };

  return {
    data,
    loading,
    getData,
    hapusData,
    setData,
    updateSisaKemarinNextDay,
    sinkronkanSisaKemarinHariIni, // ⬅️ fungsi baru untuk sinkronisasi mundur
  };
}