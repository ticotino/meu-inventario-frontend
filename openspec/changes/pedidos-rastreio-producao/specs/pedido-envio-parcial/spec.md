## ADDED Requirements

### Requirement: Múltiplos romaneios por pedido
Um pedido SHALL poder gerar mais de um romaneio ao longo de seu ciclo de vida, para suportar envio parcial dos itens já prontos quando há urgência e nem todos os itens do pedido estão disponíveis.

#### Scenario: Envio parcial por urgência
- **WHEN** um pedido tem 3 itens, apenas 2 estão prontos, e o pedido é urgente
- **THEN** o usuário consegue gerar um romaneio contendo apenas os 2 itens prontos, mantendo o pedido em aberto para o item restante

#### Scenario: Segundo romaneio para o mesmo pedido
- **WHEN** o item restante de um pedido que já teve um romaneio parcial fica pronto
- **THEN** o usuário consegue gerar um segundo romaneio para esse mesmo pedido, referenciando apenas o item pendente

### Requirement: Listagem de romaneios no detalhe do pedido
O detalhe de um pedido SHALL exibir todos os romaneios já gerados para ele, não apenas o mais recente.

#### Scenario: Pedido com múltiplos envios
- **WHEN** o usuário abre o detalhe de um pedido que já teve dois romaneios gerados
- **THEN** o sistema lista os dois romaneios, com código e data de saída de cada um

#### Scenario: Pedido com um único envio
- **WHEN** o usuário abre o detalhe de um pedido que teve apenas um romaneio gerado (fluxo mais comum)
- **THEN** o sistema exibe esse único romaneio, sem exigir nenhuma ação extra do usuário

### Requirement: Estado de atendimento derivado por item
O sistema SHALL derivar se um pedido está totalmente ou parcialmente atendido comparando, por item, a quantidade pedida com a quantidade já enviada em romaneios — sem introduzir um novo valor de status fixo no pedido.

#### Scenario: Pedido parcialmente atendido
- **WHEN** um pedido tem um item com quantidade pedida maior que a quantidade já enviada em todos os romaneios existentes
- **THEN** o sistema indica que o pedido está parcialmente atendido, mostrando quais itens ainda faltam sair

#### Scenario: Pedido totalmente atendido
- **WHEN** a quantidade enviada em romaneios de todos os itens de um pedido é igual à quantidade pedida
- **THEN** o sistema indica que o pedido está totalmente atendido
