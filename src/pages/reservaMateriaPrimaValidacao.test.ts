import { describe, expect, it } from "vitest";
import { numeroPositivo, validarReservas } from "./reservaMateriaPrimaValidacao";

describe("numeroPositivo", () => {
  it("aceita vírgula como separador decimal", () => {
    expect(numeroPositivo("10,5")).toBe(10.5);
  });

  it("rejeita zero e negativos", () => {
    expect(numeroPositivo("0")).toBeNull();
    expect(numeroPositivo("-1")).toBeNull();
  });

  it("rejeita valores não numéricos", () => {
    expect(numeroPositivo("abc")).toBeNull();
  });
});

describe("validarReservas", () => {
  it("aceita reserva integral para um único pedido", () => {
    const resultado = validarReservas([{ pedido_id: "pedido-1", quantidade: "100" }], 100, "metro");
    expect(resultado).toEqual({ ok: true, reservas: [{ pedido_id: "pedido-1", quantidade_reservada: 100 }] });
  });

  it("aceita reserva parcial dividida entre vários pedidos, dentro do recebido", () => {
    const resultado = validarReservas(
      [
        { pedido_id: "pedido-1", quantidade: "40" },
        { pedido_id: "pedido-2", quantidade: "30" },
      ],
      100,
      "metro",
    );
    expect(resultado).toEqual({
      ok: true,
      reservas: [
        { pedido_id: "pedido-1", quantidade_reservada: 40 },
        { pedido_id: "pedido-2", quantidade_reservada: 30 },
      ],
    });
  });

  it("rejeita quando a soma das reservas excede a quantidade recebida", () => {
    const resultado = validarReservas(
      [
        { pedido_id: "pedido-1", quantidade: "60" },
        { pedido_id: "pedido-2", quantidade: "60" },
      ],
      100,
      "metro",
    );
    expect(resultado.ok).toBe(false);
    if (!resultado.ok) {
      expect(resultado.erro).toMatch(/não pode ser maior que a quantidade recebida/);
    }
  });

  it("aceita quando a soma é exatamente igual à quantidade recebida (limite)", () => {
    const resultado = validarReservas(
      [
        { pedido_id: "pedido-1", quantidade: "50" },
        { pedido_id: "pedido-2", quantidade: "50" },
      ],
      100,
      "metro",
    );
    expect(resultado.ok).toBe(true);
  });

  it("rejeita linha sem pedido selecionado", () => {
    const resultado = validarReservas([{ pedido_id: "", quantidade: "10" }], 100, "metro");
    expect(resultado.ok).toBe(false);
    if (!resultado.ok) {
      expect(resultado.erro).toMatch(/Selecione o pedido na linha 1/);
    }
  });

  it("rejeita pedido repetido em duas linhas", () => {
    const resultado = validarReservas(
      [
        { pedido_id: "pedido-1", quantidade: "10" },
        { pedido_id: "pedido-1", quantidade: "20" },
      ],
      100,
      "metro",
    );
    expect(resultado.ok).toBe(false);
    if (!resultado.ok) {
      expect(resultado.erro).toMatch(/Pedido repetido na linha 2/);
    }
  });

  it("rejeita quantidade zero ou inválida em uma linha", () => {
    const resultado = validarReservas([{ pedido_id: "pedido-1", quantidade: "0" }], 100, "metro");
    expect(resultado.ok).toBe(false);
    if (!resultado.ok) {
      expect(resultado.erro).toMatch(/Informe uma quantidade maior que zero na linha 1/);
    }
  });
});
