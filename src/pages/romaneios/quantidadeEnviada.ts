import type { RomaneioDetalhe } from "../../types/romaneio";

// Soma, por produto, quanto já foi empacotado (quantidade_por_caixa ×
// quantidade_caixas) atravessando uma lista de romaneios — é o dado bruto
// que sustenta o estado derivado "parcialmente atendido" (design.md,
// decisão 5) e o cálculo do que ainda pode ser selecionado ao montar um
// novo romaneio parcial (NovoRomaneio). Não soma por pedido, e sim por
// pedido↔produto: quem chama já filtrou os romaneios do pedido em questão.
export function somarEnviadoPorProduto(romaneios: RomaneioDetalhe[]): Map<string, number> {
  const totais = new Map<string, number>();
  for (const romaneio of romaneios) {
    for (const item of romaneio.itens) {
      const enviado = item.caixas.reduce(
        (total, caixa) => total + Number(caixa.quantidade_por_caixa) * caixa.quantidade_caixas,
        0,
      );
      totais.set(item.produto_id, (totais.get(item.produto_id) ?? 0) + enviado);
    }
  }
  return totais;
}
