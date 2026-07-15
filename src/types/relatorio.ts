import type { UnidadeMedida } from "./materiaPrima";

export interface RelatorioPeriodo {
  inicio: string;
  fim: string;
}

export interface RelatorioConsumoFiltros extends RelatorioPeriodo {
  materiaPrimaId?: string;
  produtoId?: string;
}

export interface RelatorioProducaoFiltros extends RelatorioPeriodo {
  produtoId?: string;
}

export interface RelatorioPedidosFiltros extends RelatorioPeriodo {
  clienteId?: string;
  produtoId?: string;
}

export interface RelatorioConsumoItem {
  materia_prima_id: string;
  codigo: string;
  nome_tecido: string;
  cor: string | null;
  unidade_medida: UnidadeMedida;
  quantidade_consumida: string;
  custo_total: string | null;
  total_producoes: number;
}

export interface RelatorioProducaoItem {
  produto_id: string;
  codigo: string;
  nome: string;
  quantidade_produzida: string;
  custo_total: string | null;
  total_producoes: number;
}

export interface RelatorioPedidosItem {
  produto_id: string;
  codigo: string;
  nome: string;
  quantidade_faturada: string;
  total_pedidos: number;
}
