import type { Fabricante, FabricanteInput, FabricanteUpdateInput } from "../types/fabricante";
import { api } from "./api";
import type { Envelope } from "./api";

export async function listFabricantes(busca?: string): Promise<Fabricante[]> {
  const params = busca?.trim() ? { busca: busca.trim() } : undefined;
  const { data } = await api.get<Envelope<Fabricante[]>>("/fabricantes", { params });
  return data.data;
}

export async function createFabricante(input: FabricanteInput): Promise<Fabricante> {
  const { data } = await api.post<Envelope<Fabricante>>("/fabricantes", input);
  return data.data;
}

export async function updateFabricante(id: string, input: FabricanteUpdateInput): Promise<Fabricante> {
  const { data } = await api.put<Envelope<Fabricante>>(`/fabricantes/${id}`, input);
  return data.data;
}

export async function deactivateFabricante(id: string): Promise<void> {
  await api.delete(`/fabricantes/${id}`);
}
