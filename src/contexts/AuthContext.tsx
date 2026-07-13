import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import * as authService from "../services/authService";
import type { Usuario } from "../types/auth";
import { AuthContext } from "./auth-context";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let ativo = true;
    authService.tryRestoreSession().then((restaurado) => {
      if (!ativo) return;
      setUsuario(restaurado);
      setCarregando(false);
    });
    return () => {
      ativo = false;
    };
  }, []);

  async function login(email: string, senha: string) {
    const usuarioLogado = await authService.login(email, senha);
    setUsuario(usuarioLogado);
  }

  async function logout() {
    try {
      await authService.logout();
    } finally {
      setUsuario(null);
    }
  }

  return (
    <AuthContext.Provider value={{ usuario, carregando, login, logout }}>{children}</AuthContext.Provider>
  );
}
