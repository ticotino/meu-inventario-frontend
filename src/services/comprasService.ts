import type {
  CriarSolicitacaoCompraInput,
  NecessidadeCompra,
  ReceberSolicitacaoCompraInput,
  ReservaMateriaPrimaPedido,
} from "../types/compra";
import { api } from "./api";
import type { Envelope } from "./api";

export async function listCompras(): Promise<NecessidadeCompra[]> {
  const { data } = await api.get<Envelope<NecessidadeCompra[]>>("/compras");
  return data.data;
}

export async function criarSolicitacaoCompra(input: CriarSolicitacaoCompraInput): Promise<NecessidadeCompra> {
  const { data } = await api.post<Envelope<NecessidadeCompra>>("/compras/solicitacoes", input);
  return data.data;
}

export async function receberSolicitacaoCompra({
  id,
  quantidade_recebida,
  reservas,
  nota_fiscal,
  valor_unitario,
}: ReceberSolicitacaoCompraInput): Promise<void> {
  await api.post(`/compras/solicitacoes/${id}/receber`, {
    quantidade_recebida,
    reservas,
    nota_fiscal,
    valor_unitario,
  });
}

export async function cancelarSolicitacaoCompra(id: string): Promise<void> {
  await api.post(`/compras/solicitacoes/${id}/cancelar`, {});
}

// Reservas de matéria-prima vistas do lado do pedido (join inverso de
// ReservaMateriaPrima) — usado no detalhe do pedido para mostrar tecido,
// quantidade e data do recebimento associado.
export async function listReservasPedido(pedidoId: string): Promise<ReservaMateriaPrimaPedido[]> {
  const { data } = await api.get<Envelope<ReservaMateriaPrimaPedido[]>>(
    `/pedidos/${pedidoId}/reservas-materia-prima`,
  );
  return data.data;
}
