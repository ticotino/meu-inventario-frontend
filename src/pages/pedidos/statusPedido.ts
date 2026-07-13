import type { PedidoStatus } from "../../types/pedido";

export const STATUS_PEDIDO_LABEL: Record<PedidoStatus, string> = {
  pendente: "Pendente",
  atendido: "Atendido",
  cancelado: "Cancelado",
  faturado: "Faturado",
};

// Azul (text-action) é reservado a elementos acionáveis/ativos (One Accent
// Rule do DESIGN.md) — status é só leitura, então usa tons neutros + os
// estados terminais positivo/negativo (verde/vermelho).
export const STATUS_PEDIDO_CLASS: Record<PedidoStatus, string> = {
  pendente: "text-muted",
  atendido: "text-ink",
  faturado: "text-success",
  cancelado: "text-danger",
};
