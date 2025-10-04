// Lokasi: src/components/InputRusakModal.tsx

import React, { useState, useMemo, useRef, useEffect } from 'react'; 
import { StokItem } from '../types/StokItem'; 
import { X, Save, List, Hash } from 'lucide-react'; 
import { formatTanggalID } from '../utils/dateUtils'; 

// FUNGSI UTILITY HARUS DIDEKLARASIKAN DI SINI
const getKueKeys = (data: StokItem) => {
    // 🎯 Definisikan urutan kunci secara EKSPLISIT agar 'mod' (Kantong Kresek) selalu muncul 
    // tepat di bawah 'moci', terlepas dari nilai stok awalnya (stokData[key]).
    const orderedKeys: (keyof StokItem)[] = [
        'boluKukus', 
        'rotiGabin', 
        'pastel', 
        'martabakTelur', 
        'moci', 
        'mod' // 🎯 Inilah Lainnya (Kantong Kresek)
    ];

    // Filter untuk memastikan hanya kunci yang benar-benar ada di StokItem 
    // dan bertipe number yang digunakan, menjamin kompatibilitas.
    return orderedKeys.filter(key => typeof data[key as keyof StokItem] === 'number');
}
// -------------------------------------------------------------

interface InputRusakModalProps {
    stokData: StokItem;
    onClose: () => void;
    onSave: (dataRusak: { id: number, rusak: Record<keyof StokItem, number> }) => void;
}

