import { ArrowLeftIcon } from "@heroicons/react/24/outline";

// Pastikan Anda sudah menginstal Heroicons di proyek Anda:
// npm install @heroicons/react

export default function BackButton() {
  return (
    <a 
      href="#"
      aria-label="Kembali"
      className="p-2 bg-gray-200 hover:bg-gray-300 rounded-full text-gray-700 transition-colors duration-200"
    >
      <ArrowLeftIcon className="h-5 w-5" />
    </a>
  );
}