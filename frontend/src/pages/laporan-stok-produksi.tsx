// Lokasi: src/pages/LaporanStokProduksi.tsx

import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { FileSpreadsheet, FileDown } from "lucide-react"; 
import StokCardView from "../components/StokCardView"; 
import StokTableView from "../components/StokTableView"; 
import EditStokModal from "../components/EditStokModal"; 
import { StokItem } from '../types/StokItem'; 
import { getHari } from '../utils/dateUtils'; 

const API_URL = "http://localhost:8000/api/stok/"; 

export default function LaporanStokProduksi({ externalData }: { externalData?: StokItem[] }) {
    const [data, setData] = useState<StokItem[]>([]);
    const [error, setError] = useState("");
    const [bulan, setBulan] = useState<number>(new Date().getMonth() + 1);
    const [tahun, setTahun] = useState<number>(new Date().getFullYear());

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [stokToEdit, setStokToEdit] = useState<StokItem | null>(null);

    const fetchData = useCallback(async () => {
        if (externalData) {
            setData(externalData);
            return;
        }
        try {
            const res = await axios.get(API_URL);
            setData(res.data.data); 
            setError("");
        } catch (err) {
            setError("❌ Gagal ambil data stok dari server.");
        }
    }, [externalData]);

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setStokToEdit(null);
        fetchData(); 
    };

    const handleEdit = async (id: number) => {
        try {
            const res = await axios.get(`${API_URL}${id}`); 
            const dataStok: StokItem = res.data; 
            
            setStokToEdit(dataStok);
            setIsModalOpen(true); 
            
        } catch (error) {
            alert(`❌ Gagal mengambil data ID ${id} untuk diedit. Pastikan endpoint GET tunggal sudah benar.`);
            console.error("Error fetching stok for edit:", error);
        }
    };

    const handleUpdateStok = async (updatedData: StokItem) => {
        try {
            await axios.put(`${API_URL}${updatedData.id}`, updatedData); 
            
            alert(`✅ Stok ID ${updatedData.id} berhasil diperbarui.`);
            handleCloseModal(); 
            
        } catch (error) {
            alert(`❌ Gagal memperbarui stok ID ${updatedData.id}.`);
            console.error("Error updating stok:", error);
        }
    };

    const handleDelete = async (id: number): Promise<void> => {
        if (window.confirm(`❓ Yakin hapus data stok ID ${id}? Aksi ini akan menghapus data permanen di database.`)) {
            try {
                await axios.delete(`${API_URL}${id}`); 
                alert(`✅ Stok ID ${id} berhasil dihapus dari database.`);
                fetchData(); 
            } catch (error) {
                alert(`❌ Gagal menghapus stok ID ${id}. Pastikan server aktif dan endpoint DELETE sudah benar.`);
                console.error("Error deleting stok:", error);
            }
        }
    };
    
    useEffect(() => {
        fetchData();
    }, [fetchData]); 

    const filteredData = data.filter((item) => {
        const d = new Date(item.tanggal + 'T00:00:00'); 
        return d.getMonth() + 1 === bulan && d.getFullYear() === tahun;
    });

    const bulanList = [
        "Januari","Februari","Maret","April","Mei","Juni",
        "Juli","Agustus","September","Oktober","November","Desember"
    ];

    const tahunSekarang = new Date().getFullYear();
    const tahunList = [tahunSekarang - 1, tahunSekarang, tahunSekarang + 1];

    const handleExportExcel = () => {
        alert(`Export Excel untuk ${bulanList[bulan - 1]} ${tahun}`);
    };

    const handleExportPDF = () => {
        alert(`Export PDF untuk ${bulanList[bulan - 1]} ${tahun}`);
    };


    return (
        // Container utama harus memiliki tinggi penuh dan flex-col
        <div className="flex flex-col h-[calc(100vh-48px)] bg-gray-50"> 
            
            {/* Header Utama (Sudah sticky, z-20) */}
            <header className="relative bg-gradient-to-r from-pink-300 via-rose-300 to-rose-400 text-white shadow-md px-4 sm:px-6 py-3 flex justify-between items-center rounded-b-2xl z-20">
                <h2 className="text-lg font-bold">Laporan Stok Produksi</h2>
            </header>
            
            {/* 🎯 Container Filter: STICKY TOP-0 & Z-INDEX */}
            <div className="sticky top-0 z-10 bg-gray-50 px-2 md:px-4 py-3 shadow-md"> 
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-2 bg-white rounded-lg shadow-sm">
                    
                    {/* Filter Dropdowns */}
                    <div className="flex flex-wrap gap-2">
                        <select
                            value={bulan}
                            onChange={(e) => setBulan(Number(e.target.value))}
                            className="border border-gray-300 rounded-md px-2 py-1 text-sm transition duration-300 hover:border-rose-400 focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                        >
                            {bulanList.map((nama, idx) => (
                                <option key={idx} value={idx + 1}>
                                    {nama}
                                </option>
                            ))}
                        </select>

                        <select
                            value={tahun}
                            onChange={(e) => setTahun(Number(e.target.value))}
                            className="border border-gray-300 rounded-md px-2 py-1 text-sm transition duration-300 hover:border-rose-400 focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                        >
                            {tahunList.map((t) => (
                                <option key={t} value={t}>
                                    {t}
                                </option>
                            ))}
                        </select>
                    </div>
                    
                    {/* Tombol Export */}
                    <div className="flex gap-2">
                        <button
                            onClick={handleExportExcel}
                            className="flex items-center gap-1 px-3 py-2 rounded-lg bg-indigo-500 text-white text-sm font-medium hover:bg-indigo-600 transition duration-300 transform hover:scale-105 active:scale-95 shadow-md hover:shadow-lg"
                        >
                            <FileSpreadsheet size={16} /> Excel
                        </button>
                        <button
                            onClick={handleExportPDF}
                            className="flex items-center gap-1 px-3 py-2 rounded-lg bg-rose-500 text-white text-sm font-medium hover:bg-rose-600 transition duration-300 transform hover:scale-105 active:scale-95 shadow-md hover:shadow-lg"
                        >
                            <FileDown size={16} /> PDF
                        </button>
                    </div>
                </div>
            </div>

            {/* Container Konten Data: flex-1 dan overflow-y-auto */}
            <div className="flex-1 overflow-y-auto px-2 md:px-4 py-4">
                
                {error && <p className="text-red-600 p-2">{error}</p>}

                {!error && (
                    <div className="space-y-4">
                        <StokCardView 
                            filteredData={filteredData}
                            handleEdit={handleEdit}
                            handleDelete={handleDelete}
                        />
                        <StokTableView 
                            filteredData={filteredData}
                            handleEdit={handleEdit}
                            handleDelete={handleDelete}
                        />
                    </div>
                )}
            </div>
            
            {/* Modal Edit */}
            {isModalOpen && stokToEdit && (
                <EditStokModal
                    stokData={stokToEdit}
                    onClose={handleCloseModal}
                    onSave={handleUpdateStok}
                />
            )}
        </div>
    );
}