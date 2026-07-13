import type { Pedido, PedidoCreateInput, PedidoDetalhe, PedidoFiltros, PedidoRegistro } from "../types/pedido";
import { api } from "./api";
import type { Envelope } from "./api";

export async function listPedidos(filtros: PedidoFiltros = {}): Promise<Pedido[]> {
  const params: Record<string, string> = {};
  if (filtros.clienteId) params.cliente_id = filtros.clienteId;
  if (filtros.status) params.status = filtros.status;
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

export async function atenderPedido(id: string): Promise<PedidoRegistro> {
  const { data } = await api.post<Envelope<PedidoRegistro>>(`/pedidos/${id}/atender`);
  return data.data;
}

export async function faturarPedido(id: string): Promise<PedidoRegistro> {
  const { data } = await api.post<Envelope<PedidoRegistro>>(`/pedidos/${id}/faturar`);
  return data.data;
}
