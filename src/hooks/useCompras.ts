import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  cancelarSolicitacaoCompra,
  criarSolicitacaoCompra,
  listCompras,
  receberSolicitacaoCompra,
} from "../services/comprasService";
import type { CriarSolicitacaoCompraInput, ReceberSolicitacaoCompraInput } from "../types/compra";

export function useCompras() {
  return useQuery({ queryKey: ["compras"], queryFn: listCompras });
}

function useInvalidarCompras() {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: ["compras"] });
    void queryClient.invalidateQueries({ queryKey: ["materias-primas"] });
    void queryClient.invalidateQueries({ queryKey: ["movimentacoes-estoque"] });
    void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
  };
}

export function useCriarSolicitacaoCompra() {
  const invalidar = useInvalidarCompras();
  return useMutation({
    mutationFn: (input: CriarSolicitacaoCompraInput) => criarSolicitacaoCompra(input),
    onSuccess: invalidar,
  });
}

export function useReceberSolicitacaoCompra() {
  const invalidar = useInvalidarCompras();
  return useMutation({
    mutationFn: (input: ReceberSolicitacaoCompraInput) => receberSolicitacaoCompra(input),
    onSuccess: invalidar,
  });
}

export function useCancelarSolicitacaoCompra() {
  const invalidar = useInvalidarCompras();
  return useMutation({
    mutationFn: (id: string) => cancelarSolicitacaoCompra(id),
    onSuccess: invalidar,
  });
}
