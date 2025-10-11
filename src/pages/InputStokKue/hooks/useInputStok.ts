import { useState } from "react";
import toast from "react-hot-toast";
import { supabase } from "../../../lib/supabaseClient";
import { KUE_LIST } from "../index";

function getPreviousTanggal(current: string): string | null {
  if (!current) return null;
  const date = new Date(current);
  if (isNaN(date.getTime())) return null;
  date.setDate(date.getDate() - 1);
  return date.toISOString().split("T")[0];
}

export function useInputStok({ onSuccess }: { onSuccess?: () => void }) {
  const [tanggal, setTanggal] = useState(new Date().toISOString().split("T")[0]);
  const [stok, setStok] = useState<Record<string, number>>({});
  const [saving, setSaving] = useState(false);

  const handleChange = (key: string, value: number) => {
    setStok((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    if (Object.keys(stok).length === 0) {
      toast.error("❌ Data stok belum diisi.");
      return;
    }

    setSaving(true);
    const toastId = toast.loading("Memproses data...");

    try {
      // ✅ Ambil data sisa dari tanggal sebelumnya
      let sisaKemarinDariDB: Record<string, number> = {};
      const prevTanggal = getPreviousTanggal(tanggal);
      if (prevTanggal) {
        const { data: prevData } = await supabase
          .from("fafifa_costing")
          .select("sisa")
          .eq("tanggal", prevTanggal)
          .single();

        if (prevData?.sisa) {
          sisaKemarinDariDB = prevData.sisa;
        }
      }

      // ✅ Siapkan payload untuk disimpan
      const items: Record<string, number> = {};
      const items_metadata: Record<string, any> = {};

      KUE_LIST.forEach((kue) => {
        const key = kue.key;
        const sisaKemarinVal = sisaKemarinDariDB[key] || 0;
        const inputBaruVal = stok[key] || 0;
        items[key] = sisaKemarinVal + inputBaruVal;
        items_metadata[key] = {
          sisa_kemarin: sisaKemarinVal,
          input_baru: inputBaruVal,
        };
      });

      console.log("Payload:", { tanggal, items, items_metadata });

      const { error } = await supabase
        .from("fafifa_costing")
        .upsert(
          {
            tanggal,
            items,
            items_metadata,
          },
          {
            onConflict: "tanggal",
          }
        );

      if (error) throw error;

      toast.success("✅ Data stok berhasil disimpan!", { id: toastId });
      setStok({});
      onSuccess?.();
    } catch (error: any) {
      console.error("Detail Error Penyimpanan:", error);
      toast.error(`❌ Gagal menyimpan: ${error.message}`, { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  const applyDefaultItems = (defaultItems: Record<string, number>) => {
    setStok(defaultItems);
  };

  return {
    tanggal,
    stok,
    saving,
    setTanggal,
    handleChange,
    handleSubmit,
    applyDefaultItems,
    isOnline: navigator.onLine,
    entries: [],
    handleDelete: () => {},
  };
}