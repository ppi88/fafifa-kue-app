// src/utils/storage.ts
export type StokMap = Record<string, number>;

export type StokEntry = {
  id: number; // timestamp
  tanggal: string; // ISO yyyy-mm-dd
  items: StokMap;
  createdAt: string; // ISO datetime
};

const LS_KEY = "stokKueFafifa_entries_v1";

export function loadEntries(): StokEntry[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as StokEntry[];
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
