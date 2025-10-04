import { StokResponse } from "../types/stok";

// API untuk ambil stok dengan filter opsional
export const getStokList = async (
  startDate?: string,
  endDate?: string
): Promise<StokResponse[]> => {
  let url = "http://localhost:8000/stok";
  const params = new URLSearchParams();
  if (startDate) params.append("start_date", startDate);
  if (endDate) params.append("end_date", endDate);
  if (params.toString()) url += `?${params.toString()}`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error("Gagal mengambil data stok");
  }
  return res.json();
};