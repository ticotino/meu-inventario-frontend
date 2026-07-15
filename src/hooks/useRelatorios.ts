import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  getRelatorioConsumo,
  getRelatorioPedidos,
  getRelatorioProducao,
} from "../services/relatoriosService";
import type {
  RelatorioConsumoFiltros,
  RelatorioPedidosFiltros,
  RelatorioProducaoFiltros,
} from "../types/relatorio";

export function useRelatorioConsumo(filtros: RelatorioConsumoFiltros) {
  return useQuery({
    queryKey: ["relatorios", "consumo", filtros],
    queryFn: () => getRelatorioConsumo(filtros),
    placeholderData: keepPreviousData,
  });
}

export function useRelatorioProducao(filtros: RelatorioProducaoFiltros) {
  return useQuery({
    queryKey: ["relatorios", "producao", filtros],
    queryFn: () => getRelatorioProducao(filtros),
    placeholderData: keepPreviousData,
  });
}

export function useRelatorioPedidos(filtros: RelatorioPedidosFiltros) {
  return useQuery({
    queryKey: ["relatorios", "pedidos", filtros],
    queryFn: () => getRelatorioPedidos(filtros),
    placeholderData: keepPreviousData,
  });
}
