import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createProduto, getProduto, listProdutos, updateProduto } from "../services/produtosService";
import type { ProdutoCreateInput, ProdutoFiltros, ProdutoUpdateInput } from "../types/produto";

export function useProdutos(filtros: ProdutoFiltros = {}) {
  return useQuery({
    queryKey: [
      "produtos",
      "list",
      {
        busca: filtros.busca?.trim() ?? "",
        ativo: filtros.ativo ?? null,
        estoqueBaixo: filtros.estoqueBaixo ?? null,
      },
    ],
    queryFn: () => listProdutos(filtros),
    placeholderData: keepPreviousData,
  });
}

export function useProduto(id: string | undefined) {
  return useQuery({
    queryKey: ["produtos", "detalhe", id],
    queryFn: () => getProduto(id!),
    enabled: Boolean(id),
  });
}

function useInvalidateProdutos() {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: ["produtos"] });
    // produto_nome aparece na listagem de produções
    void queryClient.invalidateQueries({ queryKey: ["producoes"] });
  };
}

export function useCreateProduto() {
  const invalidate = useInvalidateProdutos();
  return useMutation({
    mutationFn: (input: ProdutoCreateInput) => createProduto(input),
    onSuccess: invalidate,
  });
}

export function useUpdateProduto() {
  const invalidate = useInvalidateProdutos();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: ProdutoUpdateInput }) => updateProduto(id, input),
    onSuccess: invalidate,
  });
}
