import { KUE_LIST } from "../index";

interface StockFormProps {
  tanggal: string;
  stok?: Record<string, number>; // Optional untuk mencegah undefined
  sisaKemarin?: Record<string, number>; // Optional untuk mencegah undefined
  saving: boolean;
  onTanggalChange: (tgl: string) => void;
  onItemChange: (key: string, value: number) => void;
  onSubmit: () => void;
}

export default function StockForm({
  tanggal,
  stok = {}, // ✅ Fallback default agar tidak undefined
  sisaKemarin = {}, // ✅ Fallback default agar tidak undefined
  saving,
  onTanggalChange,
  onItemChange,
  onSubmit,
}: StockFormProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 mb-6">
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
        <div className="grid grid-cols-4 font-semibold text-gray-700 mb-2 text-center">
          <div className="text-left">Jenis Kue</div>
          <div>Sisa Kemarin</div>
          <div>Stok Baru</div>
          <div>Total Stok</div>
        </div>
        <div className="space-y-2">
          {KUE_LIST.map((kue) => {
            const sisaKemarinVal = sisaKemarin?.[kue.key] ?? 0;
            const stokBaruVal = stok?.[kue.key] ?? 0;
            const totalStok = sisaKemarinVal + stokBaruVal;

            return (
              <div
                key={kue.key}
                className="grid grid-cols-4 items-center py-2 border-b last:border-b-0"
              >
                <div className="text-gray-800 text-left">{kue.label}</div>
                <div className="text-center text-gray-600">{sisaKemarinVal}</div>
                <div className="flex justify-center">
                  <input
                    type="number"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={stokBaruVal === 0 ? "" : stokBaruVal}
                    onChange={(e) => onItemChange(kue.key, Number(e.target.value))}
                    className="w-24 text-right border rounded-lg px-2 py-1"
                    min={0}
                    placeholder="0"
                  />
                </div>
                <div className="text-center font-bold text-gray-800">{totalStok}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className={`flex items-center gap-2 ${
            saving ? "bg-blue-400 cursor-wait" : "bg-blue-600 hover:bg-blue-700"
          } text-white px-5 py-2 rounded-lg shadow transition-colors`}
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
          {saving ? "Menyimpan..." : "💾 Simpan Stok"}
        </button>
      </div>
    </form>
  );
}