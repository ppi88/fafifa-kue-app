import { KUE_LIST } from "../index";
import type { StokEntry } from "../types";

interface RecapListProps {
  entries: StokEntry[];
  onDelete: (id: number) => void;
}

const fmtTanggal = (iso: string) =>
  new Date(iso).toLocaleDateString("id-ID");

export default function RecapList({ entries, onDelete }: RecapListProps) {
  if (entries.length === 0)
    return <p className="text-gray-500 italic">Belum ada data stok kue.</p>;

  return (
    <div>
      <h2 className="text-lg font-semibold mb-3">Rekap Stok</h2>
      <div className="space-y-3">
        {entries.map((e) => (
          <div
            key={e.id}
            className="border rounded-xl p-3 flex flex-col md:flex-row md:justify-between md:items-center bg-gray-50"
          >
            <div>
              <div className="font-semibold text-gray-800">{fmtTanggal(e.tanggal)}</div>
              <div className="text-xs text-gray-500">
                Simpan: {new Date(e.createdAt).toLocaleString("id-ID")}
              </div>
            </div>
            <div className="mt-3 md:mt-0 grid grid-cols-2 gap-2 md:grid-cols-6 md:gap-4">
              {KUE_LIST.map((k) => (
                <div key={k.key} className="text-sm">
                  <div className="text-gray-600">{k.label}</div>
                  <div className="font-medium text-gray-800">{e.items[k.key] ?? 0}</div>
                </div>
              ))}
            </div>
            <div className="mt-3 md:mt-0 md:ml-4">
              <button
                onClick={() => onDelete(e.id)}
                className="text-sm text-red-600 hover:underline"
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