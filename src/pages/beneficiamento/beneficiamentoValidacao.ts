// Espelha o decimal(12,3) do banco (mesmo padrão de
// RomaneioCaixa.quantidade_por_caixa).
export function temNoMaximoTresCasas(valor: number): boolean {
  return Math.round(valor * 1000) / 1000 === valor;
}

// Ao criar: checagem client-side contra o que a Produção gerou. O backend
// continua sendo a fonte da verdade (não soma outras etapas já enviadas).
export function quantidadeEnviadaValida(quantidade: number, quantidadeProduzida: number): boolean {
  return quantidade > 0 && quantidade <= quantidadeProduzida;
}

// Ao receber: diferente do Romaneio (que exige soma exata dos itens), aqui
// perda é esperada e normal (peças rejeitadas no bordado/silk/costura) — só
// o excesso é erro real.
export function excedeQuantidadeEnviada(recebida: number, enviada: number): boolean {
  return recebida > enviada;
}

// Indicador informativo (não bloqueante) de quanto ficou de perda no processo.
export function diferencaRecebimento(enviada: number, recebida: number): number {
  return enviada - recebida;
}
