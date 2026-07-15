import type { Prestador, PrestadorInput, PrestadorUpdateInput } from "../types/prestador";
import { api } from "./api";
import type { Envelope } from "./api";

export async function listPrestadores(busca?: string): Promise<Prestador[]> {
  const params = busca?.trim() ? { busca: busca.trim() } : undefined;
  const { data } = await api.get<Envelope<Prestador[]>>("/prestadores", { params });
  return data.data;
}

export async function createPrestador(input: PrestadorInput): Promise<Prestador> {
  const { data } = await api.post<Envelope<Prestador>>("/prestadores", input);
  return data.data;
}

export async function updatePrestador(id: string, input: PrestadorUpdateInput): Promise<Prestador> {
  const { data } = await api.put<Envelope<Prestador>>(`/prestadores/${id}`, input);
  return data.data;
}

export async function deactivatePrestador(id: string): Promise<void> {
  await api.delete(`/prestadores/${id}`);
}
