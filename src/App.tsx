import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import { EmBreve } from "./components/ui/EmBreve";
import { AuthProvider } from "./contexts/AuthContext";
import { Login } from "./pages/auth/Login";
import { Dashboard } from "./pages/dashboard/Dashboard";
import { ProtectedRoute } from "./routes/ProtectedRoute";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/fabricantes" element={<EmBreve titulo="Fabricantes" />} />
              <Route path="/materias-primas" element={<EmBreve titulo="Matérias-primas" />} />
              <Route path="/producao" element={<EmBreve titulo="Produção" />} />
              <Route path="/pedidos" element={<EmBreve titulo="Pedidos" />} />
              <Route path="/romaneios" element={<EmBreve titulo="Romaneios" />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
