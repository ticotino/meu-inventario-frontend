## Why

Três lacunas apareceram no uso real do sistema depois da primeira leva de melhorias em Pedidos (change `pedidos-rastreio-producao`): a descrição do item some da tela sempre que o item não precisa de acabamento externo, quando na prática toda peça tem uma descrição que vale registrar; não existe forma de excluir de vez um pedido de teste, só cancelar (que mantém o registro); e o nome "Beneficiamento" — termo interno de manufatura — não é como o dono da oficina se refere a esse trabalho no dia a dia, que ele chama de "serviços externos". Nenhuma dessas é uma mudança de arquitetura, mas as três tocam a mesma área (Pedidos e o módulo hoje chamado Beneficiamento) e valem um change único.

## What Changes

- A descrição/instrução do item do pedido (`PedidoItem.instrucao`, já existente) passa a ficar **sempre visível** na linha do item em `NovoPedido.tsx`, independente de o item precisar ou não de acabamento externo. O checkbox "precisa de acabamento externo?" continua controlando só `destino_beneficiamento` e `imagem_referencia_url`.
- Adiciona uma ação de **exclusão definitiva de pedido** (hard delete), permitida em qualquer status. Ao excluir, o estoque do produto consumido é devolvido (mesmo efeito que `cancelar` já faz), exceto quando o estoque já foi devolvido antes (pedido já cancelado). Ação irreversível, com confirmação explícita na UI.
- **BREAKING**: remove a restrição `ON DELETE RESTRICT` de `romaneios.pedido_id` e `reservas_materia_prima.pedido_id`, substituindo por `CASCADE` — excluir um pedido agora também remove romaneios, caixas de romaneio e reservas de matéria-prima vinculados a ele.
- **BREAKING**: renomeia por completo o conceito "Beneficiamento" para "Serviços Externos" — rotas, arquivos, tipos, hooks e textos no frontend; módulo, rotas e a tabela `beneficiamentos` (renomeada para `servicos_externos`) no backend.

## Capabilities

### New Capabilities
- `pedido-exclusao`: exclusão definitiva de um pedido, em qualquer status, com devolução de estoque e remoção em cascata de romaneios/reservas vinculados.

### Modified Capabilities
- `pedido-item-beneficiamento` (de `pedidos-rastreio-producao`): a descrição do item deixa de ser condicional ao destino de beneficiamento — passa a ser sempre visível, independente do checkbox de acabamento externo. Esta capacidade também é renomeada de escopo junto com o rename geral (ver Impacto) — o nome do arquivo de spec permanece `pedido-item-beneficiamento` nesta change para não fragmentar o histórico; o rename de nomenclatura do domínio "Beneficiamento" → "Serviços Externos" é tratado como parte da implementação (tasks.md), não como uma nova capacidade de spec.

## Impact

- **Frontend**: `src/types/pedido.ts`, `src/pages/pedidos/NovoPedido.tsx`, `src/pages/pedidos/PedidoDetalhe.tsx`, `src/pages/pedidos/Pedidos.tsx`, `src/hooks/usePedidos.ts` (exclusão); todo o diretório `src/pages/beneficiamento/` (renomeado), `src/types/beneficiamento.ts`, `src/hooks/useBeneficiamentos.ts`, `src/services/beneficiamentosService.ts`, `src/components/layout/Sidebar.tsx`, e qualquer arquivo que importe desses módulos (`src/pages/pedidos/*`, `src/pages/producao/ProducaoDetalhe.tsx`, `src/pages/prestadores/*`, `src/pages/Compras.tsx`) — auditoria completa listada no tasks.md.
- **Backend**: `src/modules/pedidos/service.ts` (nova função de exclusão), migration para trocar `RESTRICT` por `CASCADE` em `romaneios.pedido_id` e `reservas_materia_prima.pedido_id`; módulo `src/modules/beneficiamentos/*` renomeado por completo, migration de rename da tabela `beneficiamentos` → `servicos_externos` (e suas constraints/índices), e todo ponto que hoje faz `db("beneficiamentos")` ou `JOIN beneficiamentos` (`src/modules/pedidos/service.ts`).
- **Dados**: a exclusão de pedido é uma operação destrutiva real sobre dados que podem já estar em uso — requer transação cuidadosa (reversão de estoque + cascata) e teste manual antes de considerar pronta. O rename de tabela é uma migration estrutural, diferente das aditivas feitas até aqui — precisa ser aplicada num momento sem uso concorrente do sistema.
- **Design**: a ação de excluir pedido é destrutiva e irreversível — foge do princípio "sem ceremônia" do `DESIGN.md` para ações do dia a dia; uma confirmação explícita antes de excluir é uma exceção justificada, não uma violação do sistema de design.
