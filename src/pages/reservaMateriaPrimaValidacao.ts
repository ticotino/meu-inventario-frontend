import type { UnidadeMedida } from "../types/materiaPrima";
import { formatarQuantidade } from "../utils/format";

export interface LinhaReserva {
  pedido_id: string;
  quantidade: string;
}

export interface ReservaValidada {
  pedido_id: string;
  quantidade_reservada: number;
}

export type ResultadoValidacaoReservas =
  { ok: true; reservas: ReservaValidada[] } | { ok: false; erro: string };

// Aceita tanto vírgula quanto ponto decimal (teclado numérico de celular
// costuma inserir vírgula) e rejeita zero/negativo — usado tanto para a
// quantidade recebida quanto para cada linha de reserva.
export function numeroPositivo(valor: string): number | null {
  const numero = Number(valor.replace(",", "."));
  return Number.isFinite(numero) && numero > 0 ? numero : null;
}

// Valida as linhas de reserva preenchidas no recebimento de uma remessa de
// matéria-prima: cada linha precisa de um pedido selecionado (sem repetição)
// e uma quantidade maior que zero, e a soma de todas as linhas não pode
// exceder a quantidade efetivamente recebida — o que sobrar continua como
// estoque livre (ver design.md, decisão 4, e spec pedido-reserva-materia-prima).
// Retorna o primeiro erro encontrado, na ordem das linhas.
export function validarReservas(
  linhas: LinhaReserva[],
  quantidadeRecebida: number,
  unidadeMedida: UnidadeMedida,
): ResultadoValidacaoReservas {
  const vistos = new Set<string>();
  const construida: ReservaValidada[] = [];
  let somaReservada = 0;

  for (const [i, linha] of linhas.entries()) {
    if (!linha.pedido_id) {
      return { ok: false, erro: `Selecione o pedido na linha ${i + 1} da reserva.` };
    }
    if (vistos.has(linha.pedido_id)) {
      return { ok: false, erro: `Pedido repetido na linha ${i + 1} da reserva.` };
    }
    vistos.add(linha.pedido_id);

    const quantidadeReservada = numeroPositivo(linha.quantidade);
    if (quantidadeReservada === null) {
      return { ok: false, erro: `Informe uma quantidade maior que zero na linha ${i + 1} da reserva.` };
    }

    somaReservada += quantidadeReservada;
    construida.push({ pedido_id: linha.pedido_id, quantidade_reservada: quantidadeReservada });
  }

  if (somaReservada > quantidadeRecebida) {
    return {
      ok: false,
      erro: `A soma das reservas (${formatarQuantidade(somaReservada, unidadeMedida)}) não pode ser maior que a quantidade recebida (${formatarQuantidade(quantidadeRecebida, unidadeMedida)}).`,
    };
  }

  return { ok: true, reservas: construida };
}
