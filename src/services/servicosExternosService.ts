import type {
  ServicoExterno,
  ServicoExternoCreateInput,
  ServicoExternoFiltros,
  ServicoExternoRegistro,
  ReceberServicoExternoInput,
} from "../types/servicoExterno";
import { api } from "./api";
import type { Envelope } from "./api";

export async function listServicosExternos(filtros: ServicoExternoFiltros = {}): Promise<ServicoExterno[]> {
  const params: Record<string, string> = {};
  if (filtros.producaoId) params.producao_id = filtros.producaoId;
  if (filtros.prestadorId) params.prestador_id = filtros.prestadorId;
  if (filtros.tipo) params.tipo = filtros.tipo;
  if (filtros.status) params.status = filtros.status;
  const { data } = await api.get<Envelope<ServicoExterno[]>>("/servicos-externos", { params });
  return data.data;
}

export async function getServicoExterno(id: string): Promise<ServicoExterno> {
  const { data } = await api.get<Envelope<ServicoExterno>>(`/servicos-externos/${id}`);
  return data.data;
}

export async function createServicoExterno(input: ServicoExternoCreateInput): Promise<ServicoExternoRegistro> {
  const { data } = await api.post<Envelope<ServicoExternoRegistro>>("/servicos-externos", input);
  return data.data;
}

export async function receberServicoExterno(
  id: string,
  input: ReceberServicoExternoInput,
): Promise<ServicoExternoRegistro> {
  const { data } = await api.post<Envelope<ServicoExternoRegistro>>(`/servicos-externos/${id}/receber`, input);
  return data.data;
}

export async function cancelarServicoExterno(id: string): Promise<ServicoExternoRegistro> {
  const { data } = await api.post<Envelope<ServicoExternoRegistro>>(`/servicos-externos/${id}/cancelar`);
  return data.data;
}
