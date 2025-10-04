import { StokResponse } from "../types/stok";

// Ambil semua data stok (API GET)
export const getStokList = async (
  startDate?: string,
  endDate?: string
): Promise<StokResponse[]> => {
  // Gunakan endpoint proxy agar bebas CORS saat development
  let url = "/api/stok";
  const params = new URLSearchParams();

  if (startDate) params.append("start_date", startDate);
  if (endDate) params.append("end_date", endDate);
  if (params.toString()) url += `?${params.toString()}`;

  try {
    const res = await fetch(url);
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Gagal mengambil data stok: ${errorText}`);
    }
    return await res.json();
  } catch (err) {
    console.error("❌ Error fetch stok:", err);
    throw new Error("Gagal koneksi ke server atau respons tidak valid");
  }
};