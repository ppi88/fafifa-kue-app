// =========================
// TIPE DATA LAPORAN STOK KUE
// =========================

// Representasi tiap baris laporan harian
export interface LaporanRecord {
  id: number;
  tanggal: string;

  // Data stok hasil input harian (stok total per jenis kue)
  items: Record<string, number>;

  // Sisa stok di akhir hari
  sisa?: Record<string, number>;

  // Metadata stok (berapa input baru dan berapa sisa kemarin)
  items_metadata?: Record<
    string,
    {
      input_baru: number;
      sisa_kemarin: number;
    }
  >;

  // Item yang otomatis diisi dari sisa kemarin
  auto_filled_items?: Record<string, boolean>;

  /**
   * Jumlah kue yang dimakan / terpakai internal.
   * Bisa berupa angka total atau object per jenis kue.
   * Supabase kadang menyimpan dalam bentuk number tunggal (contoh: total makan kue),
   * atau objek `{ boluKukus: 2, pastel: 3 }`, jadi kita akomodasi keduanya.
   */
  makan_kue?: number | Record<string, number>;

  // Jumlah yang terjual (opsional)
  terjual?: Record<string, number>;

  // 🆕 Kolom tambahan: jumlah total kue rusak/dimakan hari itu
  rusak_dimakan?: number;

  // 🆕 Kolom opsional: catatan penjelasan (contoh: "2 rusak, 1 dimakan")
  catatan_rusak_dimakan?: string;

  // Timestamp dibuat di sistem
  created_at: string;
}

// =========================
// TIPE UNTUK KOMPONEN UI
// =========================
export interface Props {
  row: LaporanRecord;
  onInputSisa: (row: LaporanRecord) => void;
  onHapus: (id: number, tanggal: string) => void;
  onUpdate: () => void;
}
