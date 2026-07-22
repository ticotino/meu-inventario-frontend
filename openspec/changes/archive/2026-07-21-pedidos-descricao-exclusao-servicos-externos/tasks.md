## 1. Backend — exclusão de pedido

- [x] 1.1 Migration: trocar `ON DELETE RESTRICT` por `ON DELETE CASCADE` em `romaneios.pedido_id` e `reservas_materia_prima.pedido_id` (repositório `meu-inventario-backend`)
- [x] 1.2 Em `src/modules/pedidos/service.ts`, implementar `excluir(id)`: dentro de transação com `forUpdate` no pedido, devolver estoque de cada item (somar `quantidade_disponivel` do produto, registrar movimentação `ajuste`) apenas se o pedido não estiver `cancelado`; depois `DELETE FROM pedidos WHERE id = ?` (cascata cuida do resto)
- [x] 1.3 Adicionar rota `DELETE /pedidos/:id` em `src/modules/pedidos/routes.ts` + `controller.ts`, com `authMiddleware` e validação de `idParamSchema`
- [x] 1.4 Rodar `npm run lint` e `npm run build`; NÃO rodar a migration (fica com o usuário)

## 2. Backend — rename Beneficiamento → Serviços Externos

- [x] 2.1 Migration: `ALTER TABLE beneficiamentos RENAME TO servicos_externos` — conferir e renomear também constraints/índices que carregam o nome antigo (`beneficiamentos_tipo_check`, `beneficiamentos_status_check`, `beneficiamentos_quantidade_enviada_check`, `beneficiamentos_quantidade_recebida_check`, `beneficiamentos_auditoria_status_check`, `beneficiamentos_producao_cronologia_idx`, `beneficiamentos_prestador_cronologia_idx`, `beneficiamentos_status_cronologia_idx`, `beneficiamentos_pedido_item_idx`, e a FK `beneficiamentos_pedido_item_id_foreign` referenciada a partir de `pedido_itens`)
- [x] 2.2 Renomear diretório/módulo `src/modules/beneficiamentos/` → `src/modules/servicos-externos/` (controller, routes, schema, service)
- [x] 2.3 Atualizar `src/app.ts`: rota Express de `/beneficiamentos` → `/servicos-externos`, import do módulo renomeado
- [x] 2.4 Atualizar `src/modules/pedidos/service.ts`: troca de `db("beneficiamentos")`/`leftJoin("beneficiamentos as b", ...)` para `servicos_externos`
- [x] 2.5 Re-grep por "beneficiamento"/"Beneficiamento" em todo `src/` do backend — deve sobrar zero, exceto nomes de arquivos de migration antigos (histórico não se renomeia)
- [x] 2.6 Rodar `npm run lint` e `npm run build`; NÃO rodar a migration (fica com o usuário, fora do horário de uso do sistema — ver design.md)

- [x] 2.7 **Achado durante a Fase 2** (fora do escopo original, adicionado ao plano): a coluna `pedido_itens.destino_beneficiamento` e os campos de resposta `beneficiamento_id`/`beneficiamento_codigo`/`beneficiamento_tipo`/`beneficiamento_status`/`beneficiamento_prestador_nome` + objeto aninhado `beneficiamento` em `pedidos/service.ts::getById()` continuam com o nome antigo. Para consistência com "renomear tudo": migration renomeando a coluna para `destino_servico_externo`, e atualizar `pedidos/schema.ts` (nome do campo aceito no create) e `pedidos/service.ts` (SELECT, INSERT, e o objeto de resposta `servico_externo: {...}` em vez de `beneficiamento: {...}`). Atualizar também os comentários em `romaneios/service.ts` que referenciam o caminho antigo `beneficiamentos/service.ts`.

## 3. Frontend — descrição sempre visível no item do pedido

- [x] 3.1 Em `src/pages/pedidos/NovoPedido.tsx`, mover o campo de instrução para fora do bloco condicional `{precisaBeneficiamento && (...)}` — sempre visível por item, logo após produto/quantidade; o bloco condicional passa a conter só destino de beneficiamento + imagem de referência
- [x] 3.2 Em `src/pages/pedidos/PedidoDetalhe.tsx`, ajustar `AcabamentoItem` para exibir a instrução sempre que existir, e a seção de destino/beneficiamento vinculado só quando houver
- [x] 3.3 Ajustar/validar `src/pages/pedidos/novoPedidoSchema.ts` e seus testes — instrução deixa de estar amarrada à validação condicional de acabamento

## 4. Frontend — exclusão de pedido

- [x] 4.1 Adicionar `excluirPedido` em `src/services/pedidosService.ts` (`DELETE /pedidos/:id`) e um hook `useExcluirPedido` em `src/hooks/usePedidos.ts` (invalida `["pedidos"]`, `["produtos"]`, `["movimentacoes-estoque"]`, `["dashboard"]`, igual ao padrão já usado por `useCancelarPedido`)
- [x] 4.2 Adicionar ação "Excluir pedido" em `src/pages/pedidos/PedidoDetalhe.tsx`, com confirmação explícita (reaproveitar o padrão de confirmação já usado nas ações de cancelar do projeto)
- [x] 4.3 Após exclusão bem-sucedida, navegar de volta para `/pedidos` com uma mensagem de sucesso (reaproveitar o padrão já usado por outras ações destrutivas do projeto, se houver)

