export interface LaporanRecord {
  id: number;
  tanggal: string;
  items: Record<string, number>;
  sisa?: Record<string, number>;
  auto_filled_items?: Record<string, boolean>;
  items_metadata?: Record<string, { input_baru: number, sisa_kemarin: number }>;
  created_at: string;
}