import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createFabricante,
  deactivateFabricante,
  listFabricantes,
  updateFabricante,
} from "../services/fabricantesService";
import type { FabricanteInput, FabricanteUpdateInput } from "../types/fabricante";

export function useFabricantes(busca?: string) {
  return useQuery({
    queryKey: ["fabricantes", "list", busca?.trim() ?? ""],
    queryFn: () => listFabricantes(busca),
    placeholderData: keepPreviousData,
  });
}

function useInvalidateFabricantes() {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: ["fabricantes"] });
    // fabricante_nome aparece na listagem de matérias-primas
    void queryClient.invalidateQueries({ queryKey: ["materias-primas"] });
  };
}

export function useCreateFabricante() {
  const invalidate = useInvalidateFabricantes();
  return useMutation({
    mutationFn: (input: FabricanteInput) => createFabricante(input),
    onSuccess: invalidate,
  });
}

export function useUpdateFabricante() {
  const invalidate = useInvalidateFabricantes();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: FabricanteUpdateInput }) => updateFabricante(id, input),
    onSuccess: invalidate,
  });
}

export function useDeactivateFabricante() {
  const invalidate = useInvalidateFabricantes();
  return useMutation({
    mutationFn: (id: string) => deactivateFabricante(id),
    onSuccess: invalidate,
  });
}
