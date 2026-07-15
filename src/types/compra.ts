import type { UnidadeMedida } from "./materiaPrima";

export type StatusSolicitacaoCompra = "solicitado" | "recebido" | "cancelado";

export interface NecessidadeCompra {
  materia_prima_id: string;
  codigo: string;
  nome_tecido: string;
  cor: string | null;
  unidade_medida: UnidadeMedida;
  quantidade_disponivel: string;
  estoque_minimo: string;
  quantidade_sugerida: string;
  fabricante_id: string;
  fabricante_nome: string;
  solicitacao_id: string | null;
  quantidade_solicitada: string | null;
  quantidade_recebida: string | null;
  solicitacao_status: StatusSolicitacaoCompra | null;
  solicitacao_observacoes: string | null;
  solicitacao_criado_por: string | null;
  solicitacao_criado_por_nome: string | null;
  solicitacao_criado_em: string | null;
}

export interface CriarSolicitacaoCompraInput {
  materia_prima_id: string;
  quantidade_solicitada: number;
  observacoes?: string;
}

export interface ReceberSolicitacaoCompraInput {
  id: string;
  quantidade_recebida: number;
}
