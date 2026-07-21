## ADDED Requirements

### Requirement: Nota fiscal no recebimento de matéria-prima
Ao registrar o recebimento de reabastecimento de uma matéria-prima já existente, o sistema SHALL aceitar o número da nota fiscal daquela remessa, no mesmo padrão já usado pelo recebimento de beneficiamento.

#### Scenario: Recebimento com nota fiscal informada
- **WHEN** o usuário registra o recebimento de uma remessa de tecido e informa o número da nota fiscal
- **THEN** o sistema salva o número da nota fiscal associado a esse recebimento

#### Scenario: Recebimento sem nota fiscal
- **WHEN** o usuário registra o recebimento de uma remessa sem informar nota fiscal
- **THEN** o sistema aceita o recebimento normalmente, com o campo de nota fiscal vazio

### Requirement: Valor no recebimento de matéria-prima
Ao registrar o recebimento de reabastecimento de uma matéria-prima já existente, o sistema SHALL aceitar o valor daquela remessa específica, já que o valor pode variar entre remessas do mesmo tecido.

#### Scenario: Recebimento com valor informado
- **WHEN** o usuário registra o recebimento de uma remessa de tecido e informa o valor pago
- **THEN** o sistema salva esse valor associado a essa remessa, sem sobrescrever o valor de remessas anteriores da mesma matéria-prima

#### Scenario: Consulta de histórico de valores
- **WHEN** o usuário consulta o histórico de recebimentos de uma matéria-prima que teve remessas com valores diferentes
- **THEN** o sistema exibe o valor correspondente a cada recebimento individualmente
