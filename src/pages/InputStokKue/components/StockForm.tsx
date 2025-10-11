import { KUE_LIST } from "../index";

interface StockFormProps {
  tanggal: string;
  stok?: Record<string, number>;
  saving: boolean;
  onTanggalChange: (tgl: string) => void;
  onItemChange: (key: string, value: number) => void;
  onSubmit: () => void;
}

export default function StockForm({
  tanggal,
  stok = {},
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
    <form
      onSubmit={handleSubmit}
      className="space-y-4 mb-4 bg-white border border-gray-300 rounded-xl shadow-sm p-4"
    >
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Tanggal
        </label>
        <input
          type="date"
          value={tanggal}
          onChange={(e) => onTanggalChange(e.target.value)}
          className="w-full md:w-1/2 border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
          required
        />
      </div>

      <div>
        <div className="grid grid-cols-2 font-semibold text-gray-700 mb-1 text-center text-sm">
          <div className="text-left">Jenis Kue</div>
          <div className="text-right">Stok Baru</div>
        </div>
        <div className="space-y-2">
          {KUE_LIST.map((kue) => {
            const stokBaruVal = stok?.[kue.key] ?? 0;

            return (
              <div
                key={kue.key}
                className="grid grid-cols-2 items-center py-2 px-2 bg-gray-50 rounded-md border border-gray-200"
              >
                <div className="text-gray-800 text-left text-sm font-medium">
                  {kue.label}
                </div>
                <div className="flex justify-end">
                  <input
                    type="number"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={stokBaruVal === 0 ? "" : stokBaruVal}
                    onChange={(e) =>
                      onItemChange(kue.key, Number(e.target.value))
                    }
                    className="w-full max-w-[100px] text-right border border-gray-300 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    min={0}
                    placeholder="0"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={saving}
          className={`flex items-center gap-2 ${
            saving ? "bg-blue-400 cursor-wait" : "bg-blue-600 hover:bg-blue-700"
          } text-white px-4 py-1.5 rounded-md shadow-sm text-sm transition-colors`}
        >
          {saving ? "Menyimpan..." : "💾 Simpan Stok"}
        </button>
      </div>
    </form>
  );
}