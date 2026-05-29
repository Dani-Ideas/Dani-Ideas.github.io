import { HashRouter, Routes, Route, Navigate } from "react-router-dom"
import { SessionsListPage } from "./pages/SessionsListPage"
import { TerminalsPage } from "./pages/TerminalsPage"
import { NewSessionPage } from "./pages/NewSessionPage"
import { SessionPage } from "./pages/SessionPage"
import { CheckoutPage } from "./pages/CheckoutPage"
import { CloseSessionPage } from "./pages/CloseSessionPage"

export function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<SessionsListPage />} />
        <Route path="/terminals" element={<TerminalsPage />} />
        <Route path="/sessions/new" element={<NewSessionPage />} />
        <Route path="/sessions/:id" element={<SessionPage />} />
        <Route path="/sessions/:id/checkout" element={<CheckoutPage />} />
        <Route path="/sessions/:id/close" element={<CloseSessionPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  )
}
