import { useState } from "react";
import toast from "react-hot-toast";
import { supabase } from "../../../lib/supabaseClient";
import { KUE_LIST } from "../index";

// Helper: ambil tanggal sebelumnya (YYYY-MM-DD)
function getPreviousTanggal(current: string): string | null {
  if (!current) return null;
  const date = new Date(current);
  if (isNaN(date.getTime())) return null;
  date.setDate(date.getDate() - 1);
  return date.toISOString().split("T")[0];
}

interface UseInputStokOptions {
  onSuccess?: () => void;
}

export function useInputStok({ onSuccess }: UseInputStokOptions) {
  const [tanggal, setTanggal] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [stok, setStok] = useState<Record<string, number>>({});
  const [saving, setSaving] = useState<boolean>(false);

  const handleChange = (key: string, value: number) => {
    setStok((prev) => ({ ...prev, [key]: value }));
  };

  const applyDefaultItems = (defaultItems: Record<string, number>) => {
    setStok(defaultItems);
  };

  // ✅ Cek apakah tanggal sudah pernah diinput
  const cekTanggalSudahAda = async (tanggal: string): Promise<boolean> => {
    const { data, error } = await supabase
      .from("fafifa_costing")
      .select("id")
      .eq("tanggal", tanggal)
      .limit(1);

    if (error) {
      toast.error("Gagal cek tanggal");
      return false;
    }

    return data && data.length > 0;
  };

  const handleSubmit = async () => {
    if (!tanggal || Object.keys(stok).length === 0) {
      toast.error("❌ Tanggal atau data stok belum diisi.");
      return;
    }

    const sudahAda = await cekTanggalSudahAda(tanggal);
    if (sudahAda) {
      const konfirmasi = window.confirm(
        `⚠️ Tanggal ${tanggal} sudah pernah diinput.\nApakah Anda ingin mengganti data tanggal tersebut?`
      );
      if (!konfirmasi) return;
    }

    setSaving(true);
    const toastId = toast.loading("Memproses data...");

    try {
      // ✅ Ambil sisa kemarin dari tanggal sebelumnya
      let sisaKemarinDariDB: Record<string, number> = {};
      const prevTanggal = getPreviousTanggal(tanggal);

      if (prevTanggal) {
        const { data: prevData, error: fetchError } = await supabase
          .from("fafifa_costing")
          .select("sisa")
          .eq("tanggal", prevTanggal)
          .single();

        if (fetchError) {
          console.warn("⚠️ Gagal ambil sisa kemarin:", fetchError.message);
        }

        if (prevData?.sisa) {
          sisaKemarinDariDB = prevData.sisa;
        }
      }

      // ✅ Siapkan payload
      const items: Record<string, number> = {};
      const items_metadata: Record<
        string,
        { sisa_kemarin: number; input_baru: number }
      > = {};

      KUE_LIST.forEach(({ key }) => {
        const sisaKemarin = sisaKemarinDariDB[key] ?? 0;
        const inputBaru = stok[key] ?? 0;

        items[key] = sisaKemarin + inputBaru;
        items_metadata[key] = {
          sisa_kemarin: sisaKemarin,
          input_baru: inputBaru,
        };
      });

      console.log("📝 Payload:", { tanggal, items, items_metadata });

      const { error: saveError } = await supabase
        .from("fafifa_costing")
        .upsert(
          {
            tanggal,
            items,
            items_metadata,
          },
          { onConflict: "tanggal" }
        );

      if (saveError) throw saveError;

      toast.success("✅ Data stok berhasil disimpan!", { id: toastId });
      setStok({});
      onSuccess?.();
    } catch (error: any) {
      console.error("❌ Error saat simpan:", error);
      toast.error(`Gagal menyimpan: ${error.message}`, { id: toastId });
    } finally {
      setSaving(false);
    }
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
    entries: [], // bisa diganti dengan data fetch jika diperlukan
    handleDelete: () => {}, // placeholder
  };
}