import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createRomaneio, getRomaneio, getSugestoesCaixa, listRomaneios } from "../services/romaneiosService";
import type { RomaneioCreateInput } from "../types/romaneio";

export function useRomaneios() {
  return useQuery({
    queryKey: ["romaneios", "list"],
    queryFn: listRomaneios,
    placeholderData: keepPreviousData,
  });
}

export function useRomaneio(id: string | undefined) {
  return useQuery({
    queryKey: ["romaneios", "detalhe", id],
    queryFn: () => getRomaneio(id!),
    enabled: Boolean(id),
  });
}

export function useSugestoesCaixa(produtoIds: string[]) {
  return useQuery({
    queryKey: ["romaneios", "sugestoes", [...produtoIds].sort()],
    queryFn: () => getSugestoesCaixa(produtoIds),
    enabled: produtoIds.length > 0,
  });
}

export function useCreateRomaneio() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: RomaneioCreateInput) => createRomaneio(input),
    onSuccess: () => {
      // Gerar romaneio marca o pedido como atendido (muda a contagem do dashboard).
      void queryClient.invalidateQueries({ queryKey: ["romaneios"] });
      void queryClient.invalidateQueries({ queryKey: ["pedidos"] });
      void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}
