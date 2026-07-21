import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  cancelarSolicitacaoCompra,
  criarSolicitacaoCompra,
  listCompras,
  listReservasPedido,
  receberSolicitacaoCompra,
} from "../services/comprasService";
import type { CriarSolicitacaoCompraInput, ReceberSolicitacaoCompraInput } from "../types/compra";

export function useCompras() {
  return useQuery({ queryKey: ["compras"], queryFn: listCompras });
}

// Reservas de matéria-prima registradas para um pedido específico — cada
// item de `useCompras()` já traz consigo as reservas do seu próprio
// recebimento (campo `reservas`); este hook resolve o lado inverso, usado no
// detalhe do pedido.
export function useReservasPedido(pedidoId: string | undefined) {
  return useQuery({
    queryKey: ["compras", "reservas-pedido", pedidoId],
    queryFn: () => listReservasPedido(pedidoId!),
    enabled: Boolean(pedidoId),
  });
}

function useInvalidarCompras() {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: ["compras"] });
    void queryClient.invalidateQueries({ queryKey: ["materias-primas"] });
    void queryClient.invalidateQueries({ queryKey: ["movimentacoes-estoque"] });
    void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    // O recebimento pode ter criado reservas novas para qualquer pedido.
    void queryClient.invalidateQueries({ queryKey: ["compras", "reservas-pedido"] });
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
