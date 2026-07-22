# pedido-exclusao

## Purpose

TBD - created by archiving change pedidos-descricao-exclusao-servicos-externos. Update Purpose after archive.

## Requirements

### Requirement: Exclusão definitiva de pedido
O sistema SHALL permitir excluir definitivamente um pedido, em qualquer status (`pendente`, `atendido`, `cancelado` ou `faturado`), removendo o registro do pedido e todos os seus dados dependentes (itens, romaneios e reservas de matéria-prima vinculados).

#### Scenario: Excluir pedido pendente
- **WHEN** o usuário exclui um pedido com status `pendente`
- **THEN** o sistema remove o pedido, seus itens, e qualquer romaneio ou reserva de matéria-prima vinculados a ele

#### Scenario: Excluir pedido já faturado
- **WHEN** o usuário exclui um pedido com status `faturado`
- **THEN** o sistema permite a exclusão normalmente, sem bloquear por causa do status

### Requirement: Devolução de estoque na exclusão
Ao excluir um pedido cujo estoque de produto ainda não foi devolvido (ou seja, que não está `cancelado`), o sistema SHALL devolver ao estoque disponível do produto a quantidade de cada item do pedido excluído, registrando o ajuste no histórico de movimentações de estoque.

#### Scenario: Excluir pedido pendente devolve estoque
- **WHEN** o usuário exclui um pedido `pendente` cujos itens ainda estão descontados do estoque de produto
- **THEN** o sistema soma de volta a quantidade de cada item ao estoque disponível do respectivo produto e registra uma movimentação de ajuste

#### Scenario: Excluir pedido já cancelado não devolve estoque de novo
- **WHEN** o usuário exclui um pedido que já está `cancelado` (estoque já devolvido no momento do cancelamento)
- **THEN** o sistema exclui o pedido sem devolver estoque uma segunda vez

### Requirement: Confirmação antes de excluir
Por ser uma ação irreversível, o sistema SHALL exigir uma confirmação explícita do usuário antes de executar a exclusão de um pedido.

#### Scenario: Usuário confirma a exclusão
- **WHEN** o usuário aciona "Excluir pedido" e confirma a ação no diálogo de confirmação
- **THEN** o sistema executa a exclusão

#### Scenario: Usuário cancela a confirmação
- **WHEN** o usuário aciona "Excluir pedido" mas fecha ou cancela o diálogo de confirmação sem confirmar
- **THEN** o sistema não exclui o pedido e nenhum dado é alterado
