import type { UnidadeMedida } from "./materiaPrima";

// Linha crua da tabela producoes — é o que POST /producoes devolve
// (sem os campos de JOIN, que só existem em list/getById).
export interface ProducaoRegistro {
  id: string;
  codigo: string;
  produto_id: string;
  // decimal do Postgres chega como string
  quantidade_produzida: string;
  data_producao: string;
  observacoes: string | null;
  criado_por: string;
  criado_em: string;
}

export interface Producao extends ProducaoRegistro {
  produto_nome: string;
  produto_codigo: string;
  usuario_nome: string;
}

export interface ProducaoItem {
  materia_prima_id: string;
  quantidade_consumida: string;
  codigo: string;
  nome_tecido: string;
  cor: string | null;
  unidade_medida: UnidadeMedida;
}

export interface ProducaoDetalhe extends Producao {
  itens: ProducaoItem[];
}

export interface ProducaoCreateInput {
  produto_id: string;
  quantidade_produzida: number;
  data_producao: string;
  observacoes?: string;
  itens: Array<{
    materia_prima_id: string;
    quantidade_consumida: number;
  }>;
}

export interface ProducaoFiltros {
  produtoId?: string;
}
