## ADDED Requirements

### Requirement: Reserva de matéria-prima recebida para pedido(s) pendente(s)
Ao registrar o recebimento de uma remessa de matéria-prima, o sistema SHALL permitir associar toda ou parte da quantidade recebida a um ou mais pedidos pendentes específicos, substituindo o controle mental/perdido atual.

#### Scenario: Reserva integral para um único pedido
- **WHEN** o usuário recebe uma remessa de tecido e marca a quantidade inteira como reservada para o pedido X
- **THEN** o sistema registra essa reserva e a exibe tanto no recebimento quanto no detalhe do pedido X

#### Scenario: Reserva parcial dividida entre vários pedidos
- **WHEN** o usuário recebe uma remessa de tecido e reserva parte da quantidade para o pedido X e outra parte para o pedido Y
- **THEN** o sistema registra as duas reservas separadamente, cada uma com sua própria quantidade, sem exigir que a remessa inteira seja alocada de uma vez

#### Scenario: Recebimento sem reserva
- **WHEN** o usuário recebe uma remessa de matéria-prima sem reservar nenhuma quantidade para pedidos específicos
- **THEN** o sistema aceita o recebimento normalmente e a quantidade permanece como estoque livre

### Requirement: Visibilidade da reserva no detalhe do pedido
O detalhe de um pedido pendente SHALL exibir se ele possui matéria-prima já reservada, para reduzir a dependência de memória sobre o que já chegou.

#### Scenario: Pedido com matéria-prima reservada
- **WHEN** o usuário abre o detalhe de um pedido que tem uma reserva de matéria-prima registrada
- **THEN** o sistema exibe a quantidade reservada, o tecido e a data do recebimento associado

#### Scenario: Pedido sem matéria-prima reservada
- **WHEN** o usuário abre o detalhe de um pedido que ainda não tem nenhuma reserva registrada
- **THEN** o sistema indica claramente que nenhuma matéria-prima foi reservada para esse pedido ainda
