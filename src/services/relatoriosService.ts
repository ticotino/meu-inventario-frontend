import type {
  RelatorioConsumoFiltros,
  RelatorioConsumoItem,
  RelatorioPedidosFiltros,
  RelatorioPedidosItem,
  RelatorioProducaoFiltros,
  RelatorioProducaoItem,
} from "../types/relatorio";
import { api } from "./api";
import type { Envelope } from "./api";

function periodoParams(filtros: { inicio: string; fim: string }) {
  return { inicio: filtros.inicio, fim: filtros.fim };
}

export async function getRelatorioConsumo(filtros: RelatorioConsumoFiltros): Promise<RelatorioConsumoItem[]> {
  const params: Record<string, string> = periodoParams(filtros);
  if (filtros.materiaPrimaId) params.materia_prima_id = filtros.materiaPrimaId;
  if (filtros.produtoId) params.produto_id = filtros.produtoId;
  const { data } = await api.get<Envelope<RelatorioConsumoItem[]>>("/relatorios/consumo", { params });
  return data.data;
}

export async function getRelatorioProducao(filtros: RelatorioProducaoFiltros): Promise<RelatorioProducaoItem[]> {
  const params: Record<string, string> = periodoParams(filtros);
  if (filtros.produtoId) params.produto_id = filtros.produtoId;
  const { data } = await api.get<Envelope<RelatorioProducaoItem[]>>("/relatorios/producao", { params });
  return data.data;
}

export async function getRelatorioPedidos(filtros: RelatorioPedidosFiltros): Promise<RelatorioPedidosItem[]> {
  const params: Record<string, string> = periodoParams(filtros);
  if (filtros.clienteId) params.cliente_id = filtros.clienteId;
  if (filtros.produtoId) params.produto_id = filtros.produtoId;
  const { data } = await api.get<Envelope<RelatorioPedidosItem[]>>("/relatorios/pedidos", { params });
  return data.data;
}
