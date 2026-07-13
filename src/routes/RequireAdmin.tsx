import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export function RequireAdmin() {
  const { usuario } = useAuth();

  if (usuario?.papel !== "admin") {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
