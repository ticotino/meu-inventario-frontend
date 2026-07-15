import type {
  Beneficiamento,
  BeneficiamentoCreateInput,
  BeneficiamentoFiltros,
  BeneficiamentoRegistro,
  ReceberBeneficiamentoInput,
} from "../types/beneficiamento";
import { api } from "./api";
import type { Envelope } from "./api";

export async function listBeneficiamentos(filtros: BeneficiamentoFiltros = {}): Promise<Beneficiamento[]> {
  const params: Record<string, string> = {};
  if (filtros.producaoId) params.producao_id = filtros.producaoId;
  if (filtros.prestadorId) params.prestador_id = filtros.prestadorId;
  if (filtros.tipo) params.tipo = filtros.tipo;
  if (filtros.status) params.status = filtros.status;
  const { data } = await api.get<Envelope<Beneficiamento[]>>("/beneficiamentos", { params });
  return data.data;
}

export async function getBeneficiamento(id: string): Promise<Beneficiamento> {
  const { data } = await api.get<Envelope<Beneficiamento>>(`/beneficiamentos/${id}`);
  return data.data;
}

export async function createBeneficiamento(input: BeneficiamentoCreateInput): Promise<BeneficiamentoRegistro> {
  const { data } = await api.post<Envelope<BeneficiamentoRegistro>>("/beneficiamentos", input);
  return data.data;
}

export async function receberBeneficiamento(
  id: string,
  input: ReceberBeneficiamentoInput,
): Promise<BeneficiamentoRegistro> {
  const { data } = await api.post<Envelope<BeneficiamentoRegistro>>(`/beneficiamentos/${id}/receber`, input);
  return data.data;
}

export async function cancelarBeneficiamento(id: string): Promise<BeneficiamentoRegistro> {
  const { data } = await api.post<Envelope<BeneficiamentoRegistro>>(`/beneficiamentos/${id}/cancelar`);
  return data.data;
}
