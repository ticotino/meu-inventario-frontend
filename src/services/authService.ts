import type { Usuario } from "../types/auth";
import { api } from "./api";
import { setAccessToken } from "./tokenStore";

interface Envelope<T> {
  success: true;
  data: T;
}

interface RefreshSessionData {
  accessToken: string;
  usuario?: Usuario;
}

export async function login(email: string, senha: string): Promise<Usuario> {
  const { data } = await api.post<Envelope<{ accessToken: string; usuario: Usuario }>>("/auth/login", {
    email,
    senha,
  });
  setAccessToken(data.data.accessToken);
  return data.data.usuario;
}

export async function logout(): Promise<void> {
  try {
    await api.post("/auth/logout");
  } finally {
    setAccessToken(null);
  }
}

export async function fetchMe(): Promise<Usuario> {
  const { data } = await api.get<Envelope<Usuario>>("/auth/me");
  return data.data;
}

export async function tryRestoreSession(): Promise<Usuario | null> {
  try {
    const { data } = await api.post<Envelope<RefreshSessionData>>("/auth/refresh");
    setAccessToken(data.data.accessToken);
    if (data.data.usuario) return data.data.usuario;
    return await fetchMe();
  } catch {
    return null;
  }
}
