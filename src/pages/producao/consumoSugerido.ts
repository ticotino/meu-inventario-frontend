interface DimensoesProduto {
  largura_cm: number | null;
  comprimento_cm: number | null;
}

interface LarguraRoloMateriaPrima {
  largura_rolo_cm: number | null;
}

const MARGEM_ACABAMENTO_CM = 5;

// Regra deduzida com o dono da oficina (ver design.md, decisão 3): ele
// sempre corta de forma que uma das duas dimensões da peça bata exatamente
// com a largura do rolo disponível; o consumo por peça é a OUTRA dimensão
// + 5cm fixos de folga para acabamento/costura. Se nenhuma dimensão bate,
// não há sugestão (cai no comportamento manual atual). Se ambas batem
// (peça quadrada), usa comprimento_cm por convenção — caso raro, sem
// exemplo real do usuário, documentado para não ficar indefinido.
export function calcularConsumoSugerido(
  produto: DimensoesProduto,
  materiaPrima: LarguraRoloMateriaPrima,
  quantidadeProduzida: number,
): number | null {
  const { largura_cm: larguraCm, comprimento_cm: comprimentoCm } = produto;
  const larguraRoloCm = materiaPrima.largura_rolo_cm;

  if (larguraCm === null || comprimentoCm === null || larguraRoloCm === null) return null;
  if (!Number.isFinite(quantidadeProduzida) || quantidadeProduzida <= 0) return null;

  const larguraBate = larguraCm === larguraRoloCm;
  const comprimentoBate = comprimentoCm === larguraRoloCm;
  if (!larguraBate && !comprimentoBate) return null;

  const ladoConsumidoCm = larguraBate ? comprimentoCm : larguraCm;
  const consumoPorPecaM = (ladoConsumidoCm + MARGEM_ACABAMENTO_CM) / 100;
  return consumoPorPecaM * quantidadeProduzida;
}