## 5. Frontend — rename Beneficiamento → Serviços Externos

- [x] 5.1 Renomear `src/types/beneficiamento.ts` → `src/types/servicoExterno.ts`: `Beneficiamento`→`ServicoExterno`, `TipoBeneficiamento`→`TipoServicoExterno`, `StatusBeneficiamento`→`StatusServicoExterno`, `BeneficiamentoCreateInput`→`ServicoExternoCreateInput`, `ReceberBeneficiamentoInput`→`ReceberServicoExternoInput`, `BeneficiamentoFiltros`→`ServicoExternoFiltros`, `TIPOS_BENEFICIAMENTO`→`TIPOS_SERVICO_EXTERNO`
- [x] 5.2 Renomear `src/services/beneficiamentosService.ts` → `src/services/servicosExternosService.ts`, apontando para as rotas `/servicos-externos` do backend
- [x] 5.3 Renomear `src/hooks/useBeneficiamentos.ts` → `src/hooks/useServicosExternos.ts`
- [x] 5.4 Renomear diretório `src/pages/beneficiamento/` → `src/pages/servicos-externos/`, incluindo todos os arquivos internos (`Beneficiamentos.tsx`→`ServicosExternos.tsx`, `BeneficiamentoDetalhe.tsx`→`ServicoExternoDetalhe.tsx`, `NovoBeneficiamento.tsx`→`NovoServicoExterno.tsx`, `BeneficiamentoTabs.tsx`→`ServicoExternoTabs.tsx`, `tipoBeneficiamento.ts`→`tipoServicoExterno.ts`, `statusBeneficiamento.ts`→`statusServicoExterno.ts`, `novoBeneficiamentoSchema.ts`→`novoServicoExternoSchema.ts`, e os `.test.ts(x)` correspondentes)
- [x] 5.5 Atualizar `src/App.tsx`: rotas `/beneficiamento/*` → `/servicos-externos/*`
- [x] 5.6 Atualizar `src/components/layout/Sidebar.tsx`: label "Beneficiamento" → "Serviços Externos", `to: "/servicos-externos"`
- [x] 5.7 Atualizar todos os textos visíveis (títulos de página, descrições, empty-states, labels de formulário) de "beneficiamento" para "serviço(s) externo(s)" nos arquivos renomeados e em quem os referencia: `src/pages/pedidos/NovoPedido.tsx`, `src/pages/pedidos/PedidoDetalhe.tsx`, `src/pages/producao/ProducaoDetalhe.tsx`, `src/pages/prestadores/Prestadores.tsx`, `src/pages/Compras.tsx`, `src/hooks/usePrestadores.ts`
- [x] 5.8 Re-grep por "beneficiamento"/"Beneficiamento" em todo `src/` do frontend — deve sobrar zero, exceto referências históricas dentro de `openspec/changes/pedidos-rastreio-producao/` (não alterar changes já commitados de mudanças anteriores)
- [x] 5.9 **Depende da tarefa 2.7 (backend)**: renomear `PedidoItem.destino_beneficiamento` → `destino_servico_externo` em `src/types/pedido.ts` e `PedidoCreateInput.itens[].destino_beneficiamento`; renomear o campo aninhado `PedidoItem.beneficiamento` → `PedidoItem.servicoExterno` (ou `servico_externo`, mantendo a convenção snake_case do restante do arquivo); atualizar todos os usos em `NovoPedido.tsx`, `novoPedidoSchema.ts`, `PedidoDetalhe.tsx` e seus testes

## 6. Validação cruzada

- [x] 6.1 Rodar `npm run build` e `npm test` no frontend; corrigir testes quebrados pelo rename (nomes de arquivo, imports, textos esperados). Build e lint passam limpos; suíte de testes passa (79/83) — as 4 falhas em `PrestadorForm.test.tsx` são pré-existentes e não relacionadas a este change (confirmado rodando a mesma suíte com `git stash` no estado anterior ao change: mesmas 4 falhas)
- [x] 6.2 Rodar `npm run lint` e `npm run build` no backend
- [x] 6.3 Revisar as telas alteradas contra `DESIGN.md` — em especial a nova ação de excluir pedido (confirmação sem virar ceremônia desnecessária em outras ações). `ExcluirPedido` reaproveita `ConfirmInline` (mesmo padrão inline de "Cancelar pedido", sem modal), com variante `danger` mais pesada que `ghost-danger` para diferenciar visualmente de cancelar, aviso de escopo da cascata acima do gatilho, e foco gerenciado no erro — consistente com o resto do arquivo. `DetalheItemPedido` (renomeado de `AcabamentoItem`) segue a regra de exibição condicional do spec sem ruído visual extra. Único achado (copy, P3) já corrigido: "serviço externo terceirizado" era redundante em `Prestadores.tsx`, trocado por "prestam serviços externos"
- [x] 6.4 Confirmar com o usuário: as duas migrations (cascata de exclusão + rename de tabela) ainda precisam ser rodadas manualmente antes de qualquer uma das duas funcionalidades funcionar de ponta a ponta. Confirmado — usuário vai rodá-las fora do horário de uso do sistema
