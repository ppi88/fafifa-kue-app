// src/utils/dateUtils.ts

/**
 * Mengubah format tanggal 'YYYY-MM-DD' menjadi 'DD Bulan YYYY' (Indonesia).
 * @param dateString Tanggal dalam format YYYY-MM-DD (misal: '2025-10-03').
 * @returns Tanggal dalam format DD Bulan YYYY (misal: '03 Oktober 2025').
 */
export const formatTanggalID = (dateString: string): string => {
    // Menggunakan T00:00:00 untuk penanganan timezone yang konsisten
    const date = new Date(dateString + 'T00:00:00'); 
    
    // Daftar nama bulan dalam Bahasa Indonesia
    const bulanList = [
        "Januari", "Februari", "Maret", "April", "Mei", "Juni",
        "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];

    // Ambil komponen tanggal
    const tanggal = date.getDate().toString().padStart(2, '0'); // DD
    const bulan = bulanList[date.getMonth()]; // Bulan
    const tahun = date.getFullYear(); // YYYY

    return `${tanggal} ${bulan} ${tahun}`;
};

/**
 * Mendapatkan nama hari dalam Bahasa Indonesia dari string tanggal.
 * @param dateString Tanggal dalam format YYYY-MM-DD.
 * @returns Nama hari (misal: 'Jumat').
 */
export const getHari = (dateString: string): string => {
    // Menggunakan T00:00:00 untuk penanganan timezone yang konsisten
    const date = new Date(dateString + 'T00:00:00');
    const hariList = [
        "Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"
    ];
    return hariList[date.getDay()];
};