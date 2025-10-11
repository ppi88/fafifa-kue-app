// src/pages/LaporanStokKue/components/ModalInput.tsx (Versi Bersih & Siap Pakai)

import { Suspense, lazy, useEffect } from "react";
import type { LaporanRecord } from "../types";

// Pastikan path ke file komponen form sudah benar
const LazyInputStokKue = lazy(() => import("../../InputStokKue"));
const LazyInputSisaForm = lazy(() => import("../../InputSisaKue"));

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
    if (!visible) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [visible, onClose]);

  if (!visible) return null;

  const title =
    type === "stok"
      ? "➕ Input Stok Kue Baru"
      : `📦 Input Sisa Kue (Tanggal: ${selected?.tanggal || "..."})`;

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div
        className="relative bg-white w-full max-w-4xl rounded-xl shadow-2xl flex flex-col max-h-[95vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-red-500 text-3xl z-10"
          aria-label="Tutup Modal"
        >
          &times;
        </button>

        <div className="p-5 border-b">
          <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
        </div>

        <div className="overflow-y-auto p-6 flex-1">
          <Suspense fallback={<div className="text-center p-10">Memuat form...</div>}>
            {type === "stok" ? (
              <LazyInputStokKue
                key="form-stok"
                onSuccess={onSuccess}
                isModalMode={true}
              />
            ) : (
              <LazyInputSisaForm
                key="form-sisa"
                defaultTanggal={selected?.tanggal ?? ""}
                onSuccess={onSuccess}
              />
            )}
          </Suspense>
        </div>
      </div>
    </div>
  );
}