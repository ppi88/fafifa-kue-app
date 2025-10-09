// src/utils/storage.ts
export type StokMap = Record<string, number>;

export type StokEntry = {
  id: number; // timestamp
  tanggal: string; // ISO yyyy-mm-dd
  items: StokMap;
  // Perbaikan: Mengubah 'createdAt' menjadi 'created_at' untuk konsistensi.
  created_at: string; // ISO datetime
};

const LS_KEY = "stokKueFafifa_entries_v1";

export function loadEntries(): StokEntry[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return [];
    // Dalam kasus data lama di localStorage masih menggunakan 'createdAt', 
    // kita melakukan konversi sederhana di sini untuk menghindari kegagalan parsing.
    const parsedEntries = JSON.parse(raw);
    
    // Ini adalah langkah opsional tapi aman untuk migrasi data lama
    const normalizedEntries = parsedEntries.map((entry: any) => ({
        ...entry,
        created_at: entry.created_at || entry.createdAt, // Prioritaskan created_at
    })) as StokEntry[];

    return normalizedEntries;

  } catch {
    return [];
  }
}

export function saveEntries(entries: StokEntry[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(entries));
}

export function addEntry(entry: StokEntry) {
  const entries = loadEntries();
  entries.unshift(entry); // newest first
  saveEntries(entries);
}

export function deleteEntry(id: number) {
  const entries = loadEntries().filter((e) => e.id !== id);
  saveEntries(entries);
}