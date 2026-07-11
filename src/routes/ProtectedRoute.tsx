import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export function ProtectedRoute() {
  const { usuario, carregando } = useAuth();

  if (carregando) {
    return (
      <div className="flex h-screen items-center justify-center text-sm text-slate-500">Carregando...</div>
    );
  }

  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
