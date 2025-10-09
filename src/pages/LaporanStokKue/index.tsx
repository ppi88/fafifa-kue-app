import { useEffect, useState } from "react";
import HeaderBar from "./components/HeaderBar";
import TanggalCard from "./components/TanggalCard";
import ModalInput from "./components/ModalInput";
import ModalEditGabungan from "./components/ModalEditGabungan";
import { useLaporanData } from "./hooks/useLaporanData";
import type { LaporanRecord } from "./types";
import { KUE_LIST } from "../InputStokKue";

export default function LaporanStokKue() {
  const { data, loading, getData, hapusData } = useLaporanData();

  const [modalType, setModalType] = useState<"stok" | "sisa" | null>(null);
  const [selected, setSelected] = useState<LaporanRecord | null>(null);
  const [editGabunganData, setEditGabunganData] = useState<any | null>(null);
  const [filterDate, setFilterDate] = useState<string>("");

  useEffect(() => {
    getData(filterDate);
  }, [filterDate]);

  // Selalu refresh data setelah update
  const handleUpdateInline = () => {
    getData(filterDate);
  };

  // Selalu refresh data setelah hapus
  const handleDelete = async (id: number, tanggal: string) => {
    await hapusData(id, tanggal);
    getData(filterDate);
  };

  const openEditGabunganModal = (row: LaporanRecord, kue_key: string) => {
    const prevDateIndex = data.findIndex(d => d.id === row.id) + 1;
    const prevData = data[prevDateIndex];

    setEditGabunganData({
      tanggal: row.tanggal,
      tanggal_sebelumnya: prevData?.tanggal || null,
      kue_key: kue_key,
      kue_label: KUE_LIST.find(k => k.key === kue_key)?.label || '',
      input_baru: row.items_metadata?.[kue_key]?.input_baru ?? 0,
      sisa_kemarin: row.items_metadata?.[kue_key]?.sisa_kemarin ?? 0,
    });
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
          {filterDate ? `Tidak ada data untuk tanggal ${filterDate}.` : "Tidak ada data stok."}
        </p>
      ) : (
        data.map((row, idx) => {
          const next = data[idx + 1];
          const totalPrev = next ? Object.values(next.sisa || {}).reduce((a, b) => a + (Number(b) || 0), 0) : 0;
          return (
            <TanggalCard
              key={row.id}
              row={row}
              totalPrev={totalPrev}
              onInputSisa={(r) => { setSelected(r); setModalType("sisa"); }}
              onHapus={handleDelete}
              onUpdate={handleUpdateInline}
              onEditGabungan={openEditGabunganModal}
            />
          );
        })
      )}

      <ModalInput
        type={modalType}
        visible={!!modalType}
        onClose={() => setModalType(null)}
        selected={selected}
        onSuccess={() => { setModalType(null); getData(filterDate); }}
      />
      <ModalEditGabungan
        visible={!!editGabunganData}
        onClose={() => setEditGabunganData(null)}
        onSuccess={() => { setEditGabunganData(null); getData(filterDate); }}
        data={editGabunganData}
      />
    </div>
  );
}