import { describe, expect, it } from "vitest";
import type { PedidoItem } from "../../types/pedido";
import { algumItemComEnvioPendente } from "./parcialmenteAtendido";

function item(parcial: Partial<PedidoItem> & Pick<PedidoItem, "produto_id" | "quantidade">): PedidoItem {
  return {
    id: "item-1",
    codigo: "P1",
    nome: "Produto 1",
    instrucao: null,
    destino_beneficiamento: "nenhum",
    imagem_referencia_url: null,
    beneficiamento: null,
    ...parcial,
  };
}

describe("algumItemComEnvioPendente", () => {
  it("retorna false quando todos os itens foram totalmente enviados", () => {
    const itens = [item({ produto_id: "produto-1", quantidade: "10" })];
    const enviado = new Map([["produto-1", 10]]);
    expect(algumItemComEnvioPendente(itens, enviado)).toBe(false);
  });

  it("retorna true quando um item ainda não foi enviado (mapa vazio)", () => {
    const itens = [item({ produto_id: "produto-1", quantidade: "10" })];
    expect(algumItemComEnvioPendente(itens, new Map())).toBe(true);
  });

  it("retorna true quando um item foi parcialmente enviado", () => {
    const itens = [
      item({ produto_id: "produto-1", quantidade: "10" }),
      item({ id: "item-2", produto_id: "produto-2", quantidade: "5" }),
    ];
    const enviado = new Map([
      ["produto-1", 10],
      ["produto-2", 3],
    ]);
    expect(algumItemComEnvioPendente(itens, enviado)).toBe(true);
  });

  it("tolera folga de arredondamento (0.0005) sem acusar pendência", () => {
    const itens = [item({ produto_id: "produto-1", quantidade: "10" })];
    const enviado = new Map([["produto-1", 9.9996]]);
    expect(algumItemComEnvioPendente(itens, enviado)).toBe(false);
  });

  it("acusa pendência quando a diferença excede a folga de arredondamento", () => {
    const itens = [item({ produto_id: "produto-1", quantidade: "10" })];
    const enviado = new Map([["produto-1", 9.99]]);
    expect(algumItemComEnvioPendente(itens, enviado)).toBe(true);
  });

  it("retorna false para lista de itens vazia", () => {
    expect(algumItemComEnvioPendente([], new Map())).toBe(false);
  });
});
