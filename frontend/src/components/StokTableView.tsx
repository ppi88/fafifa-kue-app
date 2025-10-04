// Lokasi: src/components/StokTableView.tsx

import React, { useState, useMemo } from 'react'; 
import ActionButtons from './ActionButtons';
import { StokItem } from '../types/StokItem'; 
import { getHari, formatTanggalID } from '../utils/dateUtils'; 

interface StokTableViewProps {
  filteredData: StokItem[] & { sisaKue?: number }[]; // Asumsi sisaKue ada
  handleEdit: (id: number) => void;
  handleDelete: (id: number) => void;
}

const getKueKeys = (data: StokItem) => {
    return Object.keys(data).filter(key => 
        key !== 'id' && key !== 'tanggal' && key !== 'mod' && typeof data[key as keyof StokItem] === 'number'
    ) as (keyof StokItem)[];
}

const formatKueName = (key: string) => {
    return key.replace(/([A-Z])/g, ' $1')
               .replace(/^./, str => str.toUpperCase());
}

const th = "px-3 py-2 text-center font-semibold sticky top-0 bg-rose-600/90 backdrop-blur-sm";
const td = "px-3 py-2 text-center border-t border-gray-200 text-gray-700";

const StokTableView: React.FC<StokTableViewProps> = ({ filteredData, handleEdit, handleDelete }) => {
    
    // Ambil daftar kunci kue sekali saja menggunakan useMemo
    const kueKeys = useMemo(() => filteredData.length > 0 ? getKueKeys(filteredData[0]) : [], [filteredData]);
    
    // Hitung colspan untuk dinamis (1 tanggal + N kue + 1 Aksi)
    const colSpan = 2 + kueKeys.length; 
    
    // 🎯 Logika Sisa Kue Terakhir
    const lastData = filteredData.length > 0 ? filteredData[0] : null;
    // Asumsi properti sisaKue ada pada StokItem
    const sisaKueTerakhir = lastData && lastData.sisaKue !== undefined ? lastData.sisaKue : 0; 
    

    const [hoveredId, setHoveredId] = useState<number | null>(null);
    const [activeId, setActiveId] = useState<number | null>(null);
    const [selectedId, setSelectedId] = useState<number | null>(null);

    const handleClick = (id: number) => {
        setSelectedId(selectedId === id ? null : id);
        setActiveId(null); 
    };

    const handleDoubleClick = (id: number) => {
        setActiveId(activeId === id ? null : id); 
        setSelectedId(null); 
    };

    return (
        <div className="hidden sm:block overflow-x-auto rounded-lg shadow-md">
            <table className={`min-w-[${700 + kueKeys.length * 80}px] w-full border-collapse text-xs sm:text-sm md:text-base`}> 
                <thead>
                    <tr className="bg-gradient-to-r from-rose-500 to-rose-600 text-white">
                        <th className={th}>Hari & Tanggal</th>
                        
                        {kueKeys.map(key => (
                            <th key={key as string} className={th}>{formatKueName(key as string)}</th>
                        ))}
                        
                        <th className={th}>Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredData.map((item, idx) => {
                        const isSelected = selectedId === item.id;
                        const isActive = activeId === item.id;
                        const isEvenRow = idx % 2 === 0;

                        let bgColor = isEvenRow ? "bg-gray-50" : "bg-white";

                        if (isActive) {
                            bgColor = 'bg-rose-200 shadow-md ring-1 ring-rose-500 font-medium';
                        } else if (isSelected) {
                            bgColor = 'bg-rose-100 ring-1 ring-rose-200'; 
                        } 

                        return (
                            <tr
                                key={item.id}
                                className={`
                                    ${bgColor}
                                    transition-all duration-200 ease-in-out
                                    ${!isActive && !isSelected ? 'hover:bg-rose-50 hover:shadow-sm hover:scale-[1.002]' : ''}
                                `}
                                onMouseEnter={() => setHoveredId(item.id)}
                                onMouseLeave={() => setHoveredId(null)}
                                onClick={() => handleClick(item.id)} 
                                onDoubleClick={() => handleDoubleClick(item.id)}
                            >
                                <td 
                                    className={`${td} bg-gradient-to-r from-rose-400 to-rose-500 text-white font-semibold`} 
                                >
                                    <span className="font-medium">
                                        {getHari(item.tanggal)}
                                    </span>
                                    <br />
                                    <span className="text-sm text-rose-100">{formatTanggalID(item.tanggal)}</span> 
                                </td>
                                
                                {kueKeys.map(key => (
                                    <td key={key as string} className={td}>
                                        {item[key as keyof StokItem] as number}
                                    </td>
                                ))}
                                
                                <td className={td}>
                                    <ActionButtons 
                                        id={item.id} 
                                        onEdit={handleEdit} 
                                        onDelete={handleDelete}
                                        size={16}
                                    />
                                </td>
                            </tr>
                        );
                    })}

                    {filteredData.length === 0 && (
                        <tr>
                            <td colSpan={colSpan} className="text-center py-4 text-gray-500">
                                Tidak ada data untuk periode ini.
                            </td>
                        </tr>
                    )}
                    
                    {/* 🎯 BARIS SISA KUE SEBELUMNYA (FOOTER) */}
                    {filteredData.length > 0 && (
                        <tr className="bg-green-50/70 border-t-4 border-green-300">
                            {/* Cell pertama span semua kolom kecuali kolom sisa itu sendiri */}
                            <td 
                                colSpan={colSpan - 1} // Semua kolom kecuali yang terakhir (Aksi)
                                className="px-3 py-3 text-left font-bold text-sm text-green-700"
                            >
                                Sisa Kue Tanggal Sebelumnya (otomatis dari data terakhir):
                            </td>
                            
                            {/* Cell untuk nilai sisa kue terakhir */}
                            <td className="px-3 py-3 text-center font-extrabold text-xl text-green-800">
                                {sisaKueTerakhir}
                            </td>
                            
                            {/* Cell Aksi dikosongkan */}
                            <td className={td}></td>
                        </tr>
                    )}
                    {/* ------------------------------------------- */}
                </tbody>
            </table>
        </div>
    );
};

export default StokTableView;