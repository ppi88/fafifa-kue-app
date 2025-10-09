import { KUE_LIST } from "../index";
import type { LaporanRecord } from "../types";

interface RecapListProps {
  entries: LaporanRecord[];
  onDelete: (id: number, tanggal: string) => void;
}

const fmtTanggal = (iso: string) =>
  new Date(iso).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

export default function RecapList({ entries, onDelete }: RecapListProps) {
  if (!entries || entries.length === 0)
    return <p className="text-gray-500 italic">Belum ada data laporan stok kue.</p>;

  return (
    <div>
      <h2 className="text-lg font-semibold mb-3">Rekap Stok Kue</h2>

      <div className="space-y-3">
        {entries.map((e) => (
          <div
            key={e.id}
            className="border rounded-xl p-3 flex flex-col md:flex-row md:justify-between md:items-center bg-gray-50 hover:bg-gray-100 transition"
          >
            {/* Bagian kiri: tanggal & waktu simpan */}
            <div className="flex flex-col">
              <div className="font-semibold text-gray-800">
                {fmtTanggal(e.tanggal)}
              </div>
              <div className="text-xs text-gray-500">
                Disimpan: {new Date(e.created_at).toLocaleString("id-ID")}
              </div>
            </div>

            {/* Bagian tengah: daftar jumlah kue */}
            <div className="mt-3 md:mt-0 grid grid-cols-2 gap-2 md:grid-cols-6 md:gap-4 text-sm">
              {KUE_LIST.map((k) => (
                <div key={k.key} className="text-gray-700">
                  <div className="text-gray-600">{k.label}</div>
                  <div className="font-medium text-gray-900">
                    {e.items?.[k.key] ?? 0}
                  </div>
                </div>
              ))}
            </div>

            {/* Bagian kanan: tombol hapus */}
            <div className="mt-3 md:mt-0 md:ml-4">
              <button
                onClick={() => onDelete(e.id, e.tanggal)}
                className="text-sm text-red-600 hover:text-red-800 hover:underline"
              >
                Hapus
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
