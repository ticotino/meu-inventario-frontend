import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createMateriaPrima,
  getMateriaPrima,
  listMateriasPrimas,
  updateMateriaPrima,
} from "../services/materiasPrimasService";
import type {
  MateriaPrimaCreateInput,
  MateriaPrimaFiltros,
  MateriaPrimaUpdateInput,
} from "../types/materiaPrima";

export function useMateriasPrimas(filtros: MateriaPrimaFiltros = {}) {
  return useQuery({
    queryKey: [
      "materias-primas",
      "list",
      { busca: filtros.busca?.trim() ?? "", fabricanteId: filtros.fabricanteId ?? "", ativo: filtros.ativo ?? null },
    ],
    queryFn: () => listMateriasPrimas(filtros),
    placeholderData: keepPreviousData,
  });
}

export function useMateriaPrima(id: string | undefined) {
  return useQuery({
    queryKey: ["materias-primas", "detalhe", id],
    queryFn: () => getMateriaPrima(id!),
    enabled: Boolean(id),
  });
}

// create/update do backend retornam a linha sem fabricante_nome (o JOIN só existe
// em list/getById), então invalidamos em vez de semear o cache com dado incompleto.
export function useCreateMateriaPrima() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: MateriaPrimaCreateInput) => createMateriaPrima(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["materias-primas"] });
    },
  });
}

export function useUpdateMateriaPrima() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: MateriaPrimaUpdateInput }) => updateMateriaPrima(id, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["materias-primas"] });
    },
  });
}
