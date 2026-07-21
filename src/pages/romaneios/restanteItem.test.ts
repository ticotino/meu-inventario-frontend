import { describe, expect, it } from "vitest";
import { calcularRestante, fechaComRestante, somaCaixas } from "./restanteItem";

describe("somaCaixas", () => {
  it("soma quantidade_por_caixa x quantidade_caixas de várias linhas", () => {
    expect(
      somaCaixas([
        { quantidade_por_caixa: "10", quantidade_caixas: "2" },
        { quantidade_por_caixa: "5", quantidade_caixas: "1" },
      ]),
    ).toBe(25);
  });

  it("retorna 0 quando não há caixas", () => {
    expect(somaCaixas(undefined)).toBe(0);
    expect(somaCaixas([])).toBe(0);
  });

  it("ignora linhas com valores ainda não numéricos (campo em edição)", () => {
    expect(
      somaCaixas([
        { quantidade_por_caixa: "10", quantidade_caixas: "2" },
        { quantidade_por_caixa: "", quantidade_caixas: "" },
      ]),
    ).toBe(20);
  });
});

describe("fechaComRestante", () => {
  it("fecha quando os valores são exatamente iguais", () => {
    expect(fechaComRestante(20, 20)).toBe(true);
  });

  it("não fecha quando sobra ou falta quantidade", () => {
    expect(fechaComRestante(19, 20)).toBe(false);
    expect(fechaComRestante(21, 20)).toBe(false);
  });

  it("compara arredondado a 3 casas, espelhando o decimal(12,3) do banco", () => {
    expect(fechaComRestante(19.9999, 20)).toBe(true);
    expect(fechaComRestante(19.994, 20)).toBe(false);
  });
});

describe("calcularRestante", () => {
  it("retorna a quantidade pedida quando nada foi enviado ainda", () => {
    expect(calcularRestante(100, 0)).toBe(100);
  });

  it("subtrai o que já foi enviado em romaneios anteriores", () => {
    expect(calcularRestante(100, 60)).toBe(40);
  });

  it("nunca retorna negativo quando o enviado excede o pedido (folga de arredondamento)", () => {
    expect(calcularRestante(100, 100.002)).toBe(0);
  });

  it("retorna 0 quando o item já foi totalmente enviado", () => {
    expect(calcularRestante(50, 50)).toBe(0);
  });
});
