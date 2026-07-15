export type PedidoStatus = "pendente" | "atendido" | "cancelado" | "faturado";
export type PedidoPrazoFiltro = "atrasado" | "vence_hoje" | "proximo";
export type PedidoSituacaoPrazo = "sem_prazo" | "atrasado" | "vence_hoje" | "no_prazo";

// Linha crua da tabela pedidos — é o que POST/ações /pedidos devolvem
// (sem os campos de JOIN, que só existem em list/getById).
export interface PedidoRegistro {
  id: string;
  codigo: string;
  cliente_id: string;
  status: PedidoStatus;
  data_pedido: string;
  data_prevista_entrega: string | null;
  observacoes: string | null;
  criado_por: string;
  criado_em: string;
  atualizado_em: string;
  atendido_em: string | null;
  faturado_em: string | null;
  cancelado_em: string | null;
}

export interface Pedido extends PedidoRegistro {
  cliente_nome: string;
  usuario_nome: string;
  situacao_prazo: PedidoSituacaoPrazo;
  dias_para_entrega: number | null;
}

export interface PedidoItem {
  produto_id: string;
  // decimal do Postgres chega como string
  quantidade: string;
  codigo: string;
  nome: string;
}

export interface PedidoDetalhe extends Pedido {
  itens: PedidoItem[];
  // Preenchidos quando o pedido já gerou romaneio (relação 1:1).
  romaneio_id: string | null;
  romaneio_codigo: string | null;
}

export interface PedidoCreateInput {
  cliente_id: string;
  data_pedido: string;
  data_prevista_entrega: string;
  observacoes?: string;
  itens: Array<{
    produto_id: string;
    quantidade: number;
  }>;
}

export interface PedidoFiltros {
  clienteId?: string;
  status?: PedidoStatus;
  prazo?: PedidoPrazoFiltro;
  dataInicio?: string;
  dataFim?: string;
}
