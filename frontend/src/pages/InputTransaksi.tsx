import React, { useState } from "react"

export default function InputTransaksi() {
  const today = new Date().toISOString().split("T")[0]
  const [tanggal, setTanggal] = useState(today)

  const [data, setData] = useState({
    "Bolu Kukus": "",
    "Roti Gabin": "",
    "Pastel": "",
    "Martabak Telur": "",
    "Moci": "",
  })

  const handleChange = (namaKue: string, value: string) => {
    setData((prev) => ({ ...prev, [namaKue]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Tanggal:", tanggal)
    console.log("Data transaksi:", data)
    alert("✅ Data transaksi disimpan!")
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-2xl shadow-lg transition-all duration-300 ease-in-out">
      <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
        Input Transaksi Harian
      </h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <input
            type="date"
            value={tanggal}
            onChange={(e) => setTanggal(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-200"
          />
        </div>

        {Object.keys(data).map((namaKue) => (
          <div key={namaKue}>
            <label className="block text-gray-700 font-semibold mb-2">
              {namaKue}
            </label>
            <input
              type="number"
              value={data[namaKue]}
              onChange={(e) => handleChange(namaKue, e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-200"
            />
          </div>
        ))}

        <button
          type="submit"
          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl transition-all duration-300"
        >
          Simpan
        </button>
      </form>
    </div>
  )
}