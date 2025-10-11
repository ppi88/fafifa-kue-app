// ================================
// 📦 TanggalCard.tsx (versi revisi)
// ================================

import type { FocusEvent, KeyboardEvent } from "react";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { supabase } from "../../../lib/supabaseClient";
import { KUE_LIST } from "../../InputStokKue";
import type { LaporanRecord } from "../types";

// Helper: Format tanggal ke "Senin, 15 April 2024"
const formatTanggalIndonesia = (isoDate: string): string => {
  const date = new Date(isoDate);
  if (isNaN(date.getTime())) return isoDate;

  const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  const months = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];

  return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
};

function getNextTanggal(currentTanggal: string): string | null {
  if (!currentTanggal) return null;
  const date = new Date(currentTanggal);
  if (Number.isNaN(date.getTime())) return null;
  date.setDate(date.getDate() + 1);
  return date.toISOString().split("T")[0];
}

interface Props {
  row: LaporanRecord;
  onUpdate: () => void;
  onHapus: (id: number, tanggal: string) => void;
}

export default function TanggalCard({ row, onUpdate, onHapus }: Props) {
  const tanggal = row.tanggal;
  const items = row.items ?? {};
  const sisa = row.sisa ?? {};
  const items_metadata = row.items_metadata ?? {};
  const terjual = row.terjual ?? {};

  const [editing, setEditing] = useState<{ type: "stok_baru" | "sisa" | "rusak"; key?: string } | null>(null);
  const [value, setValue] = useState<string>("");

  // 🆕 State untuk rusak/dimakan
  const [rusakDimakan, setRusakDimakan] = useState<number>(Number(row.rusak_dimakan ?? 0));

  useEffect(() => {
    if (!editing) setValue("");
  }, [editing]);

  const calculateTotals = () => {
    let totalSisaKemarin = 0;
    let totalStokBaru = 0;
    let totalStok = 0;
    let totalSisaHariIni = 0;

    KUE_LIST.forEach((kue) => {
      const meta = items_metadata?.[kue.key] ?? {};
      const sisaKemarin = Number(meta?.sisa_kemarin ?? 0);
      const stokBaru = Number(meta?.input_baru ?? 0);
      const totalStokItem = Number(items?.[kue.key] ?? sisaKemarin + stokBaru);
      const sisaHariIni = Number(sisa?.[kue.key] ?? 0);

      totalSisaKemarin += sisaKemarin;
      totalStokBaru += stokBaru;
      totalStok += totalStokItem;
      totalSisaHariIni += sisaHariIni;
    });

    const totalTerjual = Math.max(totalStok - totalSisaHariIni - rusakDimakan, 0);

    return {
      totalSisaKemarin,
      totalStokBaru,
      totalStok,
      totalSisaHariIni,
      totalTerjual,
    };
  };

  const totals = calculateTotals();

  // 🧩 Simpan data rusak/dimakan (revisi)
  const simpanRusakDimakan = async (val: number) => {
    try {
      const tanggalFix = tanggal.split("T")[0]; // jaga-jaga format ISO
      const { error } = await supabase
        .from("fafifa_costing")
        .update({ rusak_dimakan: val })
        .eq("tanggal", tanggalFix);

      if (error) throw error;

      toast.dismiss(); // hapus semua toast aktif
      toast.success("✅ Data kue rusak/dimakan berhasil ditambahkan");
      onUpdate();
    } catch (err) {
      console.error("❌ Gagal menyimpan data rusak/dimakan:", err);
      toast.dismiss();
      toast.error("❌ Gagal menyimpan data kue rusak/dimakan");
    }
  };

  const simpanEdit = async (e?: FocusEvent<HTMLInputElement>) => {
    if (e) e.preventDefault();
    if (!editing) return;

    const { type, key } = editing;
    const newValue = Number(value);
    if (value.trim() === "" || isNaN(newValue) || newValue < 0) {
      toast.error("Nilai tidak valid");
      return;
    }

    const toastId = toast.loading("🔄 Menyimpan perubahan...");

    try {
      if (type === "stok_baru" && key) {
        const meta = items_metadata?.[key] ?? { sisa_kemarin: 0 };
        const sisaKemarin = Number(meta?.sisa_kemarin ?? 0);

        const updatedMetadata = {
          ...(items_metadata ?? {}),
          [key]: { ...meta, input_baru: newValue },
        };

        const updatedItems = {
          ...(items ?? {}),
          [key]: sisaKemarin + newValue,
        };

        const { error } = await supabase
          .from("fafifa_costing")
          .update({
            items_metadata: updatedMetadata,
            items: updatedItems,
          })
          .eq("tanggal", tanggal);

        if (error) throw error;
      }

      if (type === "sisa" && key) {
        const stokMax = Number(items?.[key] ?? 0);
        if (newValue > stokMax) {
          toast.dismiss(toastId);
          toast.error(`❌ Sisa tidak boleh melebihi stok (${stokMax})`);
          return;
        }

        const updatedSisa = { ...(sisa ?? {}), [key]: newValue };
        const terjualItem = Math.max(stokMax - newValue, 0);
        const updatedTerjual = { ...(terjual ?? {}), [key]: terjualItem };

        const { error: sisaError } = await supabase
          .from("fafifa_costing")
          .update({ sisa: updatedSisa, terjual: updatedTerjual })
          .eq("tanggal", tanggal);

        if (sisaError) throw sisaError;
      }

      if (type === "rusak") {
        await simpanRusakDimakan(newValue);
        setRusakDimakan(newValue);
        toast.dismiss(toastId);
        return; // biar tidak munculkan toast sukses dobel
      }

      toast.dismiss(toastId);
      toast.success("✅ Perubahan berhasil disimpan");
      setEditing(null);
      onUpdate();
    } catch (err) {
      console.error("❌ Gagal menyimpan perubahan:", err);
      toast.dismiss(toastId);
      toast.error("❌ Gagal menyimpan perubahan.");
    }
  };

  const keyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") simpanEdit();
    if (e.key === "Escape") setEditing(null);
  };

  const tanggalIndonesia = formatTanggalIndonesia(tanggal);

  return (
    <div className="border border-gray-200 rounded-xl p-4 mb-4 bg-white shadow-sm hover:shadow-md transition-shadow">
      {/* Header Tanggal */}
      <div className="bg-blue-100 rounded-lg px-4 py-2.5 mb-4">
        <h2 className="font-bold text-blue-800 text-sm">📅 {tanggalIndonesia}</h2>
      </div>

      {/* Header Tabel */}
      <div className="grid grid-cols-5 font-semibold text-xs md:text-sm mb-2 text-right text-slate-700">
        <span className="text-left">Jenis Kue</span>
        <span>Sisa Kemarin</span>
        <span>Stok Baru</span>
        <span>Total Stok</span>
        <span>Sisa Hari Ini</span>
      </div>

      {/* Baris Data */}
      {KUE_LIST.map((kue) => {
        const meta = items_metadata?.[kue.key] ?? {};
        const sisaKemarin = Number(meta?.sisa_kemarin ?? 0);
        const stokBaru = Number(meta?.input_baru ?? 0);
        const totalStok = Number(items?.[kue.key] ?? sisaKemarin + stokBaru);
        const sisaHariIni = Number(sisa?.[kue.key] ?? 0);

        const editingBaru = editing?.type === "stok_baru" && editing.key === kue.key;
        const editingSisa = editing?.type === "sisa" && editing.key === kue.key;

        return (
          <div
            key={kue.key}
            className="grid grid-cols-5 items-center text-right text-sm py-2 px-3 bg-gray-50/70 rounded-lg mb-2 transition-colors hover:bg-gray-100"
          >
            <span className="text-left font-medium text-slate-800 truncate">{kue.label}</span>
            <span className="text-slate-700">{sisaKemarin}</span>

            {/* Input stok baru */}
            <span
              onDoubleClick={() => {
                setEditing({ type: "stok_baru", key: kue.key });
                setValue(String(stokBaru));
              }}
              className="cursor-pointer text-slate-800"
            >
              {editingBaru ? (
                <input
                  autoFocus
                  type="number"
                  className="w-16 text-right px-2 py-1 text-sm border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  onKeyDown={keyDown}
                  onBlur={simpanEdit}
                />
              ) : (
                stokBaru
              )}
            </span>

            <span className="font-bold text-slate-900">{totalStok}</span>

            {/* Input sisa hari ini */}
            <span
              onDoubleClick={() => {
                setEditing({ type: "sisa", key: kue.key });
                setValue(String(sisaHariIni));
              }}
              className="cursor-pointer text-slate-800"
            >
              {editingSisa ? (
                <input
                  autoFocus
                  type="number"
                  className="w-16 text-right px-2 py-1 text-sm border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  onKeyDown={keyDown}
                  onBlur={simpanEdit}
                />
              ) : (
                sisaHariIni
              )}
            </span>
          </div>
        );
      })}

      {/* TOTAL */}
      <div className="grid grid-cols-5 items-center text-right text-sm py-2.5 px-3 bg-blue-50 font-bold rounded-lg border border-blue-200/60 mt-3">
        <span className="text-left text-blue-800">TOTAL</span>
        <span className="text-blue-700">{totals.totalSisaKemarin}</span>
        <span className="text-blue-700">{totals.totalStokBaru}</span>
        <span className="text-blue-900">{totals.totalStok}</span>
        <span className="text-blue-700">{totals.totalSisaHariIni}</span>
      </div>

      {/* TERJUAL */}
      <div className="flex justify-between items-center mt-3 px-3 py-2 bg-green-50 border border-green-200 rounded-lg font-semibold text-green-800 text-sm">
        <span>💰 Terjual Hari Ini</span>
        <span className="text-lg">{totals.totalTerjual}</span>
      </div>

      {/* ⚠️ Rusak/Dimakan */}
      <div className="flex justify-between items-center mt-4 px-3 py-2 bg-yellow-50 border border-yellow-200 rounded-lg">
        <span
          onDoubleClick={() => {
            setEditing({ type: "rusak" });
            setValue(String(rusakDimakan));
          }}
          className="text-sm font-medium text-yellow-800 cursor-pointer"
        >
          ⚠️ Rusak/Dimakan:{" "}
          {editing?.type === "rusak" ? (
            <input
              autoFocus
              type="number"
              className="w-20 ml-2 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-400"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={keyDown}
              onBlur={simpanEdit}
            />
          ) : (
            <span className="ml-2 font-bold">{rusakDimakan}</span>
          )}
        </span>

        <button
          type="button"
          onClick={() => onHapus(row.id, tanggal)}
          className="text-red-600 hover:text-red-800 px-4 py-2 rounded-lg border border-red-300 text-sm font-medium transition-colors"
        >
          🗑️ Hapus Stok Tanggal Ini
        </button>
      </div>
    </div>
  );
}
