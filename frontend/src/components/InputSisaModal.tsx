// Lokasi: src/components/InputSisaModal.tsx

import React, { useState, useMemo, useRef, useEffect } from 'react'; 
import { StokItem } from '../types/StokItem'; 
import { X, Save, List, Hash } from 'lucide-react'; 
import { formatTanggalID } from '../utils/dateUtils'; 

interface InputSisaModalProps {
    stokData: StokItem;
    onClose: () => void;
    onSave: (dataSisa: { id: number, sisa: Record<keyof StokItem, number> }) => void;
}

// 🎯 FUNGSI UTILITY (FILTER KETAT TERSIMPAN)
const getKueKeys = (data: StokItem) => {
    // Memfilter Kunci: Hanya ambil properti yang bertipe number dan bukan data kontrol.
    // Mengabaikan properti yang mengandung kata 'total', 'rusak', atau 'sisa'/'sebelumnya'.
    return (Object.keys(data) as (keyof StokItem)[]).filter(key => {
        const keyLower = String(key).toLowerCase();
        return (
            key !== 'id' && 
            key !== 'tanggal' && 
            key !== 'mod' && 
            !keyLower.includes('total') &&       // Hapus totalSisa, totalRusak
            !keyLower.includes('rusak') &&       // Hapus properti rusak jika ada
            !keyLower.includes('sisa') &&        // Hapus sisaKueSebelumnya
            !keyLower.includes('sebelumnya') &&  // Hapus sisaKueSebelumnya
            typeof data[key as keyof StokItem] === 'number'
        );
    }) as (keyof StokItem)[];
}
// -------------------------------------------------------------

// Fungsi untuk mengubah nama properti menjadi label yang mudah dibaca
const getLabel = (key: keyof StokItem): string => {
    switch (key) {
        case 'boluKukus': return 'Bolu Kukus';
        case 'rotiGabin': return 'Roti Gabin';
        case 'pastel': return 'Pastel';
        case 'martabakTelur': return 'Martabak Telur';
        case 'moci': return 'Moci';
        default: return key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    }
};

const InputSisaModal: React.FC<InputSisaModalProps> = ({ stokData, onClose, onSave }) => {
    
    const kueKeys = getKueKeys(stokData); 
    const totalStokAwal = useMemo(() => kueKeys.reduce((total, key) => total + stokData[key] as number, 0), [stokData, kueKeys]);
    
    const [inputMode, setInputMode] = useState<'detail' | 'manual'>('detail');

    const [containerHeight, setContainerHeight] = useState('auto');
    const detailRef = useRef<HTMLDivElement>(null);
    const manualRef = useRef<HTMLDivElement>(null);

    // 1. State Rincian (Mode Detail)
    const initialSisa = kueKeys.reduce((acc, key) => {
        acc[key] = 0; 
        return acc;
    }, {} as Record<keyof StokItem, number>);
    const [sisaData, setSisaData] = useState<Record<keyof StokItem, number>>(initialSisa);

    // 2. State Manual (Mode Manual)
    const [totalSisaManual, setTotalSisaManual] = useState<number>(0);

    // HITUNG TOTAL SISA OTOMATIS MENGGUNAKAN useMemo
    const totalSisaOtomatis = useMemo(() => {
        return kueKeys.reduce((total, key) => total + sisaData[key], 0);
    }, [sisaData, kueKeys]);

    // Efek untuk menyesuaikan tinggi kontainer utama
    useEffect(() => {
        if (inputMode === 'detail' && detailRef.current) {
            setContainerHeight(`${detailRef.current.offsetHeight}px`);
        } else if (inputMode === 'manual' && manualRef.current) {
            setContainerHeight(`${manualRef.current.offsetHeight}px`);
        }
    }, [inputMode, sisaData]); 
    
    // Handler Mode Detail
    const handleChangeDetail = (e: React.ChangeEvent<HTMLInputElement>, key: keyof StokItem) => {
        const rawValue = e.target.value;
        const value = parseInt(rawValue) || 0;
        
        const maxStok = stokData[key] as number;
        const finalValue = Math.min(Math.max(0, value), maxStok); 

        setSisaData(prev => ({
            ...prev,
            [key]: finalValue,
        }));
    };
    
    // Handler Mode Manual
    const handleChangeManual = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value) || 0;
        const finalValue = Math.min(Math.max(0, value), totalStokAwal);
        setTotalSisaManual(finalValue);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        let sisaToSend: Record<keyof StokItem, number>;

        if (inputMode === 'manual') {
            sisaToSend = kueKeys.reduce((acc, key, index) => {
                acc[key] = index === 0 ? totalSisaManual : 0;
                return acc;
            }, {} as Record<keyof StokItem, number>);

        } else {
            sisaToSend = sisaData;
        }
        
        onSave({
            id: stokData.id,
            sisa: sisaToSend, 
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-1" onClick={onClose}> 
            <div 
                className="bg-white rounded-lg shadow-xl max-w-full w-[85%] sm:max-w-sm max-h-[85vh] flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                
                {/* HEADER - Warna Blue Soft */}
                <div className="p-2 border-b flex justify-between items-center bg-blue-500 text-white rounded-t-lg flex-shrink-0">
                    <h2 className="text-xs font-bold sm:text-lg">Input Sisa - {formatTanggalID(stokData.tanggal)}</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-white/20 transition-all">
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto p-3 space-y-3"> 
                    
                    {/* TOTAL STOK AWAL - Warna Blue Soft Light */}
                    <div className="p-2 bg-blue-100 rounded-md text-center text-sm font-semibold text-gray-800">
                        TOTAL STOK AWAL: {totalStokAwal}
                    </div>
                    
                    {/* TOMBOL MODE - Warna Blue Soft */}
                    <div className='flex justify-center space-x-2 p-1 border-b border-gray-200 mb-4'>
                        <button 
                            type="button"
                            onClick={() => setInputMode('detail')}
                            className={`flex items-center space-x-1 px-3 py-1 text-xs rounded-full transition-colors ${
                                inputMode === 'detail' ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-200 text-gray-700'
                            }`}
                        >
                            <List size={14} /> <span>Mode Rincian</span>
                        </button>
                        <button 
                            type="button"
                            onClick={() => setInputMode('manual')}
                            className={`flex items-center space-x-1 px-3 py-1 text-xs rounded-full transition-colors ${
                                inputMode === 'manual' ? 'bg-sky-600 text-white shadow-md' : 'bg-gray-200 text-gray-700' // Menggunakan Sky untuk kontras mode manual
                            }`}
                        >
                            <Hash size={14} /> <span>Mode Manual</span>
                        </button>
                    </div>

                    <div 
                        className="relative overflow-hidden transition-all duration-500" 
                        style={{ height: containerHeight }}
                    >

                        {/* MODE RINCIAN (DETAIL) */}
                        <div 
                            ref={detailRef}
                            className={`
                                w-full absolute top-0 transition-transform duration-500 ease-in-out
                                ${inputMode === 'detail' 
                                    ? 'translate-x-0' 
                                    : '-translate-x-full' 
                                }
                            `}
                        >
                            <div className='space-y-0'> 
                                {/* Border dan Background - Warna Blue Soft Light */}
                                <p className="text-xs text-gray-700 italic border-l-4 border-blue-500 pl-2 bg-blue-50 p-1 mb-2 rounded-sm">
                                    Masukkan jumlah sisa per jenis kue. Total dihitung otomatis.
                                </p>
                                {/* Filter sudah diterapkan di kueKeys */}
                                {kueKeys.map((key) => {
                                    const kueName = getLabel(key); 
                                    const displayValue = sisaData[key] === 0 ? '' : sisaData[key];

                                    return (
                                        <div key={key} className="flex justify-between items-center py-0 border-b border-gray-100"> 
                                            
                                            <label className="text-xs font-medium text-gray-700 w-3/5 pr-3 pl-1 py-0"> 
                                                {kueName} 
                                                <span className="text-gray-500 font-normal block"> (Stok Awal: {stokData[key] as number})</span>
                                            </label>
                                            
                                            <input
                                                type="number"
                                                name={key}
                                                value={displayValue} 
                                                onChange={(e) => handleChangeDetail(e, key)}
                                                // Warna Input - Warna Blue Soft Light
                                                className="block w-2/5 rounded-md border-gray-300 shadow-inner focus:border-blue-500 focus:ring-blue-500 p-1 text-xs text-right bg-blue-100 transition-colors" 
                                                min="0"
                                                max={stokData[key] as number} 
                                            />
                                        </div>
                                    );
                                })}
                                
                                {/* TOTAL SISA OTOMATIS - Warna Blue Soft Light */}
                                <div className="pt-2 mt-2 border-t border-gray-200">
                                    <div className="text-sm font-bold text-gray-900 flex justify-between items-center bg-blue-100 px-2 py-1 rounded-md shadow-inner">
                                        <span>TOTAL SISA OTOMATIS:</span>
                                        <span className="text-lg text-blue-600">{totalSisaOtomatis}</span> 
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        {/* MODE MANUAL */}
                        <div 
                            ref={manualRef}
                            className={`
                                w-full absolute top-0 transition-transform duration-500 ease-in-out
                                ${inputMode === 'manual' 
                                    ? 'translate-x-0' 
                                    : 'translate-x-full' 
                                }
                            `}
                        >
                            <div className="space-y-2">
                                {/* Border dan Background - Warna Sky Soft */}
                                <p className="text-xs text-gray-700 italic border-l-4 border-sky-600 pl-2 bg-sky-50 p-1 mb-2 rounded-sm">
                                    Masukkan langsung total sisa yang tercatat. Mode ini **TIDAK** menyimpan rincian per jenis kue.
                                </p>
                                <div>
                                    {/* Label - Warna Sky Dark */}
                                    <label className="block text-sm font-bold text-sky-700 mb-1">
                                        TOTAL SISA (Input Manual)
                                    </label>
                                    <input
                                        type="number"
                                        name="totalSisaManual"
                                        value={totalSisaManual === 0 ? '' : totalSisaManual}
                                        onChange={handleChangeManual}
                                        // Warna Input - Warna Sky Soft
                                        className="mt-0 block w-full rounded-md border-sky-500 shadow-inner focus:border-sky-700 focus:ring-sky-700 text-xl p-2 text-center font-bold bg-sky-100"
                                        min="0"
                                        max={totalStokAwal}
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                    </div>
                </form>

                {/* FOOTER */}
                <div className="flex justify-end gap-2 p-2 border-t flex-shrink-0 bg-gray-50 rounded-b-lg w-full">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-2 py-1 text-xs font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                    >
                        Batal
                    </button>
                    <button
                        type="submit"
                        onClick={handleSubmit} 
                        // Warna Tombol Simpan - Warna Blue Soft
                        className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors shadow-md"
                    >
                        <Save size={14} /> Simpan Sisa
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InputSisaModal;