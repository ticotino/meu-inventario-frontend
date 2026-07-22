## ADDED Requirements

### Requirement: Dimensões opcionais do produto
O cadastro de Produto SHALL aceitar largura e comprimento opcionais, em centímetros, representando as dimensões de corte da peça.

#### Scenario: Produto cadastrado com dimensões
- **WHEN** o usuário cadastra ou edita um produto informando largura e comprimento em centímetros
- **THEN** o sistema salva essas dimensões associadas ao produto

#### Scenario: Produto sem dimensões
- **WHEN** o usuário cadastra um produto sem informar dimensões
- **THEN** o sistema aceita o produto normalmente, sem dimensões

### Requirement: Largura de rolo opcional da matéria-prima
O cadastro de Matéria-Prima SHALL aceitar uma largura de rolo opcional, em centímetros.

#### Scenario: Matéria-prima cadastrada com largura de rolo
- **WHEN** o usuário cadastra ou edita uma matéria-prima informando a largura do rolo em centímetros
- **THEN** o sistema salva essa largura associada à matéria-prima

#### Scenario: Matéria-prima sem largura de rolo
- **WHEN** o usuário cadastra uma matéria-prima sem informar largura de rolo (ex.: linha, aviamento)
- **THEN** o sistema aceita a matéria-prima normalmente, sem largura de rolo

### Requirement: Sugestão automática de consumo na produção
Ao registrar uma produção de um produto com dimensões cadastradas, para cada matéria-prima cuja largura de rolo seja igual a uma das dimensões do produto, o sistema SHALL sugerir a quantidade consumida como (a dimensão do produto que não corresponde à largura do rolo, mais 5 centímetros) convertida para metros, multiplicada pela quantidade produzida.

#### Scenario: Sugestão calculada corretamente (lençol 160×250, rolo 250cm)
- **WHEN** o usuário registra uma produção de 30 unidades de um produto com dimensões 160×250cm, usando uma matéria-prima com largura de rolo 250cm
- **THEN** o sistema sugere quantidade consumida de 49,50m (1,65m por peça × 30)

#### Scenario: Sugestão calculada corretamente (lençol 250×280, rolo 250cm)
- **WHEN** o usuário registra uma produção de um produto com dimensões 250×280cm, usando uma matéria-prima com largura de rolo 250cm
- **THEN** o sistema sugere 2,85m de consumo por peça produzida

#### Scenario: Produto sem dimensões cadastradas
- **WHEN** o usuário registra uma produção de um produto sem dimensões cadastradas
- **THEN** o sistema não sugere nenhuma quantidade consumida, exigindo entrada manual como hoje

#### Scenario: Nenhuma matéria-prima com largura de rolo compatível
- **WHEN** o produto tem dimensões cadastradas mas nenhuma matéria-prima ativa tem largura de rolo igual a uma delas
- **THEN** o sistema não sugere nenhuma quantidade consumida para essa matéria-prima, exigindo entrada manual

### Requirement: Sugestão de consumo permanece editável
A quantidade consumida sugerida automaticamente SHALL permanecer editável pelo usuário antes de salvar a produção.

#### Scenario: Usuário ajusta a sugestão
- **WHEN** o sistema sugere uma quantidade consumida calculada e o usuário digita um valor diferente antes de salvar
- **THEN** o sistema salva o valor digitado pelo usuário, não o valor sugerido original

### Requirement: Metragem de tecido exibida com casas decimais fixas
Valores de quantidade cuja unidade de medida seja metro SHALL ser exibidos com no mínimo 2 casas decimais.

#### Scenario: Valor inteiro de metragem
- **WHEN** o sistema exibe uma quantidade de 30 metros
- **THEN** o valor aparece formatado como "30,00 m"

#### Scenario: Valor com casas decimais existentes
- **WHEN** o sistema exibe uma quantidade de 1,65 metros
- **THEN** o valor aparece formatado como "1,65 m"
