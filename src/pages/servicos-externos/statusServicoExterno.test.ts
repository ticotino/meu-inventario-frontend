import { describe, expect, it } from "vitest";
import { TIPOS_SERVICO_EXTERNO } from "../../types/servicoExterno";
import { STATUS_SERVICO_EXTERNO_CLASS, STATUS_SERVICO_EXTERNO_LABEL } from "./statusServicoExterno";
import { TIPO_SERVICO_EXTERNO_LABEL } from "./tipoServicoExterno";

const STATUS_VALUES = ["enviado", "recebido", "cancelado"] as const;

describe("STATUS_SERVICO_EXTERNO_LABEL / STATUS_SERVICO_EXTERNO_CLASS", () => {
  it("tem rótulo e classe para todo status", () => {
    for (const status of STATUS_VALUES) {
      expect(STATUS_SERVICO_EXTERNO_LABEL[status]).toBeTruthy();
      expect(STATUS_SERVICO_EXTERNO_CLASS[status]).toBeTruthy();
    }
  });

  it("nunca usa a palavra 'faturado' (reservada ao pedido do cliente)", () => {
    for (const status of STATUS_VALUES) {
      expect(STATUS_SERVICO_EXTERNO_LABEL[status].toLowerCase()).not.toContain("faturado");
    }
  });

  it("não usa texto azul/ação — status é só leitura (One Accent Rule)", () => {
    for (const status of STATUS_VALUES) {
      expect(STATUS_SERVICO_EXTERNO_CLASS[status]).not.toContain("text-action");
    }
  });
});

describe("TIPO_SERVICO_EXTERNO_LABEL", () => {
  it("tem rótulo para todo tipo", () => {
    for (const tipo of TIPOS_SERVICO_EXTERNO) {
      expect(TIPO_SERVICO_EXTERNO_LABEL[tipo]).toBeTruthy();
    }
  });
});
