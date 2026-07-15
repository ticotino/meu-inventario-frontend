import { describe, expect, it } from "vitest";
import {
  diferencaRecebimento,
  excedeQuantidadeEnviada,
  quantidadeEnviadaValida,
  temNoMaximoTresCasas,
} from "./beneficiamentoValidacao";

describe("quantidadeEnviadaValida", () => {
  it("rejeita zero e negativos", () => {
    expect(quantidadeEnviadaValida(0, 100)).toBe(false);
    expect(quantidadeEnviadaValida(-1, 100)).toBe(false);
  });

  it("aceita até o limite produzido, inclusive", () => {
    expect(quantidadeEnviadaValida(100, 100)).toBe(true);
    expect(quantidadeEnviadaValida(100.001, 100)).toBe(false);
  });

  it("aceita valores parciais dentro do limite", () => {
    expect(quantidadeEnviadaValida(50, 100)).toBe(true);
  });
});

describe("excedeQuantidadeEnviada", () => {
  it("perda no processo não é erro", () => {
    expect(excedeQuantidadeEnviada(80, 100)).toBe(false);
  });

  it("receber mais do que foi enviado é erro", () => {
    expect(excedeQuantidadeEnviada(101, 100)).toBe(true);
  });

  it("receber exatamente o que foi enviado não é erro", () => {
    expect(excedeQuantidadeEnviada(100, 100)).toBe(false);
  });
});

describe("diferencaRecebimento", () => {
  it("calcula a perda no processo", () => {
    expect(diferencaRecebimento(100, 80)).toBe(20);
    expect(diferencaRecebimento(100, 100)).toBe(0);
  });
});

describe("temNoMaximoTresCasas", () => {
  it("espelha o decimal(12,3) do banco", () => {
    expect(temNoMaximoTresCasas(12.345)).toBe(true);
    expect(temNoMaximoTresCasas(12.3456)).toBe(false);
    expect(temNoMaximoTresCasas(12)).toBe(true);
  });
});
