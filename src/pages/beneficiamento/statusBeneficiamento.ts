import type { StatusBeneficiamento } from "../../types/beneficiamento";

export const STATUS_BENEFICIAMENTO_LABEL: Record<StatusBeneficiamento, string> = {
  enviado: "Enviado",
  recebido: "Recebido",
  cancelado: "Cancelado",
};

// Azul (text-action) é reservado a elementos acionáveis/ativos (One Accent
// Rule do DESIGN.md) — status é só leitura, então usa tons neutros + os
// estados terminais positivo/negativo (verde/vermelho).
export const STATUS_BENEFICIAMENTO_CLASS: Record<StatusBeneficiamento, string> = {
  enviado: "text-muted",
  recebido: "text-success",
  cancelado: "text-danger",
};
