## Why

Ao registrar uma Produção, o dono da oficina digita de cabeça quanto tecido cada peça consome, calculando na hora a partir da largura do rolo disponível e das dimensões da peça — é exatamente o tipo de conta que o sistema deveria fazer por ele, e um erro de conta aqui desperdiça tecido de verdade. Junto com isso, a metragem exibida no sistema hoje aparece sem casas decimais fixas (ex.: "30" em vez de "30,00"), o que não bate com o jeito que ele mesmo escreve e lê metragem de tecido no dia a dia.

## What Changes

- Adiciona campos de dimensão (`largura_cm`, `comprimento_cm`) opcionais ao cadastro de Produto.
- Adiciona campo de largura de rolo (`largura_rolo_cm`) opcional ao cadastro de Matéria-Prima.
- Ao registrar uma Produção, quando o produto selecionado tem dimensões cadastradas, o formulário destaca as matérias-primas com largura de rolo compatível com uma das duas dimensões da peça, e pré-preenche (de forma editável) a quantidade consumida por matéria-prima com o cálculo: (dimensão da peça que não bate com a largura do rolo + 5cm de acabamento) × quantidade produzida, convertido para metros.
- Ajusta `formatarQuantidade` para exibir metragem de tecido sempre com 2 casas decimais fixas.

## Capabilities

### New Capabilities
- `producao-consumo-calculado`: dimensões de produto, largura de rolo de matéria-prima, e cálculo/sugestão automática de consumo de metragem ao registrar produção.

### Modified Capabilities
(nenhuma — não há spec formalizada em `openspec/specs/` para os módulos de Produto/Matéria-Prima/Produção; a mudança de formatação de metragem é um ajuste de exibição sem impacto em contrato de dados, tratado como detalhe de implementação em vez de requisito de capacidade separado.)

## Impact

- **Frontend**: `src/types/produto.ts` (dimensões), `src/types/materiaPrima.ts` (largura de rolo), `src/pages/producao/NovaProducao.tsx` (cálculo/sugestão), `src/pages/producao/NovoProduto.tsx` e `MateriaPrimaDetalhe.tsx`/`NovaMateriaPrima.tsx` (novos campos nos formulários de cadastro), `src/utils/format.ts` (`formatarQuantidade`).
- **Backend**: `src/modules/produtos` e `src/modules/materias-primas` (repositório `meu-inventario-backend`) — novas colunas opcionais via migration aditiva; nenhuma mudança de comportamento em endpoints existentes além de aceitar/retornar os novos campos.
- **Dados**: produtos e matérias-primas já cadastrados ficam com os novos campos vazios (`null`) até serem preenchidos manualmente — o cálculo automático simplesmente não se aplica a eles até lá, caindo de volta na entrada manual atual.
- **Design**: nenhum componente novo fora dos já usados; o valor sugerido segue o mesmo padrão de "sugestão editável" já usado em `SugestaoCaixa` (Romaneios).
