import { describe, expect, it } from "vitest";
import { novoBeneficiamentoSchema } from "./novoBeneficiamentoSchema";

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

describe("novoBeneficiamentoSchema", () => {
  it("aceita um payload válido", () => {
    expect(novoBeneficiamentoSchema.safeParse(dadosValidos).success).toBe(true);
  });

  it("rejeita quantidade_enviada igual a zero", () => {
    const resultado = novoBeneficiamentoSchema.safeParse({ ...dadosValidos, quantidade_enviada: "0" });
    expect(resultado.success).toBe(false);
  });

  it("rejeita quantidade_enviada negativa", () => {
    const resultado = novoBeneficiamentoSchema.safeParse({ ...dadosValidos, quantidade_enviada: "-5" });
    expect(resultado.success).toBe(false);
  });

  it("rejeita quantidade_enviada com mais de 3 casas decimais", () => {
    const resultado = novoBeneficiamentoSchema.safeParse({ ...dadosValidos, quantidade_enviada: "10.1234" });
    expect(resultado.success).toBe(false);
  });

  it("rejeita tipo ausente", () => {
    const semTipo: Record<string, unknown> = { ...dadosValidos };
    delete semTipo.tipo;
    const resultado = novoBeneficiamentoSchema.safeParse(semTipo);
    expect(resultado.success).toBe(false);
  });

  it("rejeita valor_cobrado negativo", () => {
    const resultado = novoBeneficiamentoSchema.safeParse({ ...dadosValidos, valor_cobrado: "-1" });
    expect(resultado.success).toBe(false);
  });
});
