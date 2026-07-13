import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createProducao, getProducao, listProducoes } from "../services/producoesService";
import type { ProducaoCreateInput, ProducaoFiltros } from "../types/producao";

export function useProducoes(filtros: ProducaoFiltros = {}) {
  return useQuery({
    queryKey: ["producoes", "list", { produtoId: filtros.produtoId ?? "" }],
    queryFn: () => listProducoes(filtros),
    placeholderData: keepPreviousData,
  });
}

export function useProducao(id: string | undefined) {
  return useQuery({
    queryKey: ["producoes", "detalhe", id],
    queryFn: () => getProducao(id!),
    enabled: Boolean(id),
  });
}

export function useCreateProducao() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ProducaoCreateInput) => createProducao(input),
    onSuccess: () => {
      // A produção altera saldos de MPs e do produto, além das métricas.
      void queryClient.invalidateQueries({ queryKey: ["producoes"] });
      void queryClient.invalidateQueries({ queryKey: ["produtos"] });
      void queryClient.invalidateQueries({ queryKey: ["materias-primas"] });
      void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}
