import { describe, expect, it } from "vitest";
import type { RomaneioDetalhe } from "../../types/romaneio";
import { somarEnviadoPorProduto } from "./quantidadeEnviada";

function romaneio(parcial: Partial<RomaneioDetalhe> & Pick<RomaneioDetalhe, "itens">): RomaneioDetalhe {
  return {
    id: "romaneio-1",
    codigo: "ROM-0001",
    pedido_id: "pedido-1",
    data_saida: "2026-01-01",
    criado_por: "user-1",
    criado_em: "2026-01-01T00:00:00Z",
    pedido_codigo: "PED-0001",
    cliente_nome: "Cliente",
    usuario_nome: "Usuário",
    volumes_total: 1,
    ...parcial,
  };
}

describe("somarEnviadoPorProduto", () => {
  it("soma quantidade_por_caixa x quantidade_caixas por produto", () => {
    const romaneios = [
      romaneio({
        itens: [
          {
            produto_id: "produto-1",
            codigo: "P1",
            nome: "Produto 1",
            descricao: null,
            caixas: [{ quantidade_por_caixa: "10", quantidade_caixas: 2 }],
          },
        ],
      }),
    ];

    expect(somarEnviadoPorProduto(romaneios).get("produto-1")).toBe(20);
  });

  it("acumula o mesmo produto através de vários romaneios (envio parcial)", () => {
    const romaneios = [
      romaneio({
        itens: [
          {
            produto_id: "produto-1",
            codigo: "P1",
            nome: "Produto 1",
            descricao: null,
            caixas: [{ quantidade_por_caixa: "5", quantidade_caixas: 1 }],
          },
        ],
      }),
      romaneio({
        id: "romaneio-2",
        codigo: "ROM-0002",
        itens: [
          {
            produto_id: "produto-1",
            codigo: "P1",
            nome: "Produto 1",
            descricao: null,
            caixas: [{ quantidade_por_caixa: "3", quantidade_caixas: 1 }],
          },
        ],
      }),
    ];

    expect(somarEnviadoPorProduto(romaneios).get("produto-1")).toBe(8);
  });

  it("retorna mapa vazio quando não há romaneios", () => {
    expect(somarEnviadoPorProduto([]).size).toBe(0);
  });

  it("mantém produtos separados", () => {
    const romaneios = [
      romaneio({
        itens: [
          {
            produto_id: "produto-1",
            codigo: "P1",
            nome: "Produto 1",
            descricao: null,
            caixas: [{ quantidade_por_caixa: "10", quantidade_caixas: 1 }],
          },
          {
            produto_id: "produto-2",
            codigo: "P2",
            nome: "Produto 2",
            descricao: null,
            caixas: [{ quantidade_por_caixa: "4", quantidade_caixas: 3 }],
          },
        ],
      }),
    ];

    const totais = somarEnviadoPorProduto(romaneios);
    expect(totais.get("produto-1")).toBe(10);
    expect(totais.get("produto-2")).toBe(12);
  });
});
