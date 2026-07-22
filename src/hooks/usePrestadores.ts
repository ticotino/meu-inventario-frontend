import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createPrestador,
  deactivatePrestador,
  listPrestadores,
  updatePrestador,
} from "../services/prestadoresService";
import type { PrestadorInput, PrestadorUpdateInput } from "../types/prestador";

export function usePrestadores(busca?: string) {
  return useQuery({
    queryKey: ["prestadores", "list", busca?.trim() ?? ""],
    queryFn: () => listPrestadores(busca),
    placeholderData: keepPreviousData,
  });
}

function useInvalidatePrestadores() {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: ["prestadores"] });
    // prestador_nome aparece na listagem de serviços externos
    void queryClient.invalidateQueries({ queryKey: ["servicos-externos"] });
  };
}

export function useCreatePrestador() {
  const invalidate = useInvalidatePrestadores();
  return useMutation({
    mutationFn: (input: PrestadorInput) => createPrestador(input),
    onSuccess: invalidate,
  });
}

export function useUpdatePrestador() {
  const invalidate = useInvalidatePrestadores();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: PrestadorUpdateInput }) => updatePrestador(id, input),
    onSuccess: invalidate,
  });
}

export function useDeactivatePrestador() {
  const invalidate = useInvalidatePrestadores();
  return useMutation({
    mutationFn: (id: string) => deactivatePrestador(id),
    onSuccess: invalidate,
  });
}
