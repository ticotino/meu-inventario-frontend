export const TIPOS_SERVICO_PRESTADOR = ["costura_externa", "silk", "bordado"] as const;
export type TipoServicoPrestador = (typeof TIPOS_SERVICO_PRESTADOR)[number];

export const TIPO_SERVICO_PRESTADOR_LABEL: Record<TipoServicoPrestador, string> = {
  costura_externa: "Costura externa",
  silk: "Silk",
  bordado: "Bordado",
};

export interface Prestador {
  id: string;
  nome: string;
  contato: string | null;
  telefone: string | null;
  email: string | null;
  tipos_servico: TipoServicoPrestador[];
  ativo: boolean;
  criado_em: string;
}

export interface PrestadorInput {
  nome: string;
  contato?: string;
  telefone?: string;
  email?: string;
  tipos_servico: TipoServicoPrestador[];
}

export interface PrestadorUpdateInput {
  nome?: string;
  // null limpa o campo explicitamente; undefined mantém o valor atual.
  contato?: string | null;
  telefone?: string | null;
  email?: string | null;
  tipos_servico?: TipoServicoPrestador[];
  ativo?: boolean;
}
