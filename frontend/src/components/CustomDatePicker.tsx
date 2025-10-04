// src/components/CustomDatePicker.tsx

import React from 'react';
import DatePicker from 'react-datepicker'; 
// Import format dan id dari date-fns untuk formatting tanggal lokal yang lebih aman
import { format } from 'date-fns';
import { id } from 'date-fns/locale'; 

interface DatePickerProps {
  label: string;
  value: string; 
  onChange: (date: string) => void;
}

const CustomDatePicker: React.FC<DatePickerProps> = ({ label, value, onChange }) => {
  
  // Memastikan Date objek dibuat di awal hari (T00:00:00) di zona waktu lokal
  const selectedDate = value ? new Date(value + 'T00:00:00') : null;

  const handleChange = (date: Date | null) => {
    if (date) {
      // PERBAIKAN VITAL: Menggunakan fungsi format dari date-fns
      // Fungsi format ini secara default menggunakan zona waktu lokal browser, 
      // sehingga tanggal yang dipilih (misalnya tanggal 4) dikonversi dengan aman
      // ke string 'YYYY-MM-DD' tanpa masalah offset UTC.
      const formattedDate = format(date, 'yyyy-MM-dd', { locale: id });
      
      onChange(formattedDate);
    } else {
      onChange('');
    }
  };
  
  const formatDisplayDate = (date: Date | null) => {
      if (!date) return 'Pilih tanggal';
      // Menggunakan Intl.DateTimeFormat untuk format lokal Indonesia (dd MMMM yyyy)
      return new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }).format(date);
  }

  return (
    <div className="relative z-10">
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>

      <DatePicker
        selected={selectedDate}
        onChange={handleChange}
        locale={id}
        dateFormat="dd MMMM yyyy" 
        placeholderText="Pilih tanggal"
        calendarClassName="modern-calendar" 
        showPopperArrow={false} 
        
        wrapperClassName="w-full" 
        
        customInput={
            <button
                type="button"
                className="w-full bg-white border border-gray-300 rounded-md p-2 text-sm text-gray-800 cursor-pointer flex justify-between items-center"
            >
                <span>{formatDisplayDate(selectedDate)}</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
            </button>
        }
      />
    </div>
  );
};

export default CustomDatePicker;