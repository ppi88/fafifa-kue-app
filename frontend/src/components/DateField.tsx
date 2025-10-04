import DatePicker from "react-datepicker";
import { id } from "date-fns/locale";
import { CalendarDaysIcon } from "@heroicons/react/24/outline";

const MONTHS_ID = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 61 }, (_, i) => currentYear - 50 + i);

export interface DateFieldProps {
  value: Date;
  onChange: (date: Date) => void;
  minDate?: Date;
  maxDate?: Date;
  containerClassName?: string; // kontrol lebar wrapper
  inputClassName?: string;     // tambahan class input
}

export default function DateField({
  value,
  onChange,
  minDate,
  maxDate,
  containerClassName = "w-full md:max-w-[560px]",
  inputClassName = "",
}: DateFieldProps) {
  return (
    <div className={`relative ${containerClassName}`}>
      {/* Ikon kalender (Heroicons) */}
      <span
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 z-30"
        aria-hidden="true"
      >
        <CalendarDaysIcon className="h-5 w-5 text-gray-500" />
      </span>

      <DatePicker
        selected={value}
        onChange={(d: Date | null) => d && onChange(d)}
        dateFormat="EEEE, d MMMM yyyy" // Hari, tanggal panjang (ID)
        locale={id}
        popperPlacement="bottom-start"
        popperClassName="z-50 shadow-lg border rounded-lg"
        todayButton="Hari ini"
        showMonthDropdown
        showYearDropdown
        dropdownMode="select"
        scrollableYearDropdown
        yearDropdownItemNumber={100}
        minDate={minDate}
        maxDate={maxDate}
        // Input style: lebar penuh + ruang icon kiri
        className={`block w-full max-w-full min-w-[320px] md:min-w-[420px] pl-10 pr-3 py-2 border rounded text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 ${inputClassName}`}
        // Header custom (Bulan/Tahun Indonesia)
        renderCustomHeader={({
          date,
          changeYear,
          changeMonth,
          decreaseMonth,
          increaseMonth,
          prevMonthButtonDisabled,
          nextMonthButtonDisabled,
        }) => {
          const m = date.getMonth();
          const y = date.getFullYear();
          return (
            <div className="px-2 py-1 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={decreaseMonth}
                disabled={prevMonthButtonDisabled}
                className="px-2 py-1 rounded hover:bg-gray-100 disabled:opacity-40"
                aria-label="Bulan sebelumnya"
              >
                ‹
              </button>

              <div className="flex items-center gap-2">
                <select
                  value={MONTHS_ID[m]}
                  onChange={(e) => changeMonth(MONTHS_ID.indexOf(e.target.value))}
                  className="border rounded px-2 py-1 text-sm"
                >
                  {MONTHS_ID.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>

                <select
                  value={y}
                  onChange={(e) => changeYear(Number(e.target.value))}
                  className="border rounded px-2 py-1 text-sm"
                >
                  {YEARS.map((yr) => (
                    <option key={yr} value={yr}>
                      {yr}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={increaseMonth}
                disabled={nextMonthButtonDisabled}
                className="px-2 py-1 rounded hover:bg-gray-100 disabled:opacity-40"
                aria-label="Bulan berikutnya"
              >
                ›
              </button>
            </div>
          );
        }}
      />
    </div>
  );
}