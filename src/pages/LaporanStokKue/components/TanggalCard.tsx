import { useState } from "react";
import toast from "react-hot-toast";
import { supabase } from "../../../lib/supabaseClient";
import { KUE_LIST } from "../../InputStokKue";
import type { LaporanRecord } from "../types";

// Helper untuk dapatkan tanggal berikutnya (format YYYY-MM-DD)
function getNextTanggal(currentTanggal: string) {
  const date = new Date(currentTanggal);
  date.setDate(date.getDate() + 1);
  return date.toISOString().slice(0, 10);
}

interface Props {
  row: LaporanRecord;
  onInputSisa: (row: LaporanRecord) => void;
  onHapus: (id: number, tanggal: string) => void;
  onUpdate: () => void;
}

export default function TanggalCard({ row, onInputSisa, onHapus, onUpdate }: Props) {
  const { tanggal, items, sisa = {}, items_metadata = {}, makan_kue = 0 } = row;

  const hitungTotal = (obj: Record<string, number> = {}) =>
    Object.values(obj).reduce((a, b) => a + (Number(b) || 0), 0);

  const totalStok = hitungTotal(items);
  const totalSisa = hitungTotal(sisa);
  const makanKueValue = Number(makan_kue) || 0;

  const totalKeseluruhan = Math.max(0, totalStok - totalSisa - makanKueValue);

  const totalSisaKemarin = KUE_LIST.reduce(
    (sum, k) => sum + (items_metadata?.[k.key]?.sisa_kemarin ?? 0),
    0
  );
  const totalStokBaru = KUE_LIST.reduce((sum, k) => {
    const meta = items_metadata?.[k.key];
    const stokVal = items?.[k.key] ?? 0;
    const sisaKemarin = meta?.sisa_kemarin ?? 0;
    const stokBaru = meta?.input_baru ?? (stokVal - sisaKemarin);
    return sum + stokBaru;
  }, 0);

  const [editing, setEditing] = useState<{ type: "stok_baru" | "sisa"; key: string } | null>(null);
  const [value, setValue] = useState<string>("");

  // --- Bagian makan kue ---
  const [editMakanKue, setEditMakanKue] = useState(false);
  const [makanKueInput, setMakanKueInput] = useState(makanKueValue);

  const simpanMakanKue = async () => {
    if (isNaN(makanKueInput) || makanKueInput < 0) {
      toast.error("Jumlah makan kue tidak valid.");
      return;
    }
    toast.loading("Menyimpan jumlah makan kue...");
    try {
      await supabase
        .from("fafifa-costing")
        .update({ makan_kue: makanKueInput })
        .eq("tanggal", tanggal);
      toast.dismiss();
      toast.success("✅ Jumlah makan kue tersimpan");
      onUpdate();
    } catch {
      toast.dismiss();
      toast.error("Gagal menyimpan jumlah makan kue.");
    } finally {
      setEditMakanKue(false);
    }
  };

  // --- Bagian simpanEdit (stok baru & sisa) ---
  const simpanEdit = async (e?: React.FocusEvent<HTMLInputElement>) => {
    if (e) e.preventDefault();
    if (!editing) return;

    const { type, key } = editing;
    const newValue = Number(value);
    if (isNaN(newValue) || newValue < 0) {
      toast.error("Nilai tidak valid.");
      return;
    }

    toast.loading("Menyimpan perubahan...");
    try {
      if (type === "stok_baru") {
        const meta = items_metadata?.[key] || { sisa_kemarin: 0, input_baru: 0 };
        const sisaKemarin = meta.sisa_kemarin;
        const newTotalStok = newValue + sisaKemarin;
        const updatedMetadata = { ...items_metadata, [key]: { input_baru: newValue, sisa_kemarin: sisaKemarin } };
        const updatedItems = { ...items, [key]: newTotalStok };
        await supabase
          .from("fafifa-costing")
          .update({ items: updatedItems, items_metadata: updatedMetadata })
          .eq("tanggal", tanggal);
      } else if (type === "sisa") {
        const stokMax = items?.[key] ?? 0;
        if (newValue > stokMax) {
          toast.dismiss();
          toast.error(`Sisa tidak boleh melebihi total stok (${stokMax}).`);
          return;
        }

        const updatedSisa = { ...(row.sisa || {}), [key]: newValue };
        await supabase
          .from("fafifa-costing")
          .update({ sisa: updatedSisa })
          .eq("tanggal", tanggal);

        // Update tanggal berikutnya
        const nextTanggal = getNextTanggal(tanggal);
        if (nextTanggal) {
          const { data: nextRows, error: nextError } = await supabase
            .from("fafifa-costing")
            .select("id, items_metadata, items")
            .eq("tanggal", nextTanggal)
            .limit(1);

          if (!nextError && nextRows && nextRows.length > 0) {
            const nextRow = nextRows[0];
            const nextItemsMetadata = { ...(nextRow.items_metadata || {}) };
            if (!nextItemsMetadata[key]) nextItemsMetadata[key] = {};
            nextItemsMetadata[key].sisa_kemarin = newValue;

            const stokBaru = nextItemsMetadata[key].input_baru ?? 0;
            const totalStokBaru = Number(nextItemsMetadata[key].sisa_kemarin) + Number(stokBaru);
            const nextItems = { ...(nextRow.items || {}), [key]: totalStokBaru };

            await supabase
              .from("fafifa-costing")
              .update({
                items_metadata: nextItemsMetadata,
                items: nextItems,
              })
              .eq("id", nextRow.id);
          }
        }
      }

      toast.dismiss();
      toast.success("✅ Perubahan tersimpan");
      onUpdate();
      setEditing(null);
    } catch {
      toast.dismiss();
      toast.error("Gagal menyimpan ke cloud");
    }
  };

  const keydown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") simpanEdit();
    if (e.key === "Escape") setEditing(null);
  };

  return (
    <div className="border p-4 mb-4 rounded bg-white shadow-sm">
      {/* Header tanggal dan tombol aksi */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-3 gap-3">
        <div className="flex-1 flex flex-col md:flex-row md:items-center gap-4">
          <p className="font-semibold whitespace-nowrap">Tanggal: {tanggal}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onInputSisa(row)}
            className="p-2 text-lg text-amber-600 hover:bg-amber-100 rounded-full"
            title="Input Sisa"
          >
            📦
          </button>
          <button
            onClick={() => {
              if (confirm(`Hapus data tanggal ${tanggal}?`)) {
                onHapus(row.id, tanggal);
              }
            }}
            className="p-2 text-lg text-red-600 hover:bg-red-100 rounded-full"
            title="Hapus"
          >
            🗑️
          </button>
        </div>
      </div>

      {/* Input Makan Kue */}
      <div className="flex items-center gap-2 mb-2">
        <span className="font-semibold">Makan Kue:</span>
        {editMakanKue ? (
          <>
            <input
              type="number"
              min={0}
              className="w-20 border-b-2 border-gray-300 focus:border-blue-500 outline-none px-2 py-1"
              value={makanKueInput}
              onChange={(e) => setMakanKueInput(Number(e.target.value))}
              onKeyDown={(e) => e.key === "Enter" && simpanMakanKue()}
            />
            <button onClick={simpanMakanKue} className="px-2 py-1 bg-blue-600 text-white rounded">
              Submit
            </button>
            <button
              onClick={() => {
                setEditMakanKue(false);
                setMakanKueInput(makanKueValue);
              }}
              className="px-2 py-1 bg-gray-300 text-gray-700 rounded"
            >
              Batal
            </button>
          </>
        ) : (
          <>
            <span className="ml-2">{makanKueValue} pcs</span>
            <button
              onClick={() => setEditMakanKue(true)}
              className="ml-2 p-1 text-blue-600 hover:bg-blue-100 rounded"
              title="Edit Makan Kue"
            >
              ✏️
            </button>
          </>
        )}
      </div>

      {/* Tabel data stok */}
      <div className="grid grid-cols-5 font-semibold text-sm text-gray-600 mb-1 px-2 text-right">
        <span className="text-left">Jenis Kue</span>
        <span>Sisa Kemarin</span>
        <span>Stok Baru</span>
        <span>Total Stok</span>
        <span>Sisa Hari Ini</span>
      </div>

      <div className="space-y-1">
        {KUE_LIST.map((k) => {
          const stokVal = items?.[k.key] ?? 0;
          const sisaVal = sisa?.[k.key] ?? 0;
          const meta = items_metadata?.[k.key];
          const sisaKemarin = meta?.sisa_kemarin ?? 0;
          const stokBaru = meta?.input_baru ?? (stokVal - sisaKemarin);
          const editSisa = editing?.type === "sisa" && editing.key === k.key;
          const editStokBaru = editing?.type === "stok_baru" && editing.key === k.key;

          return (
            <div key={k.key} className="grid grid-cols-5 bg-gray-50 px-3 py-2 rounded items-center text-right">
              <span className="text-left">{k.label}</span>
              <span className="text-gray-500 cursor-help" title="Sisa dari hari sebelumnya.">
                {sisaKemarin}
              </span>

              {/* Edit Stok Baru */}
              <span
                className="cursor-pointer"
                onDoubleClick={() => {
                  setEditing({ type: "stok_baru", key: k.key });
                  setValue(String(stokBaru));
                }}
              >
                {editStokBaru ? (
                  <input
                    autoFocus
                    type="number"
                    className="w-16 text-right border rounded px-1 mx-auto"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    onKeyDown={keydown}
                    onBlur={simpanEdit}
                  />
                ) : (
                  stokBaru
                )}
              </span>

              <span className="font-bold">{stokVal}</span>

              {/* Edit Sisa */}
              <span
                className="cursor-pointer"
                onDoubleClick={() => {
                  setEditing({ type: "sisa", key: k.key });
                  setValue(String(sisaVal));
                }}
              >
                {editSisa ? (
                  <input
                    autoFocus
                    type="number"
                    className="w-16 text-right border rounded px-1 mx-auto"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    onKeyDown={keydown}
                    onBlur={simpanEdit}
                  />
                ) : (
                  sisaVal
                )}
              </span>
            </div>
          );
        })}

        <div className="grid grid-cols-5 font-bold bg-blue-50 px-3 py-2 rounded mt-1 text-right">
          <span className="text-left">Total</span>
          <span>{totalSisaKemarin}</span>
          <span>{totalStokBaru}</span>
          <span>{totalStok}</span>
          <span className="text-blue-700">{totalSisa}</span>
        </div>
      </div>

      {/* Total bawah */}
      <div className="mt-4 border-t pt-2">
        <div className="grid grid-cols-2">
          <span className="font-semibold">Total Terjual/Terpakai Hari Ini:</span>
          <span className="text-right font-bold text-lg text-green-700">
            {totalKeseluruhan.toLocaleString("id-ID")} pcs
          </span>
        </div>
      </div>
    </div>
  );
}
