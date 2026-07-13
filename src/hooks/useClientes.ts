import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createCliente, deactivateCliente, listClientes, updateCliente } from "../services/clientesService";
import type { ClienteInput, ClienteUpdateInput } from "../types/cliente";

export function useClientes(busca?: string) {
  return useQuery({
    queryKey: ["clientes", "list", busca?.trim() ?? ""],
    queryFn: () => listClientes(busca),
    placeholderData: keepPreviousData,
  });
}

function useInvalidateClientes() {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: ["clientes"] });
    // cliente_nome aparece na listagem de pedidos
    void queryClient.invalidateQueries({ queryKey: ["pedidos"] });
  };
}

export function useCreateCliente() {
  const invalidate = useInvalidateClientes();
  return useMutation({
    mutationFn: (input: ClienteInput) => createCliente(input),
    onSuccess: invalidate,
  });
}

export function useUpdateCliente() {
  const invalidate = useInvalidateClientes();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: ClienteUpdateInput }) => updateCliente(id, input),
    onSuccess: invalidate,
  });
}

export function useDeactivateCliente() {
  const invalidate = useInvalidateClientes();
  return useMutation({
    mutationFn: (id: string) => deactivateCliente(id),
    onSuccess: invalidate,
  });
}
