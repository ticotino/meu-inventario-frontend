## Why

O módulo de Pedidos trata cada pedido como um bloco único (`pendente` → `atendido` → `faturado`) que apenas debita estoque de produto pronto. Na prática da oficina, cada **item** de um pedido carrega sua própria instrução (bordar, silkar, ou nada), muitas vezes espera por matéria-prima que ainda não chegou quando o pedido é registrado, e pode ser enviado em parcelas quando há urgência. Hoje essas informações vivem fora do sistema — na cabeça do dono da oficina, em papel impresso, ou em planilha paralela — e se perdem com frequência, gerando erros de produção e retrabalho. O objetivo desta mudança é dar a cada uma dessas informações um lugar digital durável.

## What Changes

- Adiciona campo de **instrução por item do pedido** (texto livre) e **destino de beneficiamento** (`nenhum` / `bordado` / `silk` / `costura_externa`), decidido por item e não mais só no papel.
- Permite **anexar uma imagem de referência** a um item do pedido (ex.: logo do cliente, desenho de bordado), preservando a informação que hoje só existe na ordem de serviço impressa.
- Cria vínculo entre `PedidoItem` e `Beneficiamento`, permitindo ver, a partir do pedido, se um item está atualmente com um prestador (bordado/silk/costura externa) e em qual status.
- Adiciona **reserva de matéria-prima para pedido**: ao registrar o recebimento de uma compra de matéria-prima, permite marcar para qual(is) pedido(s) pendente(s) aquela remessa se destina, substituindo a marcação mental/perdida atual.
- **BREAKING**: remove a suposição de relação 1:1 entre `Pedido` e `Romaneio`; um pedido passa a poder gerar **múltiplos romaneios** (envio parcial), com o pedido permanecendo `pendente`/parcialmente atendido até que todos os itens tenham sido enviados.
- Adiciona **nota fiscal** e **valor** ao recebimento de reabastecimento de matéria-prima (`ReceberSolicitacaoCompraInput`), replicando o padrão que já existe em `Beneficiamento` (`nota_fiscal` + `valor_cobrado`), eliminando a necessidade da planilha paralela de controle de recebimento.
- Todo trabalho de UI resultante segue o sistema de design existente (`DESIGN.md` — "The Workshop Ledger"): sem grids densos, sem ceremônia extra, cores restritas à paleta já definida.

## Capabilities

### New Capabilities
- `pedido-item-beneficiamento`: instrução, destino de beneficiamento e anexo de imagem por item de pedido, com vínculo visível a registros de `Beneficiamento`.
- `pedido-reserva-materia-prima`: alocação de remessas de matéria-prima recebidas a pedidos pendentes específicos.
- `pedido-envio-parcial`: suporte a múltiplos romaneios por pedido, permitindo envio parcial dos itens prontos.
- `compra-recebimento-detalhado`: nota fiscal e valor no recebimento de reabastecimento de matéria-prima.

### Modified Capabilities
(nenhuma — `openspec/specs/` ainda não tem specs formalizadas para os módulos existentes; as quatro capacidades acima são todas novas do ponto de vista do OpenSpec, ainda que estendam módulos de código já existentes: Pedidos, Beneficiamento, Compras/Matéria-Prima e Romaneios.)

## Impact

- **Tipos**: `src/types/pedido.ts` (`PedidoItem`, `PedidoCreateInput`), `src/types/compra.ts` (`ReceberSolicitacaoCompraInput`, `NecessidadeCompra`), `src/types/romaneio.ts` (remoção da suposição 1:1), `src/types/beneficiamento.ts` (referência a `pedido_item_id`).
- **Páginas**: `src/pages/pedidos/*` (NovoPedido, PedidoDetalhe, Pedidos), `src/pages/beneficiamento/*` (vínculo com item de pedido), `src/pages/materias-primas/*` (recebimento com nota fiscal/valor), `src/pages/romaneios/*` (suporte a múltiplos romaneios por pedido).
- **Design**: segue `DESIGN.md` — nenhum componente ou token novo fora do sistema existente é esperado; anexos de imagem e badges de status devem reaproveitar padrões de card/badge já em uso.
- **Dados**: mudanças de shape em `PedidoItem`, `ReceberSolicitacaoCompraInput` e na cardinalidade `Pedido`↔`Romaneio` — o backend (fora deste repo de frontend) precisará acompanhar esses contratos; este change documenta o contrato esperado do lado do frontend.
- **Fases de execução** (ver `tasks.md`): a ordem de implementação prioriza onde mais informação se perde hoje — item/instrução e reserva de matéria-prima antes de envio parcial e recebimento detalhado.
