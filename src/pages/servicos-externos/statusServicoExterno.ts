import type { StatusServicoExterno } from "../../types/servicoExterno";

export const STATUS_SERVICO_EXTERNO_LABEL: Record<StatusServicoExterno, string> = {
  enviado: "Enviado",
  recebido: "Recebido",
  cancelado: "Cancelado",
};

// Azul (text-action) é reservado a elementos acionáveis/ativos (One Accent
// Rule do DESIGN.md) — status é só leitura, então usa tons neutros + os
// estados terminais positivo/negativo (verde/vermelho).
export const STATUS_SERVICO_EXTERNO_CLASS: Record<StatusServicoExterno, string> = {
  enviado: "text-muted",
  recebido: "text-success",
  cancelado: "text-danger",
};
