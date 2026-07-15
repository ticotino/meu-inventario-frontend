import { describe, expect, it } from "vitest";
import { TIPOS_BENEFICIAMENTO } from "../../types/beneficiamento";
import { STATUS_BENEFICIAMENTO_CLASS, STATUS_BENEFICIAMENTO_LABEL } from "./statusBeneficiamento";
import { TIPO_BENEFICIAMENTO_LABEL } from "./tipoBeneficiamento";

const STATUS_VALUES = ["enviado", "recebido", "cancelado"] as const;

describe("STATUS_BENEFICIAMENTO_LABEL / STATUS_BENEFICIAMENTO_CLASS", () => {
  it("tem rótulo e classe para todo status", () => {
    for (const status of STATUS_VALUES) {
      expect(STATUS_BENEFICIAMENTO_LABEL[status]).toBeTruthy();
      expect(STATUS_BENEFICIAMENTO_CLASS[status]).toBeTruthy();
    }
  });

  it("nunca usa a palavra 'faturado' (reservada ao pedido do cliente)", () => {
    for (const status of STATUS_VALUES) {
      expect(STATUS_BENEFICIAMENTO_LABEL[status].toLowerCase()).not.toContain("faturado");
    }
  });

  it("não usa texto azul/ação — status é só leitura (One Accent Rule)", () => {
    for (const status of STATUS_VALUES) {
      expect(STATUS_BENEFICIAMENTO_CLASS[status]).not.toContain("text-action");
    }
  });
});

describe("TIPO_BENEFICIAMENTO_LABEL", () => {
  it("tem rótulo para todo tipo", () => {
    for (const tipo of TIPOS_BENEFICIAMENTO) {
      expect(TIPO_BENEFICIAMENTO_LABEL[tipo]).toBeTruthy();
    }
  });
});
