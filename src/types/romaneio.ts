// Linha crua da tabela romaneios — é o que POST /romaneios devolve
// (sem os campos de JOIN, que só existem em list/getById).
export interface RomaneioRegistro {
  id: string;
  codigo: string;
  pedido_id: string;
  data_saida: string;
  criado_por: string;
  criado_em: string;
}

export interface Romaneio extends RomaneioRegistro {
  pedido_codigo: string;
  cliente_nome: string;
  usuario_nome: string;
  volumes_total: number;
}

export interface RomaneioCaixa {
  // decimal do Postgres chega como string
  quantidade_por_caixa: string;
  quantidade_caixas: number;
}

export interface RomaneioItem {
  produto_id: string;
  codigo: string;
  nome: string;
  descricao: string | null;
  caixas: RomaneioCaixa[];
}

export interface RomaneioDetalhe extends Romaneio {
  itens: RomaneioItem[];
}

export interface RomaneioCreateInput {
  pedido_id: string;
  data_saida: string;
  itens: Array<{
    produto_id: string;
    caixas: Array<{
      quantidade_por_caixa: number;
      quantidade_caixas: number;
    }>;
  }>;
}

export interface SugestaoCaixa {
  produto_id: string;
  quantidade_por_caixa: string;
}
