import type { Papel, Usuario } from "../types/auth";
import { api } from "./api";
import type { Envelope } from "./api";

export interface CreateUsuarioInput {
  nome: string;
  email: string;
  senha: string;
  papel: Papel;
}

export interface ConviteCriado {
  token: string;
  expiraEm: string;
}

export async function createUsuario(input: CreateUsuarioInput): Promise<Usuario> {
  const { data } = await api.post<Envelope<Usuario>>("/usuarios", input);
  return data.data;
}

export async function createConvite(email: string): Promise<ConviteCriado> {
  const { data } = await api.post<Envelope<ConviteCriado>>("/usuarios/convites", { email });
  return data.data;
}
