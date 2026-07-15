import { describe, expect, it } from "vitest";
import { prestadorSchema } from "./prestadorSchema";

const dadosValidos = {
  nome: "Ateliê da Maria",
  contato: "",
  telefone: "",
  email: "",
  tipos_servico: ["costura_externa"] as const,
};

describe("prestadorSchema", () => {
  it("aceita um payload válido", () => {
    expect(prestadorSchema.safeParse(dadosValidos).success).toBe(true);
  });

  it("rejeita nome com menos de 2 caracteres", () => {
    const resultado = prestadorSchema.safeParse({ ...dadosValidos, nome: "A" });
    expect(resultado.success).toBe(false);
  });

  it("rejeita tipos_servico vazio", () => {
    const resultado = prestadorSchema.safeParse({ ...dadosValidos, tipos_servico: [] });
    expect(resultado.success).toBe(false);
  });

  it("rejeita e-mail inválido quando preenchido", () => {
    const resultado = prestadorSchema.safeParse({ ...dadosValidos, email: "nao-e-email" });
    expect(resultado.success).toBe(false);
  });

  it("aceita e-mail vazio (campo opcional)", () => {
    const resultado = prestadorSchema.safeParse({ ...dadosValidos, email: "" });
    expect(resultado.success).toBe(true);
  });
});
