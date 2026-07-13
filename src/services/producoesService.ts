import type { Producao, ProducaoCreateInput, ProducaoDetalhe, ProducaoFiltros, ProducaoRegistro } from "../types/producao";
import { api } from "./api";
import type { Envelope } from "./api";

export async function listProducoes(filtros: ProducaoFiltros = {}): Promise<Producao[]> {
  const params: Record<string, string> = {};
  if (filtros.produtoId) params.produto_id = filtros.produtoId;
  const { data } = await api.get<Envelope<Producao[]>>("/producoes", { params });
  return data.data;
}

export async function getProducao(id: string): Promise<ProducaoDetalhe> {
  const { data } = await api.get<Envelope<ProducaoDetalhe>>(`/producoes/${id}`);
  return data.data;
}

export async function createProducao(input: ProducaoCreateInput): Promise<ProducaoRegistro> {
  const { data } = await api.post<Envelope<ProducaoRegistro>>("/producoes", input);
  return data.data;
}
