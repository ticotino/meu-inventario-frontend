import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import * as authService from "../services/authService";
import type { Usuario } from "../types/auth";

interface AuthContextValue {
  usuario: Usuario | null;
  carregando: boolean;
  login: (email: string, senha: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

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
    await authService.logout();
    setUsuario(null);
  }

  return (
    <AuthContext.Provider value={{ usuario, carregando, login, logout }}>{children}</AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  return context;
}
