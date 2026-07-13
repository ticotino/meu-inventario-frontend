import type {
  MateriaPrima,
  MateriaPrimaCreateInput,
  MateriaPrimaFiltros,
  MateriaPrimaUpdateInput,
} from "../types/materiaPrima";
import { api } from "./api";
import type { Envelope } from "./api";

export async function listMateriasPrimas(filtros: MateriaPrimaFiltros = {}): Promise<MateriaPrima[]> {
  const params: Record<string, string> = {};
  if (filtros.busca?.trim()) params.busca = filtros.busca.trim();
  if (filtros.fabricanteId) params.fabricante_id = filtros.fabricanteId;
  if (filtros.ativo !== undefined) params.ativo = String(filtros.ativo);
  const { data } = await api.get<Envelope<MateriaPrima[]>>("/materias-primas", { params });
  return data.data;
}

export async function getMateriaPrima(id: string): Promise<MateriaPrima> {
  const { data } = await api.get<Envelope<MateriaPrima>>(`/materias-primas/${id}`);
  return data.data;
}

export async function createMateriaPrima(input: MateriaPrimaCreateInput): Promise<MateriaPrima> {
  const { data } = await api.post<Envelope<MateriaPrima>>("/materias-primas", input);
  return data.data;
}

export async function updateMateriaPrima(id: string, input: MateriaPrimaUpdateInput): Promise<MateriaPrima> {
  const { data } = await api.put<Envelope<MateriaPrima>>(`/materias-primas/${id}`, input);
  return data.data;
}
