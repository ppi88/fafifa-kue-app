import React, { Suspense, lazy, useEffect } from "react";
import type { LaporanRecord } from "../types";

// ✅ Menggunakan path eksplisit ke index untuk memastikan lazy loading bekerja
const LazyInputStokKue = lazy(() => import("../../InputStokKue/index"));
const LazyInputSisaKue = lazy(() => import("../../InputSisaKue/index"));

interface ModalProps {
  type: "stok" | "sisa" | null;
  visible: boolean;
  onClose: () => void;
  selected?: LaporanRecord | null;
  onSuccess: () => void;
}

export default function ModalInput({
  type,
  visible,
  onClose,
  selected,
  onSuccess,
}: ModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (visible) {
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [visible, onClose]);

  if (!visible) return null;

  const title =
    type === "stok"
      ? "➕ Tambah Stok Kue Baru"
      : `📦 Input Sisa Kue (${selected?.tanggal})`;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-2 z-50"
      onClick={onClose}
    >
      <div
        className="relative bg-white w-full max-w-3xl rounded-xl shadow-lg flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-gray-500 hover:text-red-600 text-2xl z-10"
        >
          &times;
        </button>

        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">{title}</h2>
        </div>

        <div className="overflow-y-auto p-4 md:p-6 flex-1">
          <Suspense fallback={<p className="text-center p-8">Memuat form...</p>}>
            {type === "stok" ? (
              <LazyInputStokKue onSuccess={onSuccess} />
            ) : (
              <LazyInputSisaKue
                defaultTanggal={selected?.tanggal}
                defaultItems={selected?.items}
                defaultSisa={selected?.sisa}
                onSuccess={onSuccess}
              />
            )}
          </Suspense>
        </div>
      </div>
    </div>
  );
}