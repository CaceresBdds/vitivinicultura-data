import { Navigate, Route, Routes } from "react-router-dom";

import { Layout } from "./components/Layout";
import { NationalOverviewPage } from "./pages/NationalOverview/NationalOverviewPage";
import { ProvinceDetailPage } from "./pages/ProvinceDetail/ProvinceDetailPage";
import { ProvincesPage } from "./pages/Provinces/ProvincesPage";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<NationalOverviewPage />} />
        <Route path="/provinces" element={<ProvincesPage />} />
        <Route path="/provinces/:provinceId" element={<ProvinceDetailPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
