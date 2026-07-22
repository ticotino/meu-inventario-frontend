export interface Produto {
  id: string;
  codigo: string;
  nome: string;
  descricao: string | null;
  // decimal do Postgres chega como string
  quantidade_disponivel: string;
  estoque_minimo: string | null;
  // dimensões da peça em centímetros — usadas para sugerir o consumo de
  // matéria-prima na Produção (ver calcularConsumoSugerido).
  largura_cm: string | null;
  comprimento_cm: string | null;
  estoque_baixo: boolean;
  ativo: boolean;
  criado_por: string;
  criado_em: string;
}

export interface ProdutoCreateInput {
  nome: string;
  descricao?: string;
  estoque_minimo?: number | null;
  largura_cm?: number | null;
  comprimento_cm?: number | null;
}

export interface ProdutoUpdateInput {
  nome?: string;
  // null limpa o campo explicitamente; undefined mantém o valor atual.
  descricao?: string | null;
  estoque_minimo?: number | null;
  largura_cm?: number | null;
  comprimento_cm?: number | null;
  ativo?: boolean;
}

export interface ProdutoFiltros {
  busca?: string;
  ativo?: boolean;
  estoqueBaixo?: boolean;
}
