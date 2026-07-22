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

  it("metro sempre exibe no mínimo 2 casas decimais, mesmo para valor inteiro", () => {
    expect(formatarQuantidade(30, "metro")).toBe("30,00 m");
    expect(formatarQuantidade("30", "metro")).toBe("30,00 m");
  });

  it("metro mantém a 3ª casa decimal quando o valor realmente tiver essa precisão", () => {
    expect(formatarQuantidade(1.655, "metro")).toBe("1,655 m");
  });

  it("metro com 1 casa decimal ganha o zero à direita", () => {
    expect(formatarQuantidade(2.5, "metro")).toBe("2,50 m");
  });

  it("unidades que não são metro continuam sem mínimo de casas decimais", () => {
    expect(formatarQuantidade(30, "kg")).toBe("30 kg");
    expect(formatarQuantidade(30, "rolo")).toBe("30 rolos");
  });
});

describe("formatarMoeda", () => {
  it("retorna em-dash para valor nulo ou vazio", () => {
    expect(formatarMoeda(null)).toBe("—");
    expect(formatarMoeda("")).toBe("—");
  });
});
