// ==============================
// 📦 Type Definitions for Stok Kue Module
// ==============================

/**
 * Peta stok: key (kode kue) → jumlah stok
 */
export interface StokMap {
  [key: string]: number;
}

/**
 * Metadata tambahan untuk setiap item kue
 */
export interface ItemMetadata {
  inputBaru: number;      // Jumlah input baru hari ini
  sisaKemarin: number;    // Sisa stok dari hari sebelumnya
}

/**
 * Struktur data input stok harian (untuk form input)
 */
export interface StokEntry {
  id: number;
  tanggal: string;
  items: StokMap;         // Stok per jenis kue
  createdAt: string;      // Waktu pembuatan (ISO string)
}

/**
 * Data laporan stok gabungan (rekapan per tanggal)
 */
export interface LaporanRecord {
  id: number;
  tanggal: string;
  stok: StokMap;          // Hasil stok tersimpan di cloud
  items?: StokMap;        // Optional: hasil input harian (jika disimpan terpisah)
  sisa?: StokMap;         // Optional: sisa akhir per jenis kue
  createdAt?: string;     // Gunakan gaya camelCase agar seragam
}
