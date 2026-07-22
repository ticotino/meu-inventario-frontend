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
      precisa_servico_externo: false,
      destino_servico_externo: "",
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
          precisa_servico_externo: true,
          destino_servico_externo: "bordado",
          instrucao: "Bordar logo no peito",
        },
      ],
    });
    expect(resultado.success).toBe(true);
  });

  it("rejeita item com acabamento marcado mas sem destino selecionado", () => {
    const resultado = novoPedidoSchema.safeParse({
      ...dadosValidos,
      itens: [{ ...dadosValidos.itens[0], precisa_servico_externo: true, destino_servico_externo: "" }],
    });
    expect(resultado.success).toBe(false);
  });

  it("não exige instrução mesmo com acabamento marcado", () => {
    const resultado = novoPedidoSchema.safeParse({
      ...dadosValidos,
      itens: [
        {
          ...dadosValidos.itens[0],
          precisa_servico_externo: true,
          destino_servico_externo: "silk",
          instrucao: "",
        },
      ],
    });
    expect(resultado.success).toBe(true);
  });

  it("aceita instrução preenchida mesmo sem acabamento externo", () => {
    const resultado = novoPedidoSchema.safeParse({
      ...dadosValidos,
      itens: [
        {
          ...dadosValidos.itens[0],
          precisa_servico_externo: false,
          destino_servico_externo: "",
          instrucao: "camisa azul manga longa",
        },
      ],
    });
    expect(resultado.success).toBe(true);
  });

  it("valida o limite de tamanho da instrução independentemente do acabamento", () => {
    const resultado = novoPedidoSchema.safeParse({
      ...dadosValidos,
      itens: [
        {
          ...dadosValidos.itens[0],
          precisa_servico_externo: false,
          destino_servico_externo: "",
          instrucao: "a".repeat(501),
        },
      ],
    });
    expect(resultado.success).toBe(false);
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
