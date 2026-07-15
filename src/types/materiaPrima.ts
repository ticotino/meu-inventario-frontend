export const UNIDADES_MEDIDA = ["metro", "kg", "unidade", "rolo"] as const;

export type UnidadeMedida = (typeof UNIDADES_MEDIDA)[number];

export const UNIDADE_MEDIDA_LABELS: Record<UnidadeMedida, string> = {
  metro: "Metro",
  kg: "Quilo (kg)",
  unidade: "Unidade",
  rolo: "Rolo",
};

export interface MateriaPrima {
  id: string;
  codigo: string;
  fabricante_id: string;
  fabricante_nome: string;
  nome_tecido: string;
  cor: string | null;
  unidade_medida: UnidadeMedida;
  // decimais do Postgres chegam como string via pg/knex
  quantidade_recebida: string;
  quantidade_disponivel: string;
  estoque_minimo: string | null;
  estoque_baixo: boolean;
  valor_unitario: string | null;
  data_recebimento: string;
  observacoes: string | null;
  ativo: boolean;
  criado_por: string;
  criado_em: string;
}

export interface MateriaPrimaCreateInput {
  fabricante_id: string;
  nome_tecido: string;
  cor?: string;
  unidade_medida: UnidadeMedida;
  quantidade_recebida: number;
  estoque_minimo?: number | null;
  valor_unitario?: number;
  data_recebimento: string;
  observacoes?: string;
}

export interface MateriaPrimaUpdateInput {
  nome_tecido?: string;
  // null limpa o campo explicitamente; undefined mantém o valor atual.
  cor?: string | null;
  observacoes?: string | null;
  estoque_minimo?: number | null;
  ativo?: boolean;
}

export interface MateriaPrimaFiltros {
  busca?: string;
  fabricanteId?: string;
  ativo?: boolean;
  estoqueBaixo?: boolean;
}
