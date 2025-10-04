// Lokasi: src/components/EditStokModal.tsx

import React, { useState, useEffect } from 'react';
import { StokItem } from '../types/StokItem'; 
import { X } from 'lucide-react';

interface EditStokModalProps {
    stokData: StokItem;
    onClose: () => void;
    onSave: (updatedData: StokItem) => void;
}

const EditStokModal: React.FC<EditStokModalProps> = ({ stokData, onClose, onSave }) => {
    
    const [formData, setFormData] = useState<StokItem>(stokData);

    useEffect(() => {
        setFormData(stokData);
    }, [stokData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'tanggal' ? value : parseInt(value) || 0,
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        // Container Modal Overlay: Padding p-1 (Paling Minimal)
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-1"> 
            
            {/* 🎯 PENYESUAIAN LEBAR AKHIR: w-[85%] dan max-h-[85vh] */}
            <div className="bg-white rounded-lg shadow-xl max-w-full w-[85%] sm:max-w-sm max-h-[85vh] flex flex-col">
                
                {/* Header Modal (Padding p-2, text-xs) */}
                <div className="p-2 border-b flex justify-between items-center bg-rose-500 text-white rounded-t-lg flex-shrink-0">
                    <h2 className="text-xs font-bold sm:text-lg">Edit Stok Tanggal {stokData.tanggal}</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-white/20 transition-all">
                        <X size={18} />
                    </button>
                </div>

                {/* Body Form (Scrollable): Padding p-3, Jarak space-y-1 (Paling Minimal) */}
                <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto p-3 space-y-1"> 
                    
                    {/* Input Tanggal */}
                    <div className='pb-1'>
                        <label className="block text-xs font-medium text-gray-700">Tanggal</label>
                        <input
                            type="date"
                            name="tanggal"
                            value={formData.tanggal}
                            onChange={handleChange}
                            className="mt-0 block w-full rounded-md text-xs border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500 p-1"
                            required
                        />
                    </div>
                    
                    {/* Input Stok Kue: space-y-1 */}
                    <div className="space-y-1"> 
                    {Object.keys(formData).map((key) => {
                        if (key !== 'id' && key !== 'tanggal' && key !== 'mod' && typeof formData[key as keyof StokItem] === 'number') {
                            return (
                                <div key={key}>
                                    <label className="block text-xs font-medium text-gray-700">
                                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                    </label>
                                    <input
                                        type="number"
                                        name={key}
                                        value={formData[key as keyof StokItem] as number}
                                        onChange={handleChange}
                                        className="mt-0 block w-full rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500 text-xs p-1"
                                        min="0"
                                        required
                                    />
                                </div>
                            );
                        }
                        return null;
                    })}
                    </div>
                </form>

                {/* Sticky Footer Modal (Padding p-2) */}
                <div className="flex justify-end gap-2 p-2 border-t flex-shrink-0 bg-white rounded-b-lg w-full">
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
                        className="px-2 py-1 text-xs font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors"
                    >
                        Simpan Perubahan
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditStokModal;