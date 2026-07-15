import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  cancelarBeneficiamento,
  createBeneficiamento,
  getBeneficiamento,
  listBeneficiamentos,
  receberBeneficiamento,
} from "../services/beneficiamentosService";
import type { BeneficiamentoCreateInput, BeneficiamentoFiltros, ReceberBeneficiamentoInput } from "../types/beneficiamento";

export function useBeneficiamentos(filtros: BeneficiamentoFiltros = {}) {
  return useQuery({
    queryKey: ["beneficiamentos", "list", filtros],
    queryFn: () => listBeneficiamentos(filtros),
    placeholderData: keepPreviousData,
  });
}

export function useBeneficiamento(id: string | undefined) {
  return useQuery({
    queryKey: ["beneficiamentos", "detalhe", id],
    queryFn: () => getBeneficiamento(id!),
    enabled: Boolean(id),
  });
}

// Enviar/receber/cancelar um beneficiamento não muda quantas unidades prontas
// a oficina possui (a peça já entrou como entrada_producao) — é só uma camada
// de status de processamento, então só invalidamos o próprio recurso.
function useInvalidateBeneficiamentos() {
  const queryClient = useQueryClient();
  return () => void queryClient.invalidateQueries({ queryKey: ["beneficiamentos"] });
}

export function useCreateBeneficiamento() {
  const invalidate = useInvalidateBeneficiamentos();
  return useMutation({
    mutationFn: (input: BeneficiamentoCreateInput) => createBeneficiamento(input),
    onSuccess: invalidate,
  });
}

export function useReceberBeneficiamento() {
  const invalidate = useInvalidateBeneficiamentos();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: ReceberBeneficiamentoInput }) => receberBeneficiamento(id, input),
    onSuccess: invalidate,
  });
}

export function useCancelarBeneficiamento() {
  const invalidate = useInvalidateBeneficiamentos();
  return useMutation({
    mutationFn: (id: string) => cancelarBeneficiamento(id),
    onSuccess: invalidate,
  });
}
