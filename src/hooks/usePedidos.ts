import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  atenderPedido,
  cancelarPedido,
  createPedido,
  faturarPedido,
  getPedido,
  listPedidos,
} from "../services/pedidosService";
import type { PedidoCreateInput, PedidoFiltros } from "../types/pedido";

export function usePedidos(filtros: PedidoFiltros = {}) {
  return useQuery({
    queryKey: ["pedidos", "list", { clienteId: filtros.clienteId ?? "", status: filtros.status ?? "" }],
    queryFn: () => listPedidos(filtros),
    placeholderData: keepPreviousData,
  });
}

export function usePedido(id: string | undefined) {
  return useQuery({
    queryKey: ["pedidos", "detalhe", id],
    queryFn: () => getPedido(id!),
    enabled: Boolean(id),
  });
}

export function useCreatePedido() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: PedidoCreateInput) => createPedido(input),
    onSuccess: () => {
      // O pedido consome saldo dos produtos na criação, além das métricas.
      void queryClient.invalidateQueries({ queryKey: ["pedidos"] });
      void queryClient.invalidateQueries({ queryKey: ["produtos"] });
      void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useCancelarPedido() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => cancelarPedido(id),
    onSuccess: () => {
      // Cancelar devolve o saldo consumido pelo pedido.
      void queryClient.invalidateQueries({ queryKey: ["pedidos"] });
      void queryClient.invalidateQueries({ queryKey: ["produtos"] });
      void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useAtenderPedido() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => atenderPedido(id),
    onSuccess: () => {
      // Atender tira o pedido da contagem de "pedidos pendentes" do dashboard.
      void queryClient.invalidateQueries({ queryKey: ["pedidos"] });
      void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useFaturarPedido() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => faturarPedido(id),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["pedidos"] }),
  });
}
