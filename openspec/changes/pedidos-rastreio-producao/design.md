## Context

O frontend modela a cadeia matéria-prima → produção → pedido → romaneio como listas independentes ligadas apenas por estoque agregado (ver `PRODUCT.md`: "one continuous record"). Na prática de uso (dono solo de oficina/facção), o ponto de fricção real é mais fino que qualquer lista: é o **item de um pedido específico** — ele espera matéria-prima, carrega uma instrução de acabamento (ou nenhuma), e pode sair da oficina antes do resto do pedido estar pronto. Hoje essas três informações vivem fora do sistema (papel, planilha, memória) e o objetivo desta mudança é dar a cada uma um lugar digital.

Restrições que valem para todo o design:
- Usuário único — sem necessidade de papéis/permissões novos.
- Segue `DESIGN.md` ("The Workshop Ledger"): sem grids densos, sem ceremônia (modais de confirmação, cliques extra) em ações do dia a dia, paleta e componentes já existentes.
- O backend não faz parte deste repositório; este design documenta o contrato de dados esperado do lado do frontend, que precisará de trabalho correspondente no backend antes de ir ao ar.
- `Beneficiamento` já existe como capacidade funcional (tipos, prestador, status enviado/recebido/cancelado) — este change estende suas conexões, não redesenha seu ciclo de vida.

## Goals / Non-Goals

**Goals:**
- Cada `PedidoItem` pode carregar instrução livre, destino de beneficiamento (`nenhum`/`bordado`/`silk`/`costura_externa`) e uma imagem de referência.
- É possível ver, a partir de um pedido, se algum item está atualmente com um prestador (e em qual status) — vínculo `PedidoItem` ↔ `Beneficiamento`.
- É possível registrar, no recebimento de uma compra de matéria-prima, para qual(is) pedido(s) pendente(s) aquela remessa (ou parte dela) se destina.
- Um pedido pode gerar mais de um romaneio (envio parcial dos itens já prontos).
- O recebimento de reabastecimento de matéria-prima captura nota fiscal e valor, no mesmo padrão já usado em `Beneficiamento`.

**Non-Goals:**
- Não introduz multiusuário, papéis ou permissões.
- Não implementa o backend — apenas define o contrato de dados esperado.
- Não redesenha o ciclo de vida do `Beneficiamento` (tipos, status) nem o de `Producao`.
- Não adiciona campos financeiros por item de pedido (unit/total/desconto do papel impresso) — fica fora de escopo; pode virar uma capacidade futura separada.
- Não constrói um algoritmo de alocação automática de matéria-prima — a escolha de qual pedido recebe qual remessa continua sendo decisão humana; o sistema só passa a lembrar dela.
- Não generaliza um subsistema de anexos — a imagem de referência é um campo simples (uma imagem por item), não uma galeria.

## Decisions

**1. Destino de beneficiamento reaproveita o enum existente.**
`PedidoItem` ganha `destino_beneficiamento: "nenhum" | TipoBeneficiamento` (reusa `TipoBeneficiamento` de `beneficiamento.ts` em vez de criar uma segunda taxonomia). Evita duas fontes de verdade para "tipos de acabamento".

**2. Instrução e imagem são campos simples no item, não um subsistema de anexos.**
`PedidoItem` ganha `instrucao: string | null` (texto livre) e `imagem_referencia_url: string | null`. Alternativa considerada — um sistema genérico de anexos por pedido — rejeitada porque a realidade observada (ordens de serviço reais) mostra no máximo uma imagem colada por item; complexidade extra não é justificada agora.

**3. `Beneficiamento` ganha `pedido_item_id` nullable, mantendo `producao_id`.**
Hoje `Beneficiamento` só referencia `producao_id`. Adicionar `pedido_item_id` (nullable, aditivo) permite rastrear "este item do pedido foi mandado pro bordado" sem quebrar o fluxo atual onde beneficiamento nasce de uma produção própria já registrada. Alternativa considerada — inverter a FK e fazer `PedidoItem` apontar para uma lista de `Beneficiamento` — rejeitada por exigir migração de dados existentes; a adição nullable é estritamente aditiva.

**4. Reserva de matéria-prima é uma tabela de junção leve, não um campo único.**
Uma remessa recebida frequentemente abastece parcialmente vários pedidos pendentes ao mesmo tempo (comportamento confirmado pelo usuário: prioriza o pedido mais antigo, mas às vezes reparte por urgência). Por isso a reserva é modelada como registros `{ recebimento_id, pedido_id, quantidade_reservada }` — não como um único `pedido_id` direto no recebimento. Alternativa considerada — campo único `pedido_id` no recebimento — rejeitada por não suportar "uma remessa, vários pedidos".

