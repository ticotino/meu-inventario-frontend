import type { PedidoItem } from "../../types/pedido";

// Estado derivado — não um novo valor de status — comparando, por item, a
// quantidade pedida com a já enviada na soma dos romaneios existentes (ver
// design.md decisão 5 e spec pedido-envio-parcial). A tolerância de 0.0005
// absorve folga de arredondamento de decimal(12,3) sem acusar falso positivo
// num item que já fechou.
export function algumItemComEnvioPendente(
  itens: PedidoItem[],
  enviadoPorProduto: Map<string, number>,
): boolean {
  return itens.some((item) => {
    const enviado = enviadoPorProduto.get(item.produto_id) ?? 0;
    return enviado + 0.0005 < Number(item.quantidade);
  });
}
