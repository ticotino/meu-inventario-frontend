import type { MovimentacoesEstoqueFiltros, MovimentacoesEstoquePagina } from "../types/movimentacaoEstoque";
import { api } from "./api";
import type { Envelope } from "./api";

export async function listMovimentacoesEstoque(
  filtros: MovimentacoesEstoqueFiltros = {},
): Promise<MovimentacoesEstoquePagina> {
  const params: Record<string, string | number> = {};
  if (filtros.itemTipo) params.item_tipo = filtros.itemTipo;
  if (filtros.itemId) params.item_id = filtros.itemId;
  if (filtros.tipo) params.tipo = filtros.tipo;
  if (filtros.dataInicio) params.data_inicio = filtros.dataInicio;
  if (filtros.dataFim) params.data_fim = filtros.dataFim;
  if (filtros.cursor) params.cursor = filtros.cursor;
  if (filtros.limite) params.limite = filtros.limite;

  const { data } = await api.get<Envelope<MovimentacoesEstoquePagina>>("/movimentacoes-estoque", { params });
  return data.data;
}
