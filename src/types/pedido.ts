import type { StatusBeneficiamento, TipoBeneficiamento } from "./beneficiamento";

export type PedidoStatus = "pendente" | "atendido" | "cancelado" | "faturado";
export type PedidoPrazoFiltro = "atrasado" | "vence_hoje" | "proximo";
export type PedidoSituacaoPrazo = "sem_prazo" | "atrasado" | "vence_hoje" | "no_prazo";

// Linha crua da tabela pedidos — é o que POST/ações /pedidos devolvem
// (sem os campos de JOIN, que só existem em list/getById).
export interface PedidoRegistro {
  id: string;
  codigo: string;
  cliente_id: string;
  status: PedidoStatus;
  data_pedido: string;
  data_prevista_entrega: string | null;
  observacoes: string | null;
  criado_por: string;
  criado_em: string;
  atualizado_em: string;
  atendido_em: string | null;
  faturado_em: string | null;
  cancelado_em: string | null;
}

export interface Pedido extends PedidoRegistro {
  cliente_nome: string;
  usuario_nome: string;
  situacao_prazo: PedidoSituacaoPrazo;
  dias_para_entrega: number | null;
  // Derivado (não é um novo valor de `status`): true quando algum item do
  // pedido tem quantidade enviada (soma dos romaneios já gerados) menor que
  // a quantidade pedida — ver design.md, decisão 5. Pré-calculado pelo
  // backend na listagem, que não carrega itens/romaneios por linha; o
  // detalhe do pedido (`PedidoDetalhe`) deriva o mesmo estado no cliente, a
  // partir dos itens e romaneios completos, para apontar quais itens faltam.
  parcialmente_atendido: boolean;
}

// Resumo (JOIN) do beneficiamento em andamento vinculado a um item — só
// aparece quando o item já foi efetivamente enviado a um prestador.
export interface PedidoItemBeneficiamento {
  id: string;
  codigo: string;
  tipo: TipoBeneficiamento;
  status: StatusBeneficiamento;
  prestador_nome: string;
}

export interface PedidoItem {
  id: string;
  produto_id: string;
  // decimal do Postgres chega como string
  quantidade: string;
  codigo: string;
  nome: string;
  instrucao: string | null;
  destino_beneficiamento: "nenhum" | TipoBeneficiamento;
  imagem_referencia_url: string | null;
  // Preenchido quando o item já foi enviado a um prestador (JOIN com beneficiamentos).
  beneficiamento: PedidoItemBeneficiamento | null;
}

export interface PedidoDetalhe extends Pedido {
  itens: PedidoItem[];
  // Um pedido pode gerar mais de um romaneio ao longo do seu ciclo de vida
  // (envio parcial dos itens já prontos quando há urgência) — ver
  // design.md, decisão 5. Vazio enquanto nenhum romaneio tiver sido gerado.
  romaneios: Array<{ id: string; codigo: string; data_saida: string }>;
}

export interface PedidoCreateInput {
  cliente_id: string;
  data_pedido: string;
  data_prevista_entrega: string;
  observacoes?: string;
  itens: Array<{
    produto_id: string;
    quantidade: number;
    instrucao?: string;
    destino_beneficiamento?: "nenhum" | TipoBeneficiamento;
    imagem_referencia_url?: string;
  }>;
}

export interface PedidoFiltros {
  clienteId?: string;
  status?: PedidoStatus;
  prazo?: PedidoPrazoFiltro;
  dataInicio?: string;
  dataFim?: string;
}
