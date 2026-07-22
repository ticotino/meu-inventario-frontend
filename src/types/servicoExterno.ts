export const TIPOS_SERVICO_EXTERNO = ["costura_externa", "silk", "bordado"] as const;
export type TipoServicoExterno = (typeof TIPOS_SERVICO_EXTERNO)[number];

export type StatusServicoExterno = "enviado" | "recebido" | "cancelado";

// Linha crua da tabela servicos_externos — é o que POST/ações /servicos-externos
// devolvem (sem os campos de JOIN, que só existem em list/getById).
export interface ServicoExternoRegistro {
  id: string;
  codigo: string;
  producao_id: string;
  // Preenchido quando este envio atende a um item de pedido específico
  // (nullable, aditivo — o fluxo a partir de uma produção própria continua
  // funcionando sem ele).
  pedido_item_id: string | null;
  prestador_id: string;
  tipo: TipoServicoExterno;
  status: StatusServicoExterno;
  // decimal do Postgres chega como string
  quantidade_enviada: string;
  quantidade_recebida: string | null;
  data_envio: string;
  data_recebimento_prevista: string | null;
  data_recebimento: string | null;
  valor_cobrado: string | null;
  nota_fiscal: string | null;
  observacoes: string | null;
  criado_por: string;
  criado_em: string;
  atualizado_em: string;
  recebido_em: string | null;
  cancelado_em: string | null;
}

export interface ServicoExterno extends ServicoExternoRegistro {
  producao_codigo: string;
  produto_nome: string;
  prestador_nome: string;
  usuario_nome: string;
}

export interface ServicoExternoCreateInput {
  producao_id: string;
  pedido_item_id?: string;
  prestador_id: string;
  tipo: TipoServicoExterno;
  quantidade_enviada: number;
  data_envio: string;
  data_recebimento_prevista?: string;
  valor_cobrado?: number;
  nota_fiscal?: string;
  observacoes?: string;
}

export interface ReceberServicoExternoInput {
  quantidade_recebida: number;
  valor_cobrado?: number;
  nota_fiscal?: string;
}

export interface ServicoExternoFiltros {
  producaoId?: string;
  prestadorId?: string;
  tipo?: TipoServicoExterno;
  status?: StatusServicoExterno;
}
