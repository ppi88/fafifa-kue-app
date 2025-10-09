// ==============================
// 📦 Type Definitions - Modul Stok Kue
// ==============================

export interface StokMap {
  [key: string]: number;
}

// Metadata tambahan per item kue
export interface ItemMetadata {
  input_baru: number;
  sisa_kemarin: number;
}

// Struktur data entri stok harian (lokal / cloud)
export interface StokEntry {
  id: number;
  tanggal: string;
  items: StokMap;
  sisa?: StokMap;
  items_metadata?: Record<string, ItemMetadata>;
  auto_filled_items?: Record<string, boolean>;
  created_at: string;
}

// Struktur laporan gabungan (rekapan per tanggal)
export interface LaporanRecord {
  id: number;
  tanggal: string;
  stok?: StokMap;     // stok hasil perhitungan
  items?: StokMap;    // inputan harian
  sisa?: StokMap;     // input sisa
  created_at?: string;
}
