import { describe, expect, it } from "vitest";
import { novoPedidoSchema } from "./novoPedidoSchema";

const dadosValidos = {
  cliente_id: "cliente-1",
  data_pedido: "2026-07-15",
  data_prevista_entrega: "2026-07-20",
  observacoes: "",
  itens: [
    {
      produto_id: "produto-1",
      quantidade: "10",
      precisa_beneficiamento: false,
      destino_beneficiamento: "",
      instrucao: "",
      imagem_referencia_url: "",
    },
  ],
};

describe("novoPedidoSchema", () => {
  it("aceita um pedido sem acabamento externo", () => {
    expect(novoPedidoSchema.safeParse(dadosValidos).success).toBe(true);
  });

  it("aceita um item com acabamento externo e destino preenchido", () => {
    const resultado = novoPedidoSchema.safeParse({
      ...dadosValidos,
      itens: [
        {
          ...dadosValidos.itens[0],
          precisa_beneficiamento: true,
          destino_beneficiamento: "bordado",
          instrucao: "Bordar logo no peito",
        },
      ],
    });
    expect(resultado.success).toBe(true);
  });

  it("rejeita item com acabamento marcado mas sem destino selecionado", () => {
    const resultado = novoPedidoSchema.safeParse({
      ...dadosValidos,
      itens: [{ ...dadosValidos.itens[0], precisa_beneficiamento: true, destino_beneficiamento: "" }],
    });
    expect(resultado.success).toBe(false);
  });

  it("não exige instrução mesmo com acabamento marcado", () => {
    const resultado = novoPedidoSchema.safeParse({
      ...dadosValidos,
      itens: [
        {
          ...dadosValidos.itens[0],
          precisa_beneficiamento: true,
          destino_beneficiamento: "silk",
          instrucao: "",
        },
      ],
    });
    expect(resultado.success).toBe(true);
  });

  it("rejeita prazo de entrega anterior à data do pedido", () => {
    const resultado = novoPedidoSchema.safeParse({
      ...dadosValidos,
      data_pedido: "2026-07-20",
      data_prevista_entrega: "2026-07-15",
    });
    expect(resultado.success).toBe(false);
  });

  it("rejeita pedido sem nenhum item", () => {
    const resultado = novoPedidoSchema.safeParse({ ...dadosValidos, itens: [] });
    expect(resultado.success).toBe(false);
  });
});
