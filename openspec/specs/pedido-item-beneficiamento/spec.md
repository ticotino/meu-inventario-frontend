# pedido-item-beneficiamento

## Purpose

TBD - created by archiving change pedidos-descricao-exclusao-servicos-externos. Update Purpose after archive.

## Requirements

### Requirement: Instrução por item do pedido
Cada item de um pedido SHALL aceitar uma instrução em texto livre, para registrar detalhes da peça e, quando aplicável, de acabamento (cores, tamanho, posição, texto/desenho) que hoje só existem na ordem de serviço impressa. Essa instrução SHALL ser exibida e editável independentemente de o item ter ou não um destino de serviço externo diferente de `nenhum` — não fica condicionada a nenhum outro campo do item.

#### Scenario: Usuário registra instrução em item sem acabamento externo
- **WHEN** o usuário adiciona um item a um novo pedido, não marca nenhum destino de serviço externo, e preenche o campo de instrução com uma descrição da peça (ex.: "camisa azul manga longa")
- **THEN** o sistema salva essa instrução associada ao item e a exibe no detalhe do pedido, mesmo sem nenhum acabamento externo associado

#### Scenario: Usuário registra instrução ao criar o pedido com acabamento
- **WHEN** o usuário adiciona um item a um novo pedido e preenche o campo de instrução com texto livre (ex.: "silk 2 cores centro da peça 20cm")
- **THEN** o sistema salva essa instrução associada ao item, visível depois no detalhe do pedido

#### Scenario: Item sem instrução
- **WHEN** o usuário adiciona um item a um pedido sem preencher instrução
- **THEN** o sistema aceita o item normalmente, com a instrução vazia
