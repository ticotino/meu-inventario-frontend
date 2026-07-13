export type PedidoStatus = "pendente" | "atendido" | "cancelado" | "faturado";

// Linha crua da tabela pedidos — é o que POST/ações /pedidos devolvem
// (sem os campos de JOIN, que só existem em list/getById).
export interface PedidoRegistro {
  id: string;
  codigo: string;
  cliente_id: string;
  status: PedidoStatus;
  data_pedido: string;
  observacoes: string | null;
  criado_por: string;
  criado_em: string;
  atualizado_em: string;
}

export interface Pedido extends PedidoRegistro {
  cliente_nome: string;
  usuario_nome: string;
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
  observacoes?: string;
  itens: Array<{
    produto_id: string;
    quantidade: number;
  }>;
}

export interface PedidoFiltros {
  clienteId?: string;
  status?: PedidoStatus;
}
