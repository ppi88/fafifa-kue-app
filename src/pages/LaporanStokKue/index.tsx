import { useEffect, useState } from "react";
import HeaderBar from "./components/HeaderBar";
import TanggalCard from "./components/TanggalCard";
import ModalInput from "./components/ModalInput";
import ModalEditGabungan from "./components/ModalEditGabungan";
import { useLaporanData } from "./hooks/useLaporanData";

export default function LaporanStokKue() {
  const { data, loading, getData, hapusData } = useLaporanData();

  const [modalType, setModalType] = useState<"stok" | "sisa" | null>(null);
  const [editGabunganData, setEditGabunganData] = useState<any | null>(null);
  const [filterDate, setFilterDate] = useState<string>("");

  useEffect(() => {
    getData(filterDate);
  }, [filterDate]);

  const handleUpdateInline = () => {
    getData(filterDate);
  };

  const handleDelete = async (id: number, tanggal: string) => {
    await hapusData(id, tanggal);
    getData(filterDate);
  };

  return (
    <div className="p-4">
      <HeaderBar
        onAdd={() => setModalType("stok")}
        filterDate={filterDate}
        onFilterChange={setFilterDate}
        onClearFilter={() => setFilterDate("")}
        onRefresh={() => getData(filterDate)}
      />

      {loading ? (
        <p className="text-center mt-10">Memuat data...</p>
      ) : data.length === 0 ? (
        <p className="text-center mt-4 text-gray-600">
          {filterDate
            ? `Tidak ada data untuk tanggal ${filterDate}.`
            : "Tidak ada data stok."}
        </p>
      ) : (
        data.map((row) => (
          <TanggalCard
            key={row.id}
            row={row}
            onUpdate={handleUpdateInline}
            onHapus={handleDelete}
          />
        ))
      )}

      <ModalInput
        type={modalType}
        visible={!!modalType}
        onClose={() => setModalType(null)}
        onSuccess={() => {
          setModalType(null);
          getData(filterDate);
        }}
      />

      <ModalEditGabungan
        visible={!!editGabunganData}
        onClose={() => setEditGabunganData(null)}
        onSuccess={() => {
          setEditGabunganData(null);
          getData(filterDate);
        }}
        data={editGabunganData}
      />
    </div>
  );
}