interface HeaderBarProps {
  onAdd: () => void;
  filterDate: string;
  onFilterChange: (date: string) => void;
  onClearFilter: () => void;
  onRefresh: () => void; // <-- Tambahkan ini
}

export default function HeaderBar({ onAdd, filterDate, onFilterChange, onClearFilter, onRefresh }: HeaderBarProps) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
      <h1 className="text-2xl font-bold">📊 Laporan Stok Kue Fafifa</h1>

      <div className="flex items-center gap-4">
        {/* Input Kalender */}
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={filterDate}
            onChange={(e) => onFilterChange(e.target.value)}
            className="border rounded-md px-3 py-2"
          />
          {filterDate && (
            <button onClick={onClearFilter} className="text-red-500 hover:text-red-700 text-2xl" title="Hapus Filter">
              &times;
            </button>
          )}
        </div>

        {/* Tombol Refresh */}
        <button
          onClick={onRefresh}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md shadow flex items-center gap-2"
          title="Refresh Data"
        >
          <span>🔄</span>
          <span className="hidden md:inline">Refresh</span>
        </button>

        {/* Tombol Input Stok */}
        <button
          onClick={onAdd}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md shadow"
        >
          ➕ Input Stok
        </button>
      </div>
    </div>
  );
}