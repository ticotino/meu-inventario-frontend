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
  // Reservas já registradas para o recebimento desta solicitação — vazio
  // enquanto não houver recebimento ou nenhuma reserva tiver sido feita.
  reservas: ReservaMateriaPrima[];
}

export interface CriarSolicitacaoCompraInput {
  materia_prima_id: string;
  quantidade_solicitada: number;
  observacoes?: string;
}

// Reserva de parte (ou toda) uma remessa recebida para um pedido pendente
// específico — decisão 100% humana (ver design.md, decisão 4), não um
// algoritmo de alocação. Uma remessa pode gerar várias reservas, uma por
// pedido atendido.
export interface ReservaMateriaPrima {
  id: string;
  recebimento_id: string;
  pedido_id: string;
  pedido_codigo: string;
  // decimal do Postgres chega como string
  quantidade_reservada: string;
  criado_em: string;
}

// Resumo (JOIN) de uma reserva no formato usado no detalhe do pedido: além
// da quantidade, traz o tecido e a data do recebimento associado — dados que
// `ReservaMateriaPrima` não carrega porque, do lado do recebimento, já vivem
// no contexto da tela (a matéria-prima e a data já estão visíveis ali).
export interface ReservaMateriaPrimaPedido {
  id: string;
  recebimento_id: string;
  materia_prima_id: string;
  codigo: string;
  nome_tecido: string;
  cor: string | null;
  unidade_medida: UnidadeMedida;
  // decimal do Postgres chega como string
  quantidade_reservada: string;
  data_recebimento: string;
}

export interface ReceberSolicitacaoCompraInput {
  id: string;
  quantidade_recebida: number;
  // Opcional: reserva parte ou toda a quantidade recebida para pedido(s)
  // pendente(s) específicos, no mesmo ato do recebimento. O que não for
  // reservado permanece como estoque livre (ver spec: "Recebimento sem
  // reserva").
  reservas?: Array<{ pedido_id: string; quantidade_reservada: number }>;
  // Nota fiscal e valor desta remessa específica — mesmo padrão já usado em
  // `ReceberBeneficiamentoInput` (nota_fiscal + valor_cobrado). O valor pode
  // variar entre remessas do mesmo tecido, então não sobrescreve o
  // `valor_unitario` do cadastro inicial da matéria-prima; fica associado a
  // este recebimento (ver design.md, decisão 6).
  nota_fiscal?: string;
  valor_unitario?: number;
}
