export const TIPOS_BENEFICIAMENTO = ["costura_externa", "silk", "bordado"] as const;
export type TipoBeneficiamento = (typeof TIPOS_BENEFICIAMENTO)[number];

export type StatusBeneficiamento = "enviado" | "recebido" | "cancelado";

// Linha crua da tabela beneficiamentos — é o que POST/ações /beneficiamentos
// devolvem (sem os campos de JOIN, que só existem em list/getById).
export interface BeneficiamentoRegistro {
  id: string;
  codigo: string;
  producao_id: string;
  prestador_id: string;
  tipo: TipoBeneficiamento;
  status: StatusBeneficiamento;
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

export interface Beneficiamento extends BeneficiamentoRegistro {
  producao_codigo: string;
  produto_nome: string;
  prestador_nome: string;
  usuario_nome: string;
}

export interface BeneficiamentoCreateInput {
  producao_id: string;
  prestador_id: string;
  tipo: TipoBeneficiamento;
  quantidade_enviada: number;
  data_envio: string;
  data_recebimento_prevista?: string;
  valor_cobrado?: number;
  nota_fiscal?: string;
  observacoes?: string;
}

export interface ReceberBeneficiamentoInput {
  quantidade_recebida: number;
  valor_cobrado?: number;
  nota_fiscal?: string;
}

export interface BeneficiamentoFiltros {
  producaoId?: string;
  prestadorId?: string;
  tipo?: TipoBeneficiamento;
  status?: StatusBeneficiamento;
}
