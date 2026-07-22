import type { Pedido, PedidoCreateInput, PedidoDetalhe, PedidoFiltros, PedidoRegistro } from "../types/pedido";
import { api } from "./api";
import type { Envelope } from "./api";

export async function listPedidos(filtros: PedidoFiltros = {}): Promise<Pedido[]> {
  const params: Record<string, string> = {};
  if (filtros.clienteId) params.cliente_id = filtros.clienteId;
  if (filtros.status) params.status = filtros.status;
  if (filtros.prazo) params.prazo = filtros.prazo;
  if (filtros.dataInicio) params.data_inicio = filtros.dataInicio;
  if (filtros.dataFim) params.data_fim = filtros.dataFim;
  const { data } = await api.get<Envelope<Pedido[]>>("/pedidos", { params });
  return data.data;
}

export async function getPedido(id: string): Promise<PedidoDetalhe> {
  const { data } = await api.get<Envelope<PedidoDetalhe>>(`/pedidos/${id}`);
  return data.data;
}

export async function createPedido(input: PedidoCreateInput): Promise<PedidoRegistro> {
  const { data } = await api.post<Envelope<PedidoRegistro>>("/pedidos", input);
  return data.data;
}

export async function cancelarPedido(id: string): Promise<PedidoRegistro> {
  const { data } = await api.post<Envelope<PedidoRegistro>>(`/pedidos/${id}/cancelar`);
  return data.data;
}

export async function excluirPedido(id: string): Promise<void> {
  await api.delete(`/pedidos/${id}`);
}

export async function atenderPedido(id: string): Promise<PedidoRegistro> {
  const { data } = await api.post<Envelope<PedidoRegistro>>(`/pedidos/${id}/atender`);
  return data.data;
}

export async function faturarPedido(id: string): Promise<PedidoRegistro> {
  const { data } = await api.post<Envelope<PedidoRegistro>>(`/pedidos/${id}/faturar`);
  return data.data;
}

export async function updatePrazoPedido(id: string, dataPrevistaEntrega: string): Promise<PedidoDetalhe> {
  const { data } = await api.patch<Envelope<PedidoDetalhe>>(`/pedidos/${id}/prazo`, {
    data_prevista_entrega: dataPrevistaEntrega,
  });
  return data.data;
}
