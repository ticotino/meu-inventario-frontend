import type { Cliente, ClienteInput, ClienteUpdateInput } from "../types/cliente";
import { api } from "./api";
import type { Envelope } from "./api";

export async function listClientes(busca?: string): Promise<Cliente[]> {
  const params = busca?.trim() ? { busca: busca.trim() } : undefined;
  const { data } = await api.get<Envelope<Cliente[]>>("/clientes", { params });
  return data.data;
}

export async function createCliente(input: ClienteInput): Promise<Cliente> {
  const { data } = await api.post<Envelope<Cliente>>("/clientes", input);
  return data.data;
}

export async function updateCliente(id: string, input: ClienteUpdateInput): Promise<Cliente> {
  const { data } = await api.put<Envelope<Cliente>>(`/clientes/${id}`, input);
  return data.data;
}

export async function deactivateCliente(id: string): Promise<void> {
  await api.delete(`/clientes/${id}`);
}
