import { KUE_LIST } from "../index";
import type { StokMap } from "../types";

interface StockFormProps {
  tanggal: string;
  stok: StokMap;
  saving: boolean;
  onTanggalChange: (t: string) => void;
  onItemChange: (key: string, val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function StockForm({
  tanggal,
  stok,
  saving,
  onTanggalChange,
  onItemChange,
  onSubmit,
}: StockFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-6 mb-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tanggal
        </label>
        <input
          type="date"
          value={tanggal}
          onChange={(e) => onTanggalChange(e.target.value)}
          className="w-full md:w-1/3 border rounded-lg px-3 py-2"
          required
        />
      </div>

      <div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center font-semibold text-gray-700 mb-2">
          <div>Jenis Kue</div>
          <div className="md:col-span-2 text-right">
            Jumlah (tidak boleh &gt; stok awal pada mode sisa)
          </div>
        </div>
        <div className="space-y-2">
          {KUE_LIST.map((k) => (
            <div
              key={k.key}
              className="grid grid-cols-2 md:grid-cols-3 gap-3 items-center py-2 border-b last:border-b-0"
            >
              <div className="text-gray-800">{k.label}</div>
              <div className="md:col-span-2 flex justify-end md:justify-start">
                <input
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={String(stok[k.key] ?? 0)}
                  onChange={(e) => onItemChange(k.key, e.target.value)}
                  className="w-28 text-right border rounded-lg px-2 py-1"
                  min={0}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className={`flex items-center gap-2 ${
            saving ? "bg-blue-400 cursor-wait" : "bg-blue-600 hover:bg-blue-700"
          } text-white px-5 py-2 rounded-lg shadow`}
        >
          {saving && (
            <svg
              className="animate-spin h-4 w-4 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4l3.5-3.5L12 0v4a8 8 0 100 16v4l3.5-3.5L12 20v4a8 8 0 01-8-8z"
              ></path>
            </svg>
          )}
          {saving ? "Menyimpan..." : "💾 Simpan"}
        </button>
      </div>
    </form>
  );
}