const InputRusakModal: React.FC<InputRusakModalProps> = ({ stokData, onClose, onSave }) => {
    
    const kueKeys = getKueKeys(stokData); 
    // totalStokAwal dihitung hanya dari kue (tidak termasuk 'mod' / Kantong Kresek)
    const totalStokAwal = useMemo(() => {
        return kueKeys
            .filter(key => key !== 'mod')
            .reduce((total, key) => total + (stokData[key] as number), 0);
    }, [stokData, kueKeys]);
    
    const [inputMode, setInputMode] = useState<'detail' | 'manual'>('detail');
    const [containerHeight, setContainerHeight] = useState('auto');
    const detailRef = useRef<HTMLDivElement>(null);
    const manualRef = useRef<HTMLDivElement>(null);

    // 1. State Rincian (Mode Detail)
    const initialRusak = kueKeys.reduce((acc, key) => {
        // Gunakan nilai yang sudah ada di stokData jika sudah pernah disimpan, kalau tidak, mulai dari 0.
        // Asumsi: Jika data ini adalah modal edit, 'rusak' mungkin sudah ada. Kita asumsikan 0 untuk kasus ini 
        // karena ini adalah modal input RUSAK.
        acc[key] = 0; // Mulai dari 0
        return acc;
    }, {} as Record<keyof StokItem, number>);
    const [rusakData, setRusakData] = useState<Record<keyof StokItem, number>>(initialRusak);

    // 2. State Manual (Mode Manual)
    const [totalRusakManual, setTotalRusakManual] = useState<number>(0);

    // HITUNG TOTAL RUSAK OTOMATIS (Dipertahankan dan akan ditampilkan)
    const totalRusakOtomatis = useMemo(() => {
        return kueKeys.reduce((total, key) => total + rusakData[key], 0);
    }, [rusakData, kueKeys]);

    // Efek untuk menyesuaikan tinggi kontainer utama
    useEffect(() => {
        if (inputMode === 'detail' && detailRef.current) {
            setContainerHeight(`${detailRef.current.offsetHeight}px`);
        } else if (inputMode === 'manual' && manualRef.current) {
            setContainerHeight(`${(manualRef.current.offsetHeight) + 16}px`); 
        }
    }, [inputMode, rusakData, totalRusakManual]); 
    
    // Handler Mode Detail
    const handleChangeDetail = (e: React.ChangeEvent<HTMLInputElement>, key: keyof StokItem) => {
        const rawValue = e.target.value;
        const value = parseInt(rawValue) || 0;
        
        // Batasan stok hanya berlaku untuk jenis kue, BUKAN untuk 'mod' (Kantong Kresek)
        let finalValue = Math.max(0, value);

        if (key !== 'mod') {
            const maxStok = stokData[key] as number;
            finalValue = Math.min(finalValue, maxStok); 
        }
        
        setRusakData(prev => ({
            ...prev,
            [key]: finalValue,
        }));
    };
    
    // Handler Mode Manual
    const handleChangeManual = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value) || 0;
        const finalValue = Math.min(Math.max(0, value), totalStokAwal);
        setTotalRusakManual(finalValue);
    };

    // Fungsi untuk mengubah nama properti menjadi label yang mudah dibaca
    const getLabel = (key: keyof StokItem): string => {
        switch (key) {
            case 'boluKukus': return 'Bolu Kukus';
            case 'rotiGabin': return 'Roti Gabin';
            case 'pastel': return 'Pastel';
            case 'martabakTelur': return 'Martabak Telur';
            case 'moci': return 'Moci';
            // 🎯 LABEL BARU DENGAN JUDUL YANG DIMINTA
            case 'mod': return 'Lainnya (Kantong Kresek)';
            default: return key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
        }
    };


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        let rusakToSend: Record<keyof StokItem, number>;

        if (inputMode === 'manual') {
            // Simpan total manual ke 'mod' (Kantong Kresek) dan sisanya 0
            rusakToSend = kueKeys.reduce((acc, key) => {
                if (key === 'mod') { 
                    acc[key] = totalRusakManual;
                } else {
                    acc[key] = 0;
                }
                return acc;
            }, {} as Record<keyof StokItem, number>);

        } else {
            rusakToSend = rusakData;
        }
        
        onSave({
            id: stokData.id,
            rusak: rusakToSend, 
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-1" onClick={onClose}> 
            <div 
                className="bg-white rounded-lg shadow-xl max-w-full w-[85%] sm:max-w-sm max-h-[85vh] flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                
                {/* HEADER - Warna Soft Amber */}
                <div className="p-2 border-b flex justify-between items-center bg-amber-500 text-white rounded-t-lg flex-shrink-0">
                    <h2 className="text-xs font-bold sm:text-lg">Input Rusak/Dimakan - {formatTanggalID(stokData.tanggal)}</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-white/20 transition-all">
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto p-3 space-y-3"> 
                    
                    {/* TOTAL STOK AWAL - Warna Orange yang Selaras */}
                    <div className="p-2 bg-orange-100 rounded-md text-center text-sm font-semibold text-gray-800">
                        TOTAL STOK AWAL (Kue): {totalStokAwal}
                    </div>
                    
                    {/* TOMBOL MODE */}
                    <div className='flex justify-center space-x-2 p-1 border-b border-gray-200 mb-4'>
                        <button 
                            type="button"
                            onClick={() => setInputMode('detail')}
                            className={`flex items-center space-x-1 px-3 py-1 text-xs rounded-full transition-colors ${
                                inputMode === 'detail' ? 'bg-amber-600 text-white shadow-md' : 'bg-gray-200 text-gray-700'
                            }`}
                        >
                            <List size={14} /> <span>Mode Rincian</span>
                        </button>
                        <button 
                            type="button"
                            onClick={() => setInputMode('manual')}
                            className={`flex items-center space-x-1 px-3 py-1 text-xs rounded-full transition-colors ${
                                inputMode === 'manual' ? 'bg-orange-600 text-white shadow-md' : 'bg-gray-200 text-gray-700'
                            }`}
                        >
                            <Hash size={14} /> <span>Mode Manual</span>
                        </button>
                    </div>

                    {/* CONTAINER INPUT (Sliding Effect) */}
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
                                <p className="text-xs text-gray-700 italic border-l-4 border-amber-500 pl-2 bg-amber-50 p-1 mb-2 rounded-sm">
                                    Masukkan jumlah **rusak/dimakan** per jenis kue.
                                </p>
                                {kueKeys.map((key) => {
                                    const displayValue = rusakData[key] === 0 ? '' : rusakData[key];
                                    
                                    // 🎯 Tentukan apakah ini baris Lainnya (Kantong Kresek)
                                    const isModRow = key === 'mod';

                                    return (
                                        <div key={key} className="flex justify-between items-center py-0 border-b border-gray-100"> 
                                            
                                            <label className="text-xs font-medium text-gray-700 w-3/5 pr-3 pl-1 py-0"> 
                                                {getLabel(key)} 
                                            {/* Hanya tampilkan Stok Awal jika BUKAN Kantong Kresek */}
                                                {!isModRow && 
                                                    <span className="text-gray-500 font-normal block"> (Stok Awal: {stokData[key] as number})</span>
                                                }
                                            </label>
                                            
                                            <input
                                                type="number"
                                                name={key}
                                                value={displayValue} 
                                                onChange={(e) => handleChangeDetail(e, key)}
                                            // Warna input untuk 'mod' diubah agar menonjol
                                                className={`block w-2/5 rounded-md border-gray-300 shadow-inner focus:ring-amber-500 p-1 text-xs text-right transition-colors ${
                                                isModRow
                                                    ? 'bg-yellow-200 border-yellow-500 focus:border-yellow-700 font-bold' 
                                                    : 'bg-amber-100 border-amber-500 focus:border-amber-500'
                                                }`} 
                                                min="0"
                                            // Batas maksimal hanya untuk jenis kue
                                                max={!isModRow ? (stokData[key] as number) : undefined} 
                                            />
                                        </div>
                                    );
                                })}
                                
                                {/* 🎯 TOTAL RUSAK OTOMATIS DITAMPILKAN KEMBALI */}
                                <div className="pt-2 mt-2 border-t border-gray-200">
                                    <div className="text-sm font-bold text-gray-900 flex justify-between items-center bg-orange-100 px-2 py-1 rounded-md shadow-inner">
                                        <span>TOTAL RUSAK OTOMATIS:</span>
                                        <span className="text-lg text-orange-600">{totalRusakOtomatis}</span> 
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
                                <p className="text-xs text-gray-700 italic border-l-4 border-orange-600 pl-2 bg-orange-50 p-1 mb-2 rounded-sm">
                                    Masukkan langsung **total** kue rusak/dimakan.
                                </p>
                                <div>
                                    <input
                                        type="number"
                                        name="totalRusakManual"
                                        value={totalRusakManual === 0 ? '' : totalRusakManual}
                                        onChange={handleChangeManual}
                                        className="mt-0 block w-full rounded-md border-orange-500 shadow-inner focus:border-orange-700 focus:ring-orange-700 text-xl p-2 text-center font-bold bg-orange-100"
                                        min="0"
                                        max={totalStokAwal}
                                        required
                                        placeholder="Masukkan Total Rusak/Dimakan"
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
                        className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-white bg-amber-600 rounded-md hover:bg-amber-700 transition-colors shadow-md"
                    >
                        <Save size={14} /> Simpan Rusak
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InputRusakModal;