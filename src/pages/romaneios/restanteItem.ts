// Cálculos puros do envio parcial (ver design.md decisão 5): quanto ainda
// falta empacotar de um item, e se as caixas digitadas no form fecham com
// esse restante. Extraído de NovoRomaneio.tsx para ser testável isoladamente
// e para que o indicador ao vivo e a validação de submit nunca divirjam.

// Soma quantidade_por_caixa × quantidade_caixas de uma lista de linhas do
// form. Linhas com valores ainda não numéricos (campo vazio, em edição) são
// ignoradas na soma em vez de virarem NaN.
export function somaCaixas(
  caixas: Array<{ quantidade_por_caixa: string; quantidade_caixas: string }> | undefined,
): number {
  if (!caixas) return 0;
  return caixas.reduce((total, caixa) => {
    const qtd = Number(caixa.quantidade_por_caixa);
    const n = Number(caixa.quantidade_caixas);
    if (!Number.isFinite(qtd) || !Number.isFinite(n)) return total;
    return total + qtd * n;
  }, 0);
}

// Predicado único de "fecha com o restante do item" — o mesmo do backend
// (comparação de cada lado arredondado a 3 casas, espelhando o decimal(12,3)
// do banco). Usado pelo contador ao vivo E pelo submit, para o indicador
// nunca discordar da validação.
export function fechaComRestante(empacotado: number, restanteQtd: number): boolean {
  return empacotado.toFixed(3) === restanteQtd.toFixed(3);
}

// Quanto ainda falta sair de um item: quantidade pedida menos o que já saiu
// em romaneios anteriores deste mesmo pedido (0 para um item que nunca foi
// enviado, ou seja, igual à quantidade pedida — ver design.md decisão 5).
// Nunca retorna negativo: um item já 100% (ou além, por folga de arredondamento)
// enviado tem restante zero, não deve "sobrar" para um novo romaneio.
export function calcularRestante(pedida: number, enviado: number): number {
  return Math.max(Number((pedida - enviado).toFixed(3)), 0);
}
