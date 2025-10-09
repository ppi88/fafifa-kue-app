import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { supabase } from "../../../lib/supabaseClient";
import { KUE_LIST } from "../../InputStokKue";

interface ModalData {
  tanggal: string;
  kue_key: string;
  kue_label: string;
  input_baru: number;
  sisa_kemarin: number;
}

interface Props {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  data: ModalData | null;
}

export default function ModalEditGabungan({ visible, onClose, onSuccess, data }: Props) {
  const [inputBaru, setInputBaru] = useState(0);
  const [rincianSisaKemarin, setRincianSisaKemarin] = useState<Record<string, number> | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (data) {
      setInputBaru(data.input_baru);
      const fetchRincian = async () => {
        const { data: allData } = await supabase.from("fafifa-costing").select("tanggal, sisa").order("tanggal", { ascending: false });
        if (allData) {
          const currentIndex = allData.findIndex(d => d.tanggal === data.tanggal);
          const prevData = allData[currentIndex + 1];
          if (prevData) {
            setRincianSisaKemarin(prevData.sisa || {});
          }
        }
      };
      fetchRincian();
    }
  }, [data]);

  if (!visible || !data) return null;

  const handleSimpan = async () => {
    setSaving(true);
    toast.loading("Menyimpan perubahan...");
    try {
      const newTotal = inputBaru + data.sisa_kemarin;
      
      const { data: currentData, error: currentError } = await supabase.from("fafifa-costing").select("items, items_metadata").eq("tanggal", data.tanggal).single();
      if (currentError) throw currentError;

      const updatedItems = { ...(currentData.items || {}), [data.kue_key]: newTotal };
      const updatedMetadata = { ...(currentData.items_metadata || {}), [data.kue_key]: { input_baru: inputBaru, sisa_kemarin: data.sisa_kemarin } };
      
      await supabase.from("fafifa-costing").update({ items: updatedItems, items_metadata: updatedMetadata }).eq("tanggal", data.tanggal);

      toast.dismiss();
      toast.success("✅ Perubahan berhasil disimpan");
      onSuccess();
    } catch (err) {
      toast.dismiss();
      toast.error("Gagal menyimpan perubahan.");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg flex gap-6" onClick={(e) => e.stopPropagation()}>
        {/* Kolom Kiri: Form Edit */}
        <div className="flex-1">
          <h2 className="text-lg font-bold mb-1">Edit Stok Gabungan</h2>
          <p className="text-sm text-gray-600 mb-4">{data.kue_label} - {data.tanggal}</p>

          <div className="space-y-4">
            <div>
              {/* ✅ LABEL DIPERBARUI MENJADI DINAMIS */}
              <label className="block text-sm font-medium text-gray-700">Sisa Kemarin - {data.kue_label} (Referensi)</label>
              <input type="number" value={data.sisa_kemarin} readOnly className="mt-1 block w-full border rounded-md shadow-sm p-2 bg-gray-100 cursor-not-allowed" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Input Baru Hari Ini</label>
              <input type="number" value={inputBaru} onChange={(e) => setInputBaru(Number(e.target.value))} className="mt-1 block w-full border rounded-md shadow-sm p-2" disabled={saving} />
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300">Batal</button>
            <button onClick={handleSimpan} disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300">{saving ? 'Menyimpan...' : 'Simpan'}</button>
          </div>
        </div>

        {/* Kolom Kanan: Rincian Sisa Kemarin */}
        {rincianSisaKemarin && (
          <div className="w-48 bg-gray-50 p-3 rounded-md border">
            <h3 className="text-sm font-semibold mb-2 text-gray-800">Rincian Sisa Kemarin</h3>
            <div className="space-y-1 text-sm">
              {KUE_LIST.map(kue => {
                const sisa = rincianSisaKemarin[kue.key] ?? 0;
                if (sisa > 0) {
                  return (
                    <div key={kue.key} className="flex justify-between">
                      <span className="text-gray-600">{kue.label}</span>
                      <span className="font-medium">{sisa}</span>
                    </div>
                  );
                }
                return null;
              })}
              <div className="border-t mt-2 pt-2 flex justify-between font-bold">
                <span>Total</span>
                <span>{Object.values(rincianSisaKemarin).reduce((a, b) => a + b, 0)}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}