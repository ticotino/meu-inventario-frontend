import type { Produto, ProdutoCreateInput, ProdutoFiltros, ProdutoUpdateInput } from "../types/produto";
import { api } from "./api";
import type { Envelope } from "./api";

export async function listProdutos(filtros: ProdutoFiltros = {}): Promise<Produto[]> {
  const params: Record<string, string> = {};
  if (filtros.busca?.trim()) params.busca = filtros.busca.trim();
  if (filtros.ativo !== undefined) params.ativo = String(filtros.ativo);
  if (filtros.estoqueBaixo !== undefined) params.estoque_baixo = String(filtros.estoqueBaixo);
  const { data } = await api.get<Envelope<Produto[]>>("/produtos", { params });
  return data.data;
}

export async function getProduto(id: string): Promise<Produto> {
  const { data } = await api.get<Envelope<Produto>>(`/produtos/${id}`);
  return data.data;
}

export async function createProduto(input: ProdutoCreateInput): Promise<Produto> {
  const { data } = await api.post<Envelope<Produto>>("/produtos", input);
  return data.data;
}

export async function updateProduto(id: string, input: ProdutoUpdateInput): Promise<Produto> {
  const { data } = await api.put<Envelope<Produto>>(`/produtos/${id}`, input);
  return data.data;
}
