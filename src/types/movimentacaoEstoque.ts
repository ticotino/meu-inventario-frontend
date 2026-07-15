import type { UnidadeMedida } from "./materiaPrima";

export const TIPOS_MOVIMENTACAO = [
  "entrada_materia_prima",
  "entrada_producao",
  "entrada_compra",
  "saida_producao",
  "saida_pedido",
  "saida_romaneio",
  "ajuste",
] as const;

export type MovimentacaoTipo = (typeof TIPOS_MOVIMENTACAO)[number];
export type MovimentacaoItemTipo = "materia_prima" | "produto";
export type MovimentacaoDirecao = "entrada" | "saida";

export const MOVIMENTACAO_TIPO_LABEL: Record<MovimentacaoTipo, string> = {
  entrada_materia_prima: "Recebimento inicial",
  entrada_producao: "Entrada de produção",
  entrada_compra: "Entrada de compra",
  saida_producao: "Consumo na produção",
  saida_pedido: "Saída para pedido",
  saida_romaneio: "Saída para romaneio",
  ajuste: "Ajuste de estoque",
};

export interface MovimentacaoEstoque {
  id: string;
  tipo: MovimentacaoTipo;
  direcao: MovimentacaoDirecao;
  item_tipo: MovimentacaoItemTipo;
  item_id: string;
  item_codigo: string;
  item_nome: string;
  item_unidade_medida: UnidadeMedida;
  materia_prima_id: string | null;
  produto_id: string | null;
  quantidade: string;
  saldo_resultante: string;
  referencia_tipo: string | null;
  referencia_id: string | null;
  referencia_codigo: string | null;
  usuario_id: string;
  usuario_nome: string;
  criado_em: string;
}

export interface MovimentacoesEstoquePagina {
  itens: MovimentacaoEstoque[];
  proximo_cursor: string | null;
}

export interface MovimentacoesEstoqueFiltros {
  itemTipo?: MovimentacaoItemTipo;
  itemId?: string;
  tipo?: MovimentacaoTipo;
  dataInicio?: string;
  dataFim?: string;
  cursor?: string;
  limite?: number;
}
