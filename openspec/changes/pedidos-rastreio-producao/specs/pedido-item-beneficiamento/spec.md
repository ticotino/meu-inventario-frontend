## ADDED Requirements

### Requirement: Instrução por item do pedido
Cada item de um pedido SHALL aceitar uma instrução em texto livre, para registrar detalhes de acabamento (cores, tamanho, posição, texto/desenho) que hoje só existem na ordem de serviço impressa.

#### Scenario: Usuário registra instrução ao criar o pedido
- **WHEN** o usuário adiciona um item a um novo pedido e preenche o campo de instrução com texto livre (ex.: "silk 2 cores centro da peça 20cm")
- **THEN** o sistema salva essa instrução associada ao item, visível depois no detalhe do pedido

#### Scenario: Item sem instrução
- **WHEN** o usuário adiciona um item a um pedido sem preencher instrução
- **THEN** o sistema aceita o item normalmente, com a instrução vazia

### Requirement: Destino de beneficiamento por item
Cada item de um pedido SHALL indicar um destino de beneficiamento entre os valores `nenhum`, `bordado`, `silk` ou `costura_externa`, decidido individualmente por item — dois itens do mesmo pedido podem ter destinos diferentes.

#### Scenario: Itens do mesmo pedido com destinos diferentes
- **WHEN** um pedido tem um item "toalha" com destino `bordado` e um item "lençol" com destino `silk`
- **THEN** o sistema salva e exibe cada item com seu próprio destino, sem forçar um destino único para o pedido inteiro

#### Scenario: Item sem beneficiamento
- **WHEN** o usuário não seleciona nenhum destino de beneficiamento para um item
- **THEN** o sistema salva o item com destino `nenhum`, sem exigir preenchimento de instrução ou imagem

### Requirement: Imagem de referência por item
Cada item de um pedido SHALL aceitar uma imagem de referência opcional (ex.: logo do cliente, desenho de bordado), para substituir a prática atual de colar a imagem no papel impresso.

#### Scenario: Usuário anexa imagem de referência
- **WHEN** o usuário anexa uma imagem a um item que tem destino de beneficiamento diferente de `nenhum`
- **THEN** o sistema salva a referência da imagem e a exibe no detalhe do pedido e do item

#### Scenario: Item sem imagem
- **WHEN** o usuário não anexa nenhuma imagem ao item
- **THEN** o sistema aceita o item normalmente, sem exigir imagem

### Requirement: Vínculo entre item do pedido e beneficiamento
Quando um item de pedido com destino de beneficiamento diferente de `nenhum` é efetivamente enviado a um prestador, o sistema SHALL vincular o registro de `Beneficiamento` criado ao item de pedido de origem, permitindo rastrear o status daquele item a partir do pedido.

#### Scenario: Consulta do status de acabamento a partir do pedido
- **WHEN** um item do pedido foi enviado a um prestador para bordado e o beneficiamento ainda está com status `enviado`
- **THEN** o detalhe do pedido exibe, para aquele item, que ele está atualmente em beneficiamento (bordado, status enviado, prestador)

#### Scenario: Item sem beneficiamento associado
- **WHEN** um item de pedido tem destino `nenhum` ou ainda não foi enviado a nenhum prestador
- **THEN** o detalhe do pedido não exibe nenhuma informação de beneficiamento para aquele item
