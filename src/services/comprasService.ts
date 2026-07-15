import type {
  CriarSolicitacaoCompraInput,
  NecessidadeCompra,
  ReceberSolicitacaoCompraInput,
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
}: ReceberSolicitacaoCompraInput): Promise<void> {
  await api.post(`/compras/solicitacoes/${id}/receber`, { quantidade_recebida });
}

export async function cancelarSolicitacaoCompra(id: string): Promise<void> {
  await api.post(`/compras/solicitacoes/${id}/cancelar`, {});
}
