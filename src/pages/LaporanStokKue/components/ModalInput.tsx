import { Suspense, lazy, useEffect } from "react";
import type { LaporanRecord } from "../types";

// ✅ Path disesuaikan ke struktur folder project
const LazyInputStokKue = lazy(() => import("../../InputStokKue"));
const LazyInputSisaKue = lazy(() => import("../../InputSisaKue"));

interface ModalProps {
  type: "stok" | "sisa" | null;
  visible: boolean;
  onClose: () => void;
  selected?: LaporanRecord | null;
  onSuccess: () => void;
}

/**
 * 🔹 ModalInput Component
 * - Menampilkan form input stok atau sisa kue secara dinamis.
 * - Menggunakan React.lazy untuk optimasi (lazy loading).
 * - Dapat ditutup dengan tombol ESC atau klik di luar modal.
 */
export default function ModalInput({
  type,
  visible,
  onClose,
  selected,
  onSuccess,
}: ModalProps) {
  // 🔸 Tutup modal saat tekan ESC
  useEffect(() => {
    if (!visible) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [visible, onClose]);

  // 🔸 Tidak render modal jika belum visible
  if (!visible) return null;

  // 🔸 Tentukan judul modal berdasarkan tipe
  const title =
    type === "stok"
      ? "➕ Tambah Stok Kue Baru"
      : `📦 Input Sisa Kue (${selected?.tanggal || "-"})`;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-2 z-50"
      onClick={onClose}
    >
      <div
        className="relative bg-white w-full max-w-3xl rounded-xl shadow-lg flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 🔹 Tombol Tutup */}
        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-gray-500 hover:text-red-600 text-2xl z-10"
          aria-label="Tutup Modal"
        >
          &times;
        </button>

        {/* 🔹 Header */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-700">{title}</h2>
        </div>

        {/* 🔹 Body - lazy load form */}
        <div className="overflow-y-auto p-4 md:p-6 flex-1">
          <Suspense fallback={<p className="text-center p-8">Memuat form...</p>}>
            {type === "stok" ? (
              // 🔸 Input Stok Kue
              <LazyInputStokKue onSuccess={onSuccess} />
            ) : (
              // 🔸 Input Sisa Kue
              <LazyInputSisaKue
                defaultTanggal={selected?.tanggal ?? ""}
                defaultItems={selected?.items ?? {}}
                onSuccess={onSuccess}
              />
            )}
          </Suspense>
        </div>
      </div>
    </div>
  );
}
