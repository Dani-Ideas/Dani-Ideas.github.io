import { HashRouter, Routes, Route, Navigate } from "react-router-dom"
import { SGINavbar } from "./components/sgi/SGINavbar"
import { DashboardPage } from "./pages/DashboardPage"
import { RecepcionesPage } from "./pages/RecepcionesPage"
import { RecepcionDetailPage } from "./pages/RecepcionDetailPage"
import { InternoPage } from "./pages/InternoPage"
import { SalidasPage } from "./pages/SalidasPage"
import { MovementsPage } from "./pages/MovementsPage"
import { ExistenciasPage } from "./pages/ExistenciasPage"
import { ProductosPage } from "./pages/ProductosPage"
import { LotsPage } from "./pages/LotsPage"
import { AlertsPage } from "./pages/AlertsPage"
import { InventarioFisicoPage } from "./pages/InventarioFisicoPage"
import { WarehousePage } from "./pages/WarehousePage"
import { QRSearchPage } from "./pages/QRSearchPage"
import { ReabastecimientoPage } from "./pages/ReabastecimientoPage"

export function App() {
  return (
    <HashRouter>
      <div className="flex flex-col h-screen bg-background overflow-hidden">
        <SGINavbar />
        <main className="flex-1 overflow-y-auto p-6">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/recepciones" element={<RecepcionesPage />} />
            <Route path="/recepciones/:id" element={<RecepcionDetailPage />} />
            <Route path="/interno" element={<InternoPage />} />
            <Route path="/salidas" element={<SalidasPage />} />
            <Route path="/movements" element={<MovementsPage />} />
            <Route path="/existencias" element={<ExistenciasPage />} />
            <Route path="/productos" element={<ProductosPage />} />
            <Route path="/lots" element={<LotsPage />} />
            <Route path="/alerts" element={<AlertsPage />} />
            <Route path="/inventario-fisico" element={<InventarioFisicoPage />} />
            <Route path="/warehouse" element={<WarehousePage />} />
            <Route path="/qr-search" element={<QRSearchPage />} />
            <Route path="/reabastecimiento" element={<ReabastecimientoPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </HashRouter>
  )
}
