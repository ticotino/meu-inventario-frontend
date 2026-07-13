export interface Cliente {
  id: string;
  nome: string;
  contato: string | null;
  telefone: string | null;
  email: string | null;
  ativo: boolean;
  criado_em: string;
}

export interface ClienteInput {
  nome: string;
  contato?: string;
  telefone?: string;
  email?: string;
}

export interface ClienteUpdateInput {
  nome?: string;
  // null limpa o campo explicitamente; undefined mantém o valor atual.
  contato?: string | null;
  telefone?: string | null;
  email?: string | null;
  ativo?: boolean;
}
