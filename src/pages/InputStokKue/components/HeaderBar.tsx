interface HeaderBarProps {
  isOnline: boolean;
}

export default function HeaderBar({ isOnline }: HeaderBarProps) {
  return (
    <div className="flex justify-between items-center mb-4">
      <h1 className="text-2xl font-bold">🍰 Input Stok Kue Fafifa</h1>
      <span
        className={`text-sm font-medium ${
          isOnline ? "text-green-600" : "text-red-500"
        }`}
      >
        {isOnline ? "🟢 Online" : "🔴 Offline (lokal)"}
      </span>
    </div>
  );
}