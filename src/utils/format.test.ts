import { describe, expect, it } from "vitest";
import { formatarMoeda, formatarQuantidade } from "./format";

describe("formatarQuantidade", () => {
  it("formata singular e plural conforme a unidade", () => {
    expect(formatarQuantidade(1, "unidade")).toBe("1 unidade");
    expect(formatarQuantidade(2, "unidade")).toBe("2 unidades");
  });

  it("retorna em-dash para valor não numérico", () => {
    expect(formatarQuantidade("abc" as unknown as string, "unidade")).toBe("—");
  });
});

describe("formatarMoeda", () => {
  it("retorna em-dash para valor nulo ou vazio", () => {
    expect(formatarMoeda(null)).toBe("—");
    expect(formatarMoeda("")).toBe("—");
  });
});
