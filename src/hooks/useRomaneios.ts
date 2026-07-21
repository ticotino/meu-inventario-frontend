import { keepPreviousData, useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
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

// Busca o detalhe completo (itens + caixas) de vários romaneios de uma vez —
// usado para somar quanto já foi enviado por produto em todos os romaneios
// de um pedido (envio parcial, ver design.md decisão 5). Reaproveita a mesma
// queryKey de `useRomaneio`, então um romaneio já visitado não é buscado de novo.
export function useRomaneiosDetalhe(ids: string[]) {
  return useQueries({
    queries: ids.map((id) => ({
      queryKey: ["romaneios", "detalhe", id],
      queryFn: () => getRomaneio(id),
    })),
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
