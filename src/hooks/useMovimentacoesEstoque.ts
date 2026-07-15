import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { listMovimentacoesEstoque } from "../services/movimentacoesEstoqueService";
import type { MovimentacoesEstoqueFiltros } from "../types/movimentacaoEstoque";

export function useMovimentacoesEstoque(filtros: MovimentacoesEstoqueFiltros = {}) {
  return useQuery({
    queryKey: ["movimentacoes-estoque", filtros],
    queryFn: () => listMovimentacoesEstoque(filtros),
    placeholderData: keepPreviousData,
  });
}
