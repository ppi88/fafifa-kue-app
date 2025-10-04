// src/components/ActionButtons.tsx

import React from 'react';
import { Edit2, Trash2 } from "lucide-react";

interface ActionButtonsProps {
  id: number;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  size?: number; // Ukuran ikon (default 16)
}

const ActionButtons: React.FC<ActionButtonsProps> = ({ id, onEdit, onDelete, size = 16 }) => (
    <div className="flex justify-center gap-1 sm:gap-2"> 
        {/* Tombol Edit */}
        <button 
            onClick={() => onEdit(id)}
            className="
                flex items-center justify-center 
                p-2 rounded-full 
                bg-indigo-100 text-indigo-600 
                hover:bg-indigo-200 hover:text-indigo-800 
                transition duration-200 ease-in-out
                focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:ring-offset-1
                active:scale-95 // Feedback sentuhan mobile
            "
            title="Edit Data"
            aria-label={`Edit data ID ${id}`} 
        >
            <Edit2 size={size} />
        </button>

        {/* Tombol Hapus */}
        <button 
            onClick={() => onDelete(id)}
            className="
                flex items-center justify-center 
                p-2 rounded-full 
                bg-rose-100 text-rose-600 
                hover:bg-rose-200 hover:text-rose-800 
                transition duration-200 ease-in-out
                focus:outline-none focus:ring-2 focus:ring-rose-300 focus:ring-offset-1
                active:scale-95 // Feedback sentuhan mobile
            "
            title="Hapus Data"
            aria-label={`Hapus data ID ${id}`} 
        >
            <Trash2 size={size} />
        </button>
    </div>
);

export default ActionButtons;