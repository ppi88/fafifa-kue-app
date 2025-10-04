import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import BackButton from "../components/BackButton";
import CustomDatePicker from "../components/CustomDatePicker";

const InputStok: React.FC = () => {
  const navigate = useNavigate();
  const [tanggal, setTanggal] = useState<string>("");

  const [stok, setStok] = useState<Record<string, string>>({
    boluKukus: "",
    rotiGabin: "",
    pastel: "",
    martabakTelur: "",
    moci: "",
  });

  const [lainnya, setLainnya] = useState<{ jenis: string; jumlah: string }>({
    jenis: "",
    jumlah: "",
  });

  const [bottomOffset, setBottomOffset] = useState<number>(56); // ✅ default dinaikkan sedikit
  const initialHeight = useRef<number>(window.innerHeight);

  useEffect(() => {
    const handleResize = () => {
      const currentHeight = window.innerHeight;
      const keyboardActive = currentHeight < initialHeight.current - 90;
      setBottomOffset(keyboardActive ? 64 : 56); // ✅ keyboard tetap aman, non-keyboard dinaikkan
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!tanggal) return alert("Mohon isi tanggal terlebih dahulu.");

    const payload = {
      tanggal,
      boluKukus: Number(stok.boluKukus) || 0,
      rotiGabin: Number(stok.rotiGabin) || 0,
      pastel: Number(stok.pastel) || 0,
      martabakTelur: Number(stok.martabakTelur) || 0,
      moci: Number(stok.moci) || 0,
      lainnya: {
        jenis: lainnya.jenis.trim(),
        jumlah: Number(lainnya.jumlah) || 0,
      },
    };

    try {
      const response = await fetch("http://localhost:8000/api/stok/input", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (response.ok) {
        alert("✅ Data stok berhasil disimpan!");
        setTanggal("");
        setStok({ boluKukus: "", rotiGabin: "", pastel: "", martabakTelur: "", moci: "" });
        setLainnya({ jenis: "", jumlah: "" });
        navigate("/laporan-stok-produksi");
      } else {
        alert(`❌ Gagal: ${result.detail || result.message}`);
      }
    } catch (err) {
      alert("❌ Gagal koneksi ke server");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-rose-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-300 via-rose-300 to-rose-400 text-white shadow-md px-4 sm:px-6 py-3 flex justify-between items-center rounded-b-2xl">
        <h2 className="text-lg font-bold">Input Jumlah Produksi Kue</h2>
        <BackButton />
      </div>

      {/* Scrollable Form */}
      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-[160px] scroll-pb-40">
        <form id="stokForm" onSubmit={handleSubmit} className="space-y-4">
          <CustomDatePicker label="Tanggal" value={tanggal} onChange={setTanggal} />
          <hr className="border-t border-rose-200" />

          <div className="space-y-2">
            <h3 className="text-base font-semibold text-gray-800">Jenis Kue</h3>
            <div className="grid grid-cols-2 gap-2">
              {["boluKukus", "rotiGabin", "pastel", "martabakTelur", "moci"].map((key) => (
                <div key={key} className={`relative transition duration-300 ease-in-out transform hover:scale-[1.015] ${key === "moci" ? "col-span-2" : ""}`}>
                  <div className="absolute inset-0 bg-white/60 backdrop-blur-md rounded-lg border border-white/30 shadow-sm z-0"></div>
                  <div className="relative z-10 p-1.5">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {key.replace(/([A-Z])/g, " $1").replace(/^./, str => str.toUpperCase())}
                    </label>
                    <input
                      type="number"
                      min="0"
                      inputMode="numeric"
                      value={stok[key]}
                      onChange={(e) => setStok((prev) => ({ ...prev, [key]: e.target.value }))}
                      placeholder="Jumlah"
                      className="w-full bg-white rounded-md py-1.5 px-2 text-sm text-gray-800 placeholder-gray-500 outline-none"
                    />
                  </div>
                </div>
              ))}
              <div className="relative transition duration-300 ease-in-out transform hover:scale-[1.015] col-span-2">
                <div className="absolute inset-0 bg-white/60 backdrop-blur-md rounded-lg border border-white/30 shadow-sm z-0"></div>
                <div className="relative z-10 p-1.5">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kue Lainnya (Jenis dan Jumlah)</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={lainnya.jenis}
                      onChange={(e) => setLainnya((prev) => ({ ...prev, jenis: e.target.value }))}
                      placeholder="Jenis kue"
                      className="w-2/3 bg-white rounded-md py-1.5 px-2 text-sm text-gray-800 placeholder-gray-500 outline-none"
                    />
                    <input
                      type="number"
                      min="0"
                      inputMode="numeric"
                      value={lainnya.jumlah}
                      onChange={(e) => setLainnya((prev) => ({ ...prev, jumlah: e.target.value }))}
                      placeholder="Jumlah"
                      className="w-1/3 bg-white rounded-md py-1.5 px-2 text-sm text-gray-800 placeholder-gray-500 outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Tombol Simpan Sticky Dinamis */}
      <div
        className="sticky bg-rose-100 px-4 py-1 z-20 transition-all duration-300 ease-in-out"
        style={{ bottom: `${bottomOffset}px` }}
      >
        <button
          type="submit"
          form="stokForm"
          className="bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-lg w-full p-3 text-sm transition-transform transform-gpu duration-300 hover:scale-[1.02] active:scale-95 shadow-md"
        >
          💾 SIMPAN STOK
        </button>
      </div>
    </div>
  );
};

export default InputStok;
