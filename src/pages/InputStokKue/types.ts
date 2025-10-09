// ==============================
// 📦 Type Definitions for Stok Kue Module
// ==============================

// Peta stok: key (kode kue) → jumlah stok
export interface StokMap {
  [key: string]: number;
}

// Metadata tambahan untuk setiap item kue
export interface ItemMetadata {
  /** Jumlah input baru hari ini */
  input_baru: number;

  /** Sisa stok dari hari sebelumnya */
  sisa_kemarin: number;
}

// Struktur utama entri stok harian
export interface StokEntry {
  /** Unique ID (biasanya Date.now()) */
  readonly id: number;

  /** Tanggal input dalam format YYYY-MM-DD */
  tanggal: string;

  /** Stok gabungan (input baru + sisa kemarin) */
  items: StokMap;

  /** Menandai item yang auto-filled dari sisa kemarin */
  auto_filled_items?: Record<string, boolean>;

  /** Metadata detail setiap kue */
  items_metadata?: Record<string, ItemMetadata>;

  /** Timestamp ISO ketika data disimpan */
  readonly createdAt: string;
}

// ==============================
// 📋 Interface tambahan (opsional)
// ==============================

/**
 * Status sinkronisasi (untuk mode offline/online)
 */
export interface SyncStatus {
  isOnline: boolean;
  lastSync?: string;
}

/**
 * Struktur data laporan stok harian
 * (bisa dipakai untuk halaman rekap/laporan)
 */
export interface LaporanRecord {
  readonly id: number;
  tanggal: string;
  stok: StokMap;
  sisa?: StokMap;
  catatan?: string;
}
