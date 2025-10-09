import { useRef, useState } from "react";
import toast from "react-hot-toast";
import { updateSisaCloud } from "../../utils/supabaseStorage";
import { KUE_LIST } from "../InputStokKue";
import HeaderBar from "./components/HeaderBar";
import SisaForm from "./components/SisaForm";
import type { StokMap } from "./type";

const InputSisaKue: React.FC<{
  onSuccess?: () => void;
  defaultTanggal?: string;
  defaultItems?: Record<string, number>;
  defaultSisa?: Record<string, number>;
}> = ({
  onSuccess,
  defaultTanggal = "",
  defaultItems = {},
  defaultSisa = {},
}) => {
  const [tanggal] = useState<string>(defaultTanggal);
  const [stokAwal] = useState<Record<string, number>>(defaultItems);
  const [stok, setStok] = useState<StokMap>(() =>
    KUE_LIST.reduce((acc: StokMap, k) => {
      acc[k.key] = defaultSisa[k.key] ?? 0;
      return acc;
    }, {} as StokMap)
  );

  const [saving, setSaving] = useState<boolean>(false);
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const handleChange = (key: string, raw: string): void => {
    const val = raw === "" ? 0 : Math.max(0, Number(raw));
    setStok((prev: StokMap) => ({
      ...prev,
      [key]: Number.isNaN(val) ? 0 : val,
    }));
  };

  const handleBlur = (key: string): void => {
    const val = stok[key] ?? 0;
    const max = stokAwal[key] ?? 0;
    if (val > max) {
      toast.error(
        `Sisa ${KUE_LIST.find((k) => k.key === key)?.label ?? key} (${val}) melebihi stok awal (${max}).`
      );
      setTimeout(() => inputRefs.current[key]?.focus(), 0);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setSaving(true);
    const toastId = toast.loading("Menyimpan data sisa...");
    try {
      for (const kue of KUE_LIST) {
        const max = stokAwal[kue.key] ?? 0;
        const val = stok[kue.key] ?? 0;
        if (val > max) {
          toast.dismiss(toastId);
          toast.error(`Sisa ${kue.label} (${val}) melebihi stok awal (${max}).`);
          setSaving(false);
          setTimeout(() => inputRefs.current[kue.key]?.focus(), 0);
          return;
        }
      }

      await updateSisaCloud(tanggal, stok);
      toast.dismiss(toastId);
      toast.success("✅ Data sisa berhasil diperbarui.");
      setSaving(false);
      onSuccess?.();
    } catch (err) {
      console.error(err);
      toast.dismiss(toastId);
      toast.error("🔴 Gagal memperbarui data sisa.");
      setSaving(false);
    }
  };

  return (
    <div className="bg-gray-50 flex items-start justify-center p-4 md:p-6">
      <div className="w-full bg-white shadow-lg rounded-2xl p-6">
        <HeaderBar />
        <SisaForm
          tanggal={tanggal}
          stokAwal={stokAwal}
          stok={stok}
          saving={saving}
          inputRefs={inputRefs}
          onSubmit={handleSubmit}
          onItemChange={handleChange}
          onItemBlur={handleBlur}
        />
      </div>
    </div>
  );
};

export default InputSisaKue;
