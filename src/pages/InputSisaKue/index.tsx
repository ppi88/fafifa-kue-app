import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { KUE_LIST } from "../InputStokKue";

interface Props {
  defaultTanggal: string;
  defaultItems: Record<string, number>;
  onSuccess: () => void;
}

// Helper: ambil tanggal sebelumnya (YYYY-MM-DD)
function getPreviousTanggal(current: string): string {
  const date = new Date(current);
  date.setDate(date.getDate() - 1);
  return date.toISOString().split("T")[0];
}

export default function InputSisaKue({
  defaultTanggal,
  defaultItems,
  onSuccess,
}: Props) {
  const [tanggal, setTanggal] = useState(defaultTanggal || "");
  const [sisa, setSisa] = useState<Record<string, number>>({});
  const [items, setItems] = useState<Record<string, number>>(defaultItems || {});
  const [metadata, setMetadata] = useState<Record<string, any>>({});

  // ✅ Auto-isi sisa_kemarin dari tanggal sebelumnya
  useEffect(() => {
    async function fetchData() {
      const prevTanggal = getPreviousTanggal(tanggal);

      const { data, error } = await supabase
        .from("fafifa_costing")
        .select("sisa")
        .eq("tanggal", prevTanggal)
        .single();

      if (error || !data?.sisa) {
        console.warn("⚠️ Tidak ada data sisa hari sebelumnya");
        return;
      }

      const sisaHariKemarin = data.sisa;

      setMetadata((prev) => {
        const updated = { ...prev };
        KUE_LIST.forEach((k) => {
          if (!updated[k.key]) updated[k.key] = {};
          updated[k.key].sisa_kemarin = sisaHariKemarin[k.key] ?? 0;
        });
        return updated;
      });

      // Optional: langsung hitung items (total_stok)
      setItems((prev) => {
        const newItems = { ...prev };
        KUE_LIST.forEach((k) => {
          const stokBaru = newItems[k.key] ?? 0;
          const sisaKemarin = sisaHariKemarin[k.key] ?? 0;
          newItems[k.key] = stokBaru + sisaKemarin;
        });
        return newItems;
      });
    }

    if (tanggal) fetchData();
  }, [tanggal]);

  const handleChange = (type: "sisa" | "input_baru", key: string, val: number) => {
    if (type === "sisa") {
      setSisa((prev) => ({ ...prev, [key]: val }));
    } else {
      setMetadata((prev) => {
        const prevData = prev[key] ?? {};
        const sisaKemarin = prevData.sisa_kemarin ?? 0;
        return {
          ...prev,
          [key]: {
            ...prevData,
            input_baru: val,
          },
        };
      });

      setItems((prev) => {
        const sisaKemarin = metadata[key]?.sisa_kemarin ?? 0;
        return {
          ...prev,
          [key]: val + sisaKemarin,
        };
      });
    }
  };

  const handleSimpan = async () => {
    const { error } = await supabase
      .from("fafifa_costing")
      .upsert({
        tanggal,
        sisa,
        items,
        items_metadata: metadata,
      });

    if (error) {
      alert("❌ Gagal simpan data");
      console.error(error);
    } else {
      alert("✅ Data berhasil disimpan");
      onSuccess();
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold mb-4">📦 Input Sisa Kue - {tanggal}</h2>

      <table className="w-full text-sm">
        <thead className="text-left bg-gray-100">
          <tr>
            <th>Kue</th>
            <th>Sisa Kemarin</th>
            <th>Stok Baru</th>
            <th>Total Stok</th>
            <th>Sisa Hari Ini</th>
          </tr>
        </thead>
        <tbody>
          {KUE_LIST.map((kue) => {
            const key = kue.key;
            const meta = metadata[key] ?? {};
            const sisaKemarin = meta.sisa_kemarin ?? 0;
            const inputBaru = meta.input_baru ?? 0;
            const totalStok = items[key] ?? sisaKemarin + inputBaru;
            const sisaHariIni = sisa[key] ?? 0;

            return (
              <tr key={key}>
                <td>{kue.label}</td>
                <td>{sisaKemarin}</td>
                <td>
                  <input
                    type="number"
                    value={inputBaru}
                    onChange={(e) =>
                      handleChange("input_baru", key, Number(e.target.value))
                    }
                    className="border px-2 w-20 text-right"
                  />
                </td>
                <td>{totalStok}</td>
                <td>
                  <input
                    type="number"
                    value={sisaHariIni}
                    onChange={(e) =>
                      handleChange("sisa", key, Number(e.target.value))
                    }
                    className="border px-2 w-20 text-right"
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="pt-4">
        <button
          onClick={handleSimpan}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Simpan
        </button>
      </div>
    </div>
  );
}