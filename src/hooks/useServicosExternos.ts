import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  cancelarServicoExterno,
  createServicoExterno,
  getServicoExterno,
  listServicosExternos,
  receberServicoExterno,
} from "../services/servicosExternosService";
import type { ServicoExternoCreateInput, ServicoExternoFiltros, ReceberServicoExternoInput } from "../types/servicoExterno";

export function useServicosExternos(filtros: ServicoExternoFiltros = {}) {
  return useQuery({
    queryKey: ["servicos-externos", "list", filtros],
    queryFn: () => listServicosExternos(filtros),
    placeholderData: keepPreviousData,
  });
}

export function useServicoExterno(id: string | undefined) {
  return useQuery({
    queryKey: ["servicos-externos", "detalhe", id],
    queryFn: () => getServicoExterno(id!),
    enabled: Boolean(id),
  });
}

// Enviar/receber/cancelar um serviço externo não muda quantas unidades prontas
// a oficina possui (a peça já entrou como entrada_producao) — é só uma camada
// de status de processamento. Mas um serviço externo pode estar vinculado a um
// pedido_item (ver types/servicoExterno.ts), então o detalhe do pedido também
// precisa refletir a mudança de status.
function useInvalidateServicosExternos() {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: ["servicos-externos"] });
    void queryClient.invalidateQueries({ queryKey: ["pedidos"] });
  };
}

export function useCreateServicoExterno() {
  const invalidate = useInvalidateServicosExternos();
  return useMutation({
    mutationFn: (input: ServicoExternoCreateInput) => createServicoExterno(input),
    onSuccess: invalidate,
  });
}

export function useReceberServicoExterno() {
  const invalidate = useInvalidateServicosExternos();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: ReceberServicoExternoInput }) => receberServicoExterno(id, input),
    onSuccess: invalidate,
  });
}

export function useCancelarServicoExterno() {
  const invalidate = useInvalidateServicosExternos();
  return useMutation({
    mutationFn: (id: string) => cancelarServicoExterno(id),
    onSuccess: invalidate,
  });
}
