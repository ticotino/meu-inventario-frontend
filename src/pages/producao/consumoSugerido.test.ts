import { describe, expect, it } from "vitest";
import { calcularConsumoSugerido } from "./consumoSugerido";

describe("calcularConsumoSugerido", () => {
  it("lençol 160x250cm com rolo de 250cm consome 1,65m por peça", () => {
    const resultado = calcularConsumoSugerido(
      { largura_cm: 160, comprimento_cm: 250 },
      { largura_rolo_cm: 250 },
      1,
    );
    expect(resultado).toBeCloseTo(1.65);
  });

  it("lençol 250x280cm com rolo de 250cm consome 2,85m por peça", () => {
    const resultado = calcularConsumoSugerido(
      { largura_cm: 250, comprimento_cm: 280 },
      { largura_rolo_cm: 250 },
      1,
    );
    expect(resultado).toBeCloseTo(2.85);
  });

  it("multiplica pelo total de peças produzidas", () => {
    const resultado = calcularConsumoSugerido(
      { largura_cm: 160, comprimento_cm: 250 },
      { largura_rolo_cm: 250 },
      10,
    );
    expect(resultado).toBeCloseTo(16.5);
  });

  it("usa comprimento_cm quando ambas as dimensões batem com a largura do rolo (peça quadrada)", () => {
    const resultado = calcularConsumoSugerido(
      { largura_cm: 250, comprimento_cm: 250 },
      { largura_rolo_cm: 250 },
      1,
    );
    // consumo = (comprimento + 5cm) / 100 = 2.55m
    expect(resultado).toBeCloseTo(2.55);
  });

  it("retorna null quando nenhuma dimensão bate com a largura do rolo", () => {
    const resultado = calcularConsumoSugerido(
      { largura_cm: 160, comprimento_cm: 250 },
      { largura_rolo_cm: 185 },
      1,
    );
    expect(resultado).toBeNull();
  });

  it("retorna null quando o produto não tem dimensões cadastradas", () => {
    const resultado = calcularConsumoSugerido(
      { largura_cm: null, comprimento_cm: null },
      { largura_rolo_cm: 250 },
      1,
    );
    expect(resultado).toBeNull();
  });

  it("retorna null quando a matéria-prima não tem largura de rolo cadastrada", () => {
    const resultado = calcularConsumoSugerido(
      { largura_cm: 160, comprimento_cm: 250 },
      { largura_rolo_cm: null },
      1,
    );
    expect(resultado).toBeNull();
  });

  it("retorna null quando a quantidade produzida é zero ou inválida", () => {
    expect(
      calcularConsumoSugerido({ largura_cm: 160, comprimento_cm: 250 }, { largura_rolo_cm: 250 }, 0),
    ).toBeNull();
    expect(
      calcularConsumoSugerido({ largura_cm: 160, comprimento_cm: 250 }, { largura_rolo_cm: 250 }, NaN),
    ).toBeNull();
  });
});
