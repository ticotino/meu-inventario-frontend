export interface Produto {
  id: string;
  codigo: string;
  nome: string;
  descricao: string | null;
  // decimal do Postgres chega como string
  quantidade_disponivel: string;
  ativo: boolean;
  criado_por: string;
  criado_em: string;
}

export interface ProdutoCreateInput {
  nome: string;
  descricao?: string;
}

export interface ProdutoUpdateInput {
  nome?: string;
  // null limpa o campo explicitamente; undefined mantém o valor atual.
  descricao?: string | null;
  ativo?: boolean;
}

export interface ProdutoFiltros {
  busca?: string;
  ativo?: boolean;
}
