import { Routes, Route } from "react-router-dom";
import Dashboard from "./pages/dashboard";
import InputStok from "./pages/input-stok";
import LaporanStokProduksi from "./pages/laporan-stok-produksi";
import Analisa from "./pages/analisa";
import Layout from "./components/Layout";

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/input-stok" element={<InputStok />} />
        <Route path="/laporan-stok-produksi" element={<LaporanStokProduksi />} />
        <Route path="/analisa" element={<Analisa />} />
      </Routes>
    </Layout>
  );
}