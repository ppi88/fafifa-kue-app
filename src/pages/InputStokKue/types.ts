export interface StokMap {
  [key: string]: number;
}
export interface StokEntry {
  id: number;
  tanggal: string;
  items: StokMap;
  createdAt: string;
}