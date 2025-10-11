import type { FocusEvent, KeyboardEvent } from "react";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { supabase } from "../../../lib/supabaseClient";
import { KUE_LIST } from "../../InputStokKue";
import type { LaporanRecord } from "../types";

// ✅ FIX: Perhitungan tanggal berikutnya
function getNextTanggal(currentTanggal: string): string | null {
  if (!currentTanggal) return null;
  const date = new Date(currentTanggal);
  if (Number.isNaN(date.getTime())) return null;

  date.setDate(date.getDate() + 1);
  return date.toISOString().split("T")[0];
}

interface Props {
  row: LaporanRecord;
  onInputSisa: (row: LaporanRecord) => void;
  onHapus: (id: number, tanggal: string) => void;
  onUpdate: () => void;
}

export default function TanggalCard({ row, onInputSisa, onHapus, onUpdate }: Props) {
  const tanggal = row.tanggal;
  const items = row.items ?? {};
  const sisa = row.sisa ?? {};
  const items_metadata = row.items_metadata ?? {};

  const [editing, setEditing] = useState<{ type: "stok_baru" | "sisa"; key: string } | null>(null);
  const [value, setValue] = useState<string>("");

  useEffect(() => {
    if (!editing) setValue("");
  }, [editing]);

  // ✅ TAMBAHAN: Menghitung total untuk setiap kolom
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

    return {
      totalSisaKemarin,
      totalStokBaru,
      totalStok,
      totalSisaHariIni
    };
  };

  const totals = calculateTotals();

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
      if (type === "stok_baru") {
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

      if (type === "sisa") {
        const stokMax = Number(items?.[key] ?? 0);
        if (newValue > stokMax) {
          toast.dismiss(toastId);
          toast.error(`❌ Sisa tidak boleh melebihi stok (${stokMax})`);
          return;
        }

        const updatedSisa = { ...(sisa ?? {}), [key]: newValue };

        const { error: sisaError } = await supabase
          .from("fafifa_costing")
          .update({ sisa: updatedSisa })
          .eq("tanggal", tanggal);

        if (sisaError) throw sisaError;

        const nextTanggal = getNextTanggal(tanggal);
        if (nextTanggal) {
          const { data: nextRows, error: nextErr } = await supabase
            .from("fafifa_costing")
            .select("id, items, items_metadata, tanggal")
            .eq("tanggal", nextTanggal)
            .limit(1);

          if (nextErr) throw nextErr;

          const nextRow = nextRows?.[0];
          if (nextRow) {
            const nextMeta = { ...(nextRow.items_metadata ?? {}) };
            const nextItems = { ...(nextRow.items ?? {}) };

            const prevMeta = nextMeta[key] ?? {};
            nextMeta[key] = {
              ...prevMeta,
              sisa_kemarin: newValue,
            };

            const inputBaruBesok = Number(nextMeta[key].input_baru ?? 0);
            nextItems[key] = inputBaruBesok + newValue;

            const { error: updateErr } = await supabase
              .from("fafifa_costing")
              .update({
                items_metadata: nextMeta,
                items: nextItems,
              })
              .eq("id", nextRow.id);

            if (updateErr) throw updateErr;
          }
        }
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

  const handleDeleteTanggal = async () => {
    const confirmDelete = window.confirm(`⚠️ Yakin ingin menghapus data stok tanggal ${tanggal}?`);
    if (!confirmDelete) return;

    const { error } = await supabase
      .from("fafifa_costing")
      .delete()
      .eq("tanggal", tanggal);

    if (error) {
      toast.error(`❌ Gagal menghapus data tanggal ${tanggal}: ${error.message}`);
    } else {
      toast.success(`🗑️ Data stok tanggal ${tanggal} berhasil dihapus.`);
      onUpdate();
    }
  };

  return (
    <div className="border rounded p-4 mb-3 bg-white shadow-sm">
      <h2 className="font-semibold mb-2">Tanggal: {tanggal}</h2>
      <div className="grid grid-cols-5 font-semibold text-sm mb-1 text-right">
        <span className="text-left">Jenis Kue</span>
        <span>Sisa Kemarin</span>
        <span>Stok Baru</span>
        <span>Total Stok</span>
        <span>Sisa Hari Ini</span>
      </div>

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
            className="grid grid-cols-5 items-center text-right text-sm py-1 bg-gray-50 px-2 rounded mb-1"
          >
            <span className="text-left">{kue.label}</span>
            <span>{sisaKemarin}</span>

            <span
              onDoubleClick={() => {
                setEditing({ type: "stok_baru", key: kue.key });
                setValue(String(stokBaru));
              }}
              className="cursor-pointer"
            >
              {editingBaru ? (
                <input
                  autoFocus
                  type="number"
                  className="border px-1 w-16 text-right"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  onKeyDown={keyDown}
                  onBlur={simpanEdit}
                />
              ) : (
                stokBaru
              )}
            </span>

            <span className="font-bold">{totalStok}</span>

            <span
              onDoubleClick={() => {
                setEditing({ type: "sisa", key: kue.key });
                setValue(String(sisaHariIni));
              }}
              className="cursor-pointer"
            >
              {editingSisa ? (
                <input
                  autoFocus
                  type="number"
                  className="border px-1 w-16 text-right"
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

      {/* ✅ TAMBAHAN: Baris Total */}
      <div className="grid grid-cols-5 items-center text-right text-sm py-2 bg-blue-50 font-semibold border-t border-blue-200 mt-2 px-2 rounded">
        <span className="text-left">TOTAL</span>
        <span className="text-blue-700">{totals.totalSisaKemarin}</span>
        <span className="text-blue-700">{totals.totalStokBaru}</span>
        <span className="text-blue-700 font-bold">{totals.totalStok}</span>
        <span className="text-blue-700">{totals.totalSisaHariIni}</span>
      </div>

      <div className="flex justify-end mt-4">
        <button
          type="button"
          onClick={handleDeleteTanggal}
          className="text-red-600 hover:text-red-800 px-4 py-2 rounded-lg border border-red-300 text-sm"
        >
          🗑️ Hapus Stok Tanggal Ini
        </button>
      </div>
    </div>
  );
}