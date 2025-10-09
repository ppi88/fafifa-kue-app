// src/pages/InputSisaKue/components/SisaForm.tsx
import { useState } from "react";
import type { FormEvent, MutableRefObject } from "react";
import type { StokMap } from "../type"; // <-- pastikan file type.ts ada dan export StokMap

type SisaFormProps = {
  tanggal: string;
  stokAwal: Record<string, number>;
  stok: StokMap;
  saving: boolean;
  inputRefs: MutableRefObject<Record<string, HTMLInputElement | null>>;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void | Promise<void>;
  onItemChange: (key: string, raw: string) => void;
  onItemBlur: (key: string) => void;
};

export default function SisaForm({
  tanggal,
  stokAwal,
  stok,
  saving,
  inputRefs,
  onSubmit,
  onItemChange,
  onItemBlur,
}: SisaFormProps) {
  const [localTouched, setLocalTouched] = useState<Record<string, boolean>>({});

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="text-sm text-gray-600">Tanggal: {tanggal}</div>

      <div className="grid grid-cols-1 gap-3">
        {Object.keys(stokAwal).map((k) => {
          const max = stokAwal[k] ?? 0;
          const value = stok[k] ?? 0;

          return (
            <div key={k} className="flex items-center gap-3">
              <label htmlFor={`sisa-${k}`} className="w-28 text-sm">
                {k}
              </label>

              <input
                id={`sisa-${k}`}
                type="number"
                min={0}
                step={1}
                value={String(value)}
                onChange={(ev) => onItemChange(k, ev.target.value)}
                onBlur={() => {
                  setLocalTouched((p) => ({ ...p, [k]: true }));
                  onItemBlur(k);
                }}
                ref={(el) => {
                  // BLOCK body - *jangan* mengembalikan value dari callback
                  inputRefs.current[k] = el;
                }}
                className="border rounded px-2 py-1 w-32"
              />

              <div className="text-xs text-gray-500">
                max: {max}
                {localTouched[k] && value > max && (
                  <div className="text-red-600">Melebihi stok awal!</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-end pt-4">
        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-60"
        >
          {saving ? "Menyimpan..." : "Simpan"}
        </button>
      </div>
    </form>
  );
}
