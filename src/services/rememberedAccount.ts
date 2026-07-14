import type { Usuario } from "../types/auth";

const STORAGE_KEY = "meu-inventario:ultima-conta";

export interface RememberedAccount {
  nome: string;
  email: string;
}

export function getRememberedAccount(): RememberedAccount | null {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    const parsed = JSON.parse(stored) as Partial<RememberedAccount>;
    if (typeof parsed.nome !== "string" || typeof parsed.email !== "string") return null;
    return { nome: parsed.nome, email: parsed.email };
  } catch {
    return null;
  }
}

export function rememberAccount(usuario: Usuario): void {
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ nome: usuario.nome, email: usuario.email }),
    );
  } catch {
    // O login continua funcionando quando o armazenamento local está indisponível.
  }
}

export function forgetRememberedAccount(): void {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Não há ação adicional necessária quando o armazenamento está bloqueado.
  }
}
