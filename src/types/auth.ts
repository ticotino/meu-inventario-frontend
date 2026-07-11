export type Papel = "admin" | "funcionario";

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  papel: Papel;
}
