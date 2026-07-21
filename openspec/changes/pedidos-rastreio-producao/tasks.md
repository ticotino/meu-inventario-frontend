## 1. Fase 1a — Tipos e contrato: item do pedido

- [x] 1.1 Estender `PedidoItem` em `src/types/pedido.ts` com `instrucao: string | null`, `destino_beneficiamento: "nenhum" | TipoBeneficiamento` e `imagem_referencia_url: string | null`
- [x] 1.2 Estender `PedidoCreateInput.itens` para aceitar `instrucao?`, `destino_beneficiamento?` e `imagem_referencia_url?` por item
- [x] 1.3 Confirmar (Open Question do design.md) se já existe infraestrutura de upload de imagem no app; se não existir, escopar o campo `imagem_referencia_url` como uma URL informada manualmente nesta fase

## 2. Fase 1b — UI: formulário de novo pedido

- [x] 2.1 Em `src/pages/pedidos/NovoPedido.tsx`, adicionar por item um controle "Este item precisa de acabamento externo?" que, quando marcado, revela instrução (texto livre), destino (bordado/silk/costura externa) e upload/URL de imagem — colapsado por padrão, seguindo o princípio "fast in, fast out" do `DESIGN.md`
- [x] 2.2 Atualizar o schema Zod de `NovoPedido` para validar os novos campos apenas quando o destino for diferente de `nenhum`
- [x] 2.3 Seguir `DESIGN.md`: nenhum componente novo fora dos já usados (Input, Select, Textarea); badges de destino reaproveitam as classes de status já usadas em `beneficiamento/tipoBeneficiamento.ts`

## 3. Fase 1c — UI: detalhe do pedido

- [x] 3.1 Em `src/pages/pedidos/PedidoDetalhe.tsx`, exibir por item: instrução, destino de beneficiamento (com o mesmo estilo visual de `TIPO_BENEFICIAMENTO_LABEL`) e miniatura/link da imagem de referência, quando presentes
- [x] 3.2 Tratar o caso de item sem beneficiamento (destino `nenhum`) sem exibir nenhuma seção extra — evitar ruído visual em pedidos simples

## 4. Fase 1d — Vínculo PedidoItem ↔ Beneficiamento

- [x] 4.1 Estender `BeneficiamentoRegistro`/`BeneficiamentoCreateInput` em `src/types/beneficiamento.ts` com `pedido_item_id: string | null` (nullable, aditivo — não remove `producao_id`)
- [x] 4.2 Em `src/pages/beneficiamento/NovoBeneficiamento.tsx`, permitir originar um beneficiamento a partir de um item de pedido com destino pendente (além do fluxo atual a partir de uma produção)
- [x] 4.3 Em `src/pages/pedidos/PedidoDetalhe.tsx`, exibir para cada item com beneficiamento associado o status atual (enviado/recebido/cancelado) e link para `BeneficiamentoDetalhe`
- [x] 4.4 Atualizar `src/hooks/useBeneficiamentos.ts`/`usePedidos.ts` conforme necessário para carregar esse vínculo

## 5. Fase 2 — Reserva de matéria-prima → pedido

- [x] 5.1 Modelar `ReservaMateriaPrima` em `src/types/compra.ts`: `{ id, recebimento_id, pedido_id, pedido_codigo, quantidade_reservada, criado_em }`
- [x] 5.2 Estender o fluxo de recebimento de `SolicitacaoCompra` (`ReceberSolicitacaoCompraInput` e a tela correspondente em `src/pages/materias-primas/`) para permitir, opcionalmente, reservar parte ou toda a quantidade recebida para um ou mais pedidos pendentes
- [x] 5.3 Exibir no detalhe do pedido (`PedidoDetalhe.tsx`) uma seção de matéria-prima reservada (tecido, quantidade, data do recebimento), com estado vazio claro quando não houver reserva
- [x] 5.4 Atualizar `src/hooks/useCompras.ts` para expor as reservas associadas a um recebimento e a um pedido

## 6. Fase 3 — Envio parcial (Pedido ↔ Romaneio N:1)

- [x] 6.1 **BREAKING**: substituir `PedidoDetalhe.romaneio_id`/`romaneio_codigo` (singular) em `src/types/pedido.ts` por `romaneios: Array<{ id: string; codigo: string; data_saida: string }>`
- [x] 6.2 Auditar e corrigir todo uso do campo singular, começando por `src/pages/pedidos/PedidoDetalhe.tsx:337` (já identificado), e qualquer outro ponto que assuma 1:1
- [x] 6.3 Em `src/pages/romaneios/NovoRomaneio.tsx`, permitir selecionar um subconjunto dos itens/quantidades ainda não enviados de um pedido (não obrigar o pedido inteiro)
- [x] 6.4 Implementar o cálculo derivado de "parcialmente atendido" (quantidade pedida vs. quantidade já enviada em romaneios, por item) e exibir esse estado no detalhe do pedido
- [x] 6.5 Atualizar `src/pages/pedidos/PedidoDetalhe.tsx` para listar todos os romaneios do pedido, não apenas um
- [x] 6.6 Decidir (Open Question do design.md) se "parcialmente atendido" ganha um badge dedicado na lista de `Pedidos.tsx` ou fica visível só no detalhe

## 7. Fase 4 — Recebimento de compra com nota fiscal e valor

- [x] 7.1 Estender `ReceberSolicitacaoCompraInput` em `src/types/compra.ts` com `nota_fiscal?: string` e `valor_unitario?: number`, espelhando `ReceberBeneficiamentoInput`
- [x] 7.2 Atualizar a tela de recebimento de compra em `src/pages/materias-primas/` para incluir os dois novos campos, opcionais
- [x] 7.3 Exibir nota fiscal e valor no histórico de recebimentos de uma matéria-prima (`MateriaPrimaDetalhe.tsx`), permitindo abandonar a planilha paralela

## 8. Validação cruzada

- [x] 8.1 Rodar a suíte de testes existente (`NovoBeneficiamento.schema.test.ts`, `beneficiamentoValidacao.test.ts`, etc.) e adicionar testes equivalentes para os novos campos de pedido/compra
- [x] 8.2 Revisar cada tela alterada contra `DESIGN.md`: sem grid denso, sem ceremônia extra, paleta e tipografia já existentes, empty-states no padrão tracejado já usado
- [ ] 8.3 Confirmar com o usuário que os contratos de dados (Fases 1–4) foram comunicados ao backend antes de considerar qualquer fase "pronta para produção"
