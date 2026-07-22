import { describe, expect, it } from "vitest";
import { novoServicoExternoSchema } from "./novoServicoExternoSchema";

const dadosValidos = {
  producao_id: "producao-1",
  prestador_id: "prestador-1",
  tipo: "silk" as const,
  quantidade_enviada: "50",
  data_envio: "2026-07-15",
  data_recebimento_prevista: "",
  valor_cobrado: "",
  nota_fiscal: "",
  observacoes: "",
};

describe("novoServicoExternoSchema", () => {
  it("aceita um payload válido", () => {
    expect(novoServicoExternoSchema.safeParse(dadosValidos).success).toBe(true);
  });

  it("rejeita quantidade_enviada igual a zero", () => {
    const resultado = novoServicoExternoSchema.safeParse({ ...dadosValidos, quantidade_enviada: "0" });
    expect(resultado.success).toBe(false);
  });

  it("rejeita quantidade_enviada negativa", () => {
    const resultado = novoServicoExternoSchema.safeParse({ ...dadosValidos, quantidade_enviada: "-5" });
    expect(resultado.success).toBe(false);
  });

  it("rejeita quantidade_enviada com mais de 3 casas decimais", () => {
    const resultado = novoServicoExternoSchema.safeParse({ ...dadosValidos, quantidade_enviada: "10.1234" });
    expect(resultado.success).toBe(false);
  });

  it("rejeita tipo ausente", () => {
    const semTipo: Record<string, unknown> = { ...dadosValidos };
    delete semTipo.tipo;
    const resultado = novoServicoExternoSchema.safeParse(semTipo);
    expect(resultado.success).toBe(false);
  });

  it("rejeita valor_cobrado negativo", () => {
    const resultado = novoServicoExternoSchema.safeParse({ ...dadosValidos, valor_cobrado: "-1" });
    expect(resultado.success).toBe(false);
  });
});
