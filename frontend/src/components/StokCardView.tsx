// Lokasi: src/components/StokCardView.tsx

import React, { useState, useEffect } from 'react'; 
import { Edit2, Trash2, Plus } from "lucide-react"; 
import { StokItem } from '../types/StokItem'; 
import { getHari, formatTanggalID } from '../utils/dateUtils'; 
import InputSisaModal from './InputSisaModal'; 
// 🎯 Import modal baru (ANDA HARUS MEMBUAT FILE INI)
import InputRusakModal from './InputRusakModal'; 

// ASUMSI: StokItem yang diperluas untuk menyimpan total sisa
type StokItemWithSisa = StokItem & { totalSisa?: number, totalRusak?: number }; // 🎯 Tambah state untuk totalRusak

interface StokCardViewProps {
    filteredData: StokItem[];
    handleEdit: (id: number) => void;
    handleDelete: (id: number) => void;
}

// Fungsi untuk menghitung total stok
const calculateTotal = (item: StokItem): number => {
    return (
        item.boluKukus +
        item.rotiGabin +
        item.pastel +
        item.martabakTelur +
        item.moci
    );
};

const StokCardView: React.FC<StokCardViewProps> = ({ filteredData, handleEdit, handleDelete }) => {
    
    const [stokItems, setStokItems] = useState<StokItemWithSisa[]>(filteredData);

    // Menggabungkan data sisa yang sudah ada dengan data filteredData yang baru setelah Edit
    useEffect(() => {
        setStokItems(prevItems => {
            return filteredData.map(newItem => {
                const existingItem = prevItems.find(item => item.id === newItem.id);
                
                return {
                    ...newItem,
                    totalSisa: existingItem?.totalSisa || 0,
                    totalRusak: existingItem?.totalRusak || 0, // 🎯 Inisialisasi totalRusak
                } as StokItemWithSisa;
            });
        });
    }, [filteredData]);
    
    // STATE untuk Modal Sisa
    const [isSisaModalOpen, setIsSisaModalOpen] = useState(false);
    const [sisaToInput, setSisaToInput] = useState<(StokItem & { sisaHariSebelumnya: number }) | null>(null);

    // 🎯 STATE BARU untuk Modal Rusak/Dimakan
    const [isRusakModalOpen, setIsRusakModalOpen] = useState(false);
    const [rusakToInput, setRusakToInput] = useState<StokItem | null>(null);
    // ------------------------------------

    // FUNGSI UTAMA UNTUK MEMBUKA MODAL SISA
    const handleSisaClick = (item: StokItem, sisaHariSebelumnya: number) => {
        setSisaToInput({ ...item, sisaHariSebelumnya: sisaHariSebelumnya });
        setIsSisaModalOpen(true);
    };

    const handleCloseSisaModal = () => {
        setIsSisaModalOpen(false);
        setSisaToInput(null);
    };
    
    // 🎯 FUNGSI BARU untuk membuka Modal Rusak/Dimakan
    const handleLainnyaClick = (item: StokItem) => {
        setRusakToInput(item);
        setIsRusakModalOpen(true);
    };

    const handleCloseRusakModal = () => {
        setIsRusakModalOpen(false);
        setRusakToInput(null);
    };

    // 🎯 FUNGSI BARU untuk menyimpan data Rusak/Dimakan
    const handleSaveRusak = (dataRusak: { id: number, rusak: Record<keyof StokItem, number> }) => {
        
        const totalSavedRusak = Object.values(dataRusak.rusak).reduce((sum, current) => sum + current, 0);

        setStokItems(prevItems => prevItems.map(item => {
            if (item.id === dataRusak.id) {
                const updatedItem = { ...item };
                
                (updatedItem as any).totalRusak = totalSavedRusak; // Simpan totalRusak
                
                return updatedItem;
            }
            return item;
        }));

        handleCloseRusakModal();
    };
    // ------------------------------------

    // FUNGSI PENYIMPANAN SISA
    const handleSaveSisa = (dataSisa: { id: number, sisa: Record<keyof StokItem, number> }) => {
        
        const totalSavedSisa = Object.values(dataSisa.sisa).reduce((sum, current) => sum + current, 0);

        setStokItems(prevItems => prevItems.map(item => {
            if (item.id === dataSisa.id) {
                const updatedItem = { ...item };
                
                (updatedItem as any).totalSisa = totalSavedSisa;
                
                return updatedItem;
            }
            return item;
        }));

        handleCloseSisaModal();
    };

    if (stokItems.length === 0) {
        return (
            <div className="p-4 bg-white rounded-lg shadow-md text-center text-gray-500 sm:hidden">
                Tidak ada data stok pada bulan ini.
            </div>
        );
    }

    return (
        <div className="sm:hidden p-0 px-2"> 
            
            {stokItems.map((item, index) => {
                
                // AMBIL DATA ITEM TANGGAL SEBELUMNYA
                const nextItem = stokItems[index + 1];
                const sisaHariSebelumnya = nextItem?.totalSisa || 0;
                // ---------------------------------------------

                const cardClasses = `rounded-lg shadow-md border border-gray-200 
                                     relative z-10 bg-white hover:shadow-lg transition-all 
                                     w-full mb-2`; 
                
                const totalStokAwal = calculateTotal(item);
                
                const totalSisaYangTersimpan = item.totalSisa || 0; 
                const totalRusakYangTersimpan = item.totalRusak || 0; // 🎯 Ambil data Rusak
                const totalStokBersih = totalStokAwal - totalSisaYangTersimpan + sisaHariSebelumnya - totalRusakYangTersimpan; // 🎯 Hitung Stok Bersih

                
                return (
                    <div key={item.id} className={cardClasses}>
                        
                        {/* HEADER - Tetap Rose untuk identifikasi hari */}
                        <div className="p-3 bg-gradient-to-r from-rose-200 to-rose-300 rounded-t-lg flex justify-between items-center">
                            <p className="font-semibold text-gray-800 text-sm">
                                {getHari(item.tanggal)} - {formatTanggalID(item.tanggal)}
                            </p>
                            
                            <button
                                onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                                className="p-1 bg-rose-500 text-white rounded-full hover:bg-rose-600 transition-colors shadow-sm"
                                aria-label={`Hapus stok tanggal ${item.tanggal}`}
                            >
                                <Trash2 size={16} />
                            </button>

                        </div>

                        {/* Konten Detail Kue */}
                        <div className="p-3 mt-0 text-xs text-gray-600 space-y-1 rounded-b-lg">
                            <p>Bolu Kukus: <span className="font-medium text-gray-800">{item.boluKukus}</span></p>
                            <p>Roti Gabin: <span className="font-medium text-gray-800">{item.rotiGabin}</span></p>
                            <p>Pastel: <span className="font-medium text-gray-800">{item.pastel}</span></p>
                            <p>Martabak Telur: <span className="font-medium text-gray-800">{item.martabakTelur}</span></p>
                            <p>Moci: <span className="font-medium text-gray-800">{item.moci}</span></p>
                            
                            <div className="pt-2 mt-2 border-t border-gray-200 space-y-1"> 
                                
                                {/* 1. TOTAL (Dulu TOTAL STOK AWAL) - 🎯 Label diubah, Icon diubah ke Pink */}
                                <div className="text-xs font-bold text-gray-900 flex justify-between items-center bg-rose-100 px-2 py-0.5 rounded-md shadow-inner">
                                    
                                    {/* KIRI: Tombol Edit dan Judul */}
                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleEdit(item.id); }}
                                            // 🎯 Warna Icon diubah ke Pink
                                            className="p-1 bg-pink-500 text-white rounded-full hover:bg-pink-600 transition-colors shadow-sm"
                                            aria-label={`Edit stok tanggal ${item.tanggal}`}
                                        >
                                            <Edit2 size={14} />
                                        </button>
                                        {/* 🎯 Label diubah menjadi TOTAL */}
                                        <span>TOTAL:</span>
                                    </div>

                                    {/* KANAN: Nilai Stok */}
                                    <span className="text-base">{totalStokAwal}</span> 
                                </div>
                                
                                {/* 2. SISA (Dulu TOTAL SISA) - 🎯 Label diubah */}
                                {(totalSisaYangTersimpan >= 0 || totalStokAwal > 0) && (
                                    <div className="text-xs font-bold text-gray-900 flex justify-between items-center bg-blue-100 px-2 py-0.5 rounded-md">
                                        
                                        {/* KIRI: Tombol Sisa (ikon Edit2) dan Judul */}
                                        <div className="flex items-center space-x-2">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleSisaClick(item, sisaHariSebelumnya); }}
                                                className="p-1 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors shadow-sm"
                                                aria-label={`Input sisa stok tanggal ${item.tanggal}`}
                                            >
                                                <Edit2 size={14} /> 
                                            </button>
                                            {/* 🎯 Label diubah menjadi SISA */}
                                            <span className="text-blue-700">SISA:</span>
                                        </div>

                                        {/* KANAN: Nilai Sisa */}
                                        <span className="text-base text-blue-700">-{totalSisaYangTersimpan}</span> 
                                    </div>
                                )}
                                
                                {/* 3. SISA KUE SEBELUMNYA */}
                                {nextItem && sisaHariSebelumnya >= 0 && ( 
                                    <div className="text-xs font-bold text-gray-900 flex justify-between items-center bg-green-100 px-2 py-0.5 rounded-md">
                                        <div className="flex items-center space-x-2">
                                            <button
                                                onClick={(e) => { 
                                                    e.stopPropagation(); 
                                                    const sisaNextBefore = stokItems[index + 2]?.totalSisa || 0;
                                                    handleSisaClick(nextItem, sisaNextBefore);
                                                }}
                                                className="p-1 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors shadow-sm"
                                                aria-label={`Edit sisa stok tanggal ${nextItem.tanggal}`}
                                            >
                                                <Edit2 size={14} /> 
                                            </button>
                                            <span className="text-green-700">SISA KUE SEBELUMNYA:</span>
                                        </div>
                                        <span className="text-base text-green-700">{sisaHariSebelumnya}</span>
                                    </div>
                                )}
                                
                                {/* 4. LAINNYA (Dulu LAINNYA (Rusak/Dimakan)) - 🎯 Label diubah */}
                                <div className="text-xs font-bold text-gray-900 flex justify-between items-center bg-yellow-100 px-2 py-0.5 rounded-md">
                                    <div className="flex items-center space-x-2">
                                        {/* IKON TAMBAH memanggil handleLainnyaClick */}
                                        <button
                                            onClick={(e) => { 
                                                e.stopPropagation(); 
                                                handleLainnyaClick(item); // Panggil fungsi yang membuka modal rusak
                                            }}
                                            className="p-1 bg-yellow-500 text-white rounded-full hover:bg-yellow-600 transition-colors shadow-sm"
                                            aria-label={`Input Kue Rusak/Dimakan untuk stok tanggal ${item.tanggal}`}
                                        >
                                            <Plus size={14} /> 
                                        </button>
                                        {/* 🎯 Label diubah menjadi LAINNYA */}
                                        <span className="text-yellow-700">LAINNYA:</span>
                                    </div>
                                    {/* Menampilkan total Kue Rusak/Dimakan */}
                                    <span className="text-base text-yellow-700">-{totalRusakYangTersimpan}</span> 
                                </div>


                                {/* 5. TOTAL STOK BERSIH */}
                                {(totalSisaYangTersimpan >= 0 || totalStokAwal > 0) && (
                                    <div className="text-xs font-bold text-white flex justify-between items-center bg-indigo-600 px-2 py-0.5 rounded-md">
                                        <span>STOK BERSIH:</span>
                                        <span className="text-base">{totalStokBersih}</span> 
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })}
            
            {/* MODAL INPUT SISA */}
            {isSisaModalOpen && sisaToInput && (
                <InputSisaModal
                    stokData={sisaToInput} // Di sini sudah termasuk sisaHariSebelumnya
                    onClose={handleCloseSisaModal}
                    onSave={handleSaveSisa} 
                />
            )}

            {/* 🎯 MODAL INPUT RUSAK/DIMAKAN */}
            {isRusakModalOpen && rusakToInput && (
                <InputRusakModal
                    stokData={rusakToInput} // Item stok hari ini
                    onClose={handleCloseRusakModal}
                    onSave={handleSaveRusak} 
                />
            )}
        </div>
    );
};

export default StokCardView;