**5. Cardinalidade `Pedido`↔`Romaneio`: o vínculo errado está em `PedidoDetalhe`, não em `Romaneio`.**
`Romaneio.pedido_id` já é uma FK simples (N romaneios podem, estruturalmente, apontar pro mesmo pedido) — o problema está em `PedidoDetalhe.romaneio_id` (singular, comentário explícito de "relação 1:1" no código). A correção é trocar esse campo por `romaneios: Array<{ id, codigo, data_saida }>`. O status do pedido continua sendo os quatro valores atuais (`pendente`/`atendido`/`cancelado`/`faturado`); "parcialmente atendido" é um estado **derivado**, calculado comparando quantidade pedida vs. quantidade já enviada por item — não um novo valor de enum. Alternativa considerada — adicionar `status: "parcialmente_atendido"` — rejeitada por multiplicar combinações de estado sem necessidade; o dado bruto (quantidade enviada por item) já responde a pergunta.

**6. Recebimento de compra espelha o padrão já usado em `Beneficiamento`.**
`ReceberSolicitacaoCompraInput` ganha `nota_fiscal?: string` e `valor_unitario?: number`, no mesmo formato de `ReceberBeneficiamentoInput` (`nota_fiscal` + `valor_cobrado`). Reaproveita um padrão que já existe no código em vez de inventar um novo.

## Risks / Trade-offs

- **[Risco] Backend fora deste repositório** → as mudanças de contrato (itens 3–6 acima) exigem trabalho correspondente no backend antes de funcionar de ponta a ponta. Mitigação: cada fase documenta o shape exato esperado (via specs), permitindo que o trabalho de backend seja escopado e sequenciado em paralelo.
- **[Risco] Complexidade extra no formulário de novo pedido** → adicionar instrução/destino/imagem por item pode virar ceremônia, contrariando o princípio "fast in, fast out" do `DESIGN.md`. Mitigação: os campos novos ficam escondidos atrás de um estado "este item precisa de acabamento?" que só expande instrução/destino/imagem quando marcado — o caminho comum (pedido sem acabamento externo) não ganha nenhum clique extra.
- **[Risco] Reserva de matéria-prima é a peça mais nova arquiteturalmente** → risco de sobre-engenharia para um usuário único. Mitigação: Fase 2 entrega o mínimo (registrar reservas manualmente, sem algoritmo de sugestão/auto-match); a decisão de quem recebe o quê continua 100% humana.
- **[Risco] Mudança de cardinalidade Pedido↔Romaneio é BREAKING** → qualquer código que assuma `romaneio_id` singular (confirmado em `PedidoDetalhe.tsx:337`) quebra. Mitigação: Fase 3 inclui auditoria explícita desse e de outros pontos que assumem 1:1 antes de remover o campo singular.
- **[Risco] Upload de imagem de referência pode não ter infraestrutura pronta** → ver Open Questions.

## Migration Plan

Fases sequenciais, priorizadas pela informação que mais se perde hoje (ver `tasks.md` para o detalhamento executável):

1. **Fase 1 — Item do pedido**: instrução, destino de beneficiamento, imagem de referência, vínculo `PedidoItem`↔`Beneficiamento`.
2. **Fase 2 — Reserva de matéria-prima → pedido**: registrar no recebimento para qual(is) pedido(s) a remessa se destina.
3. **Fase 3 — Envio parcial**: `PedidoDetalhe.romaneio_id` → `romaneios[]`, estado "parcialmente atendido" derivado.
4. **Fase 4 — Recebimento de compra detalhado**: nota fiscal + valor no reabastecimento.

Cada fase é aditiva o suficiente (exceto a Fase 3, explicitamente BREAKING) para ser implantada e gerar valor isoladamente, sem depender das fases seguintes. Rollback: fases 1, 2 e 4 podem ser revertidas individualmente (campos nullable/opcionais); a Fase 3 exige manter o campo singular como deprecado por um período de transição antes de removê-lo, caso seja necessário reverter.

## Open Questions

- Já existe endpoint/infraestrutura de upload de arquivo em algum lugar do app (ex.: para produtos ou clientes)? Isso define se a Fase 1 aceita uma URL já hospedada ou precisa de um fluxo de upload novo.
- Quando a quantidade recebida numa remessa é maior que a soma das reservas feitas para pedidos, o excedente vira estoque livre automaticamente, ou fica um saldo "não alocado" visível em algum lugar?
- Vale um indicador visual dedicado (badge) na lista de Pedidos para "parcialmente atendido", ou basta ficar visível ao abrir o detalhe do pedido?
