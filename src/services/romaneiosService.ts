import type {
  Romaneio,
  RomaneioCreateInput,
  RomaneioDetalhe,
  RomaneioRegistro,
  SugestaoCaixa,
} from "../types/romaneio";
import { api } from "./api";
import type { Envelope } from "./api";

export async function listRomaneios(): Promise<Romaneio[]> {
  const { data } = await api.get<Envelope<Romaneio[]>>("/romaneios");
  return data.data;
}

export async function getRomaneio(id: string): Promise<RomaneioDetalhe> {
  const { data } = await api.get<Envelope<RomaneioDetalhe>>(`/romaneios/${id}`);
  return data.data;
}

export async function getSugestoesCaixa(produtoIds: string[]): Promise<SugestaoCaixa[]> {
  if (produtoIds.length === 0) return [];
  const { data } = await api.get<Envelope<SugestaoCaixa[]>>("/romaneios/sugestoes", {
    params: { produto_ids: produtoIds.join(",") },
  });
  return data.data;
}

export async function createRomaneio(input: RomaneioCreateInput): Promise<RomaneioRegistro> {
  const { data } = await api.post<Envelope<RomaneioRegistro>>("/romaneios", input);
  return data.data;
}
