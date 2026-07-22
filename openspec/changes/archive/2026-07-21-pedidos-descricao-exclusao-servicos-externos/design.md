## Context

Este change constrói sobre `pedidos-rastreio-producao` (já implementado e em produção): `PedidoItem` já tem `instrucao`, `destino_beneficiamento` e `imagem_referencia_url`; `Beneficiamento` já tem `pedido_item_id`; `romaneios.pedido_id` já não é mais único (suporta envio parcial). O sistema tem um único usuário (dono da oficina) e está em fase de testes reais — os três ajustes aqui vieram diretamente do uso do dia a dia:

1. A descrição do item só aparece quando o item precisa de acabamento externo, mas toda peça tem uma descrição que vale registrar.
2. Não existe forma de apagar um pedido de teste — só cancelar, que mantém o registro.
3. O nome "Beneficiamento" não é como o dono da oficina chama esse trabalho — ele diz "serviços externos".

Auditoria completa de referências a "beneficiamento" (grep case-insensitive, `.ts`/`.tsx`), feita antes de escrever este design:

**Frontend** (26 arquivos): `App.tsx`, `components/layout/Sidebar.tsx`, `hooks/useBeneficiamentos.ts`, `hooks/usePrestadores.ts`, `pages/beneficiamento/*` (9 arquivos: `BeneficiamentoDetalhe.tsx`+`.test.tsx`, `Beneficiamentos.tsx`, `BeneficiamentoTabs.tsx`, `beneficiamentoValidacao.ts`+`.test.ts`, `NovoBeneficiamento.tsx`+`.schema.test.ts`, `novoBeneficiamentoSchema.ts`, `statusBeneficiamento.ts`+`.test.ts`, `tipoBeneficiamento.ts`), `pages/Compras.tsx`, `pages/pedidos/NovoPedido.tsx`+`novoPedidoSchema.ts`+`.test.ts`, `pages/pedidos/parcialmenteAtendido.test.ts`, `pages/pedidos/PedidoDetalhe.tsx`, `pages/prestadores/Prestadores.tsx`, `pages/producao/ProducaoDetalhe.tsx`, `services/beneficiamentosService.ts`, `types/beneficiamento.ts`, `types/compra.ts`, `types/pedido.ts`.

**Backend** (9 arquivos): `app.ts`, `database/migrations/20260715100000_create_beneficiamentos_table.ts`, `database/migrations/20260721120000_add_beneficiamento_link_to_pedido_itens.ts`, `modules/beneficiamentos/{controller,routes,schema,service}.ts`, `modules/pedidos/{schema,service}.ts`, `modules/romaneios/service.ts`.

## Goals / Non-Goals

**Goals:**
- Descrição do item sempre visível em `NovoPedido.tsx`, desatrelada do acabamento externo.
- Exclusão definitiva de pedido, em qualquer status, com devolução de estoque quando aplicável.
- Rename completo e consistente de "Beneficiamento" para "Serviços Externos" nos dois repositórios, sem deixar referências órfãs do nome antigo.

**Non-Goals:**
- Não redesenha o formulário de pedido em layout de tabela/colunas (decisão já tomada: manter o bloco empilhado atual).
- Não adiciona exclusão em lote (múltiplos pedidos de uma vez) — só um pedido por vez.
- Não muda o ciclo de vida ou os tipos de Serviços Externos (ex-Beneficiamento) — o rename é de nomenclatura, não de comportamento.
- Não implementa um mecanismo de "soft delete com papeleira/lixeira" — é exclusão permanente direta, por escolha do usuário (fase de testes, prioridade é não acumular lixo).

## Decisions

**1. Descrição do item: desacoplar do checkbox de acabamento.**
Em `NovoPedido.tsx`, o campo de instrução sai de dentro do bloco condicional `{precisaBeneficiamento && (...)}` e passa a renderizar sempre, logo após o Select de produto/quantidade. O checkbox "precisa de acabamento externo?" continua controlando só o bloco de destino + imagem de referência. Nenhuma mudança de schema (o campo `instrucao` já é opcional em `PedidoItem`/`PedidoCreateInput` desde o change anterior). Em `PedidoDetalhe.tsx`, o componente `AcabamentoItem` (hoje só renderiza quando `destino_beneficiamento !== "nenhum"`) passa a sempre exibir a descrição quando ela existir, e só exibe a seção de destino/beneficiamento vinculado quando houver. Alternativa considerada — manter a descrição condicional e criar um campo novo "descrição geral" separado — rejeitada por duplicar um campo que já existe e cumpre o mesmo papel.

**2. Exclusão de pedido: hard delete transacional que espelha a reversão de `cancelar`, mais cascata explícita.**
Nova função `excluir(id)` em `pedidos/service.ts` (backend), dentro de uma transação com `forUpdate` no pedido: (a) se o pedido nunca teve seu estoque devolvido (ou seja, não está `cancelado` — `cancelar` já devolveu o estoque nesse caso), soma de volta `quantidade_disponivel` de cada produto pela quantidade de cada item, registrando uma movimentação `ajuste` por item, igual ao que `cancelar()` já faz; (b) exclui o pedido (`DELETE FROM pedidos WHERE id = ?`), o que agora cascateia (ver decisão 3) para `pedido_itens`, `romaneios`+`romaneio_caixas` e `reservas_materia_prima`. `beneficiamentos.pedido_item_id` já é `SET NULL` — sobrevive à exclusão do item, sem referência quebrada. Alternativa considerada — sempre devolver estoque incondicionalmente, mesmo se já cancelado — rejeitada porque duplicaria a devolução (produto ganharia estoque duas vezes para o mesmo pedido).

**3. FKs de `romaneios.pedido_id` e `reservas_materia_prima.pedido_id`: `RESTRICT` → `CASCADE`.**
Sem essa mudança, excluir um pedido que já tem romaneio ou reserva vinculada falharia com violação de FK. Trocar para `CASCADE` é consistente com a intenção do usuário (excluir um pedido de teste deve limpar tudo que dependia dele, sem exigir uma sequência manual de exclusões). Alternativa considerada — bloquear a exclusão com uma mensagem clara quando houver romaneio/reserva vinculada, exigindo que o usuário lide com essas dependências primeiro — mais seguro para dados reais no futuro, mas o usuário priorizou explicitamente "não encher o banco de teste" sobre essa fricção extra; documentado aqui como trade-off consciente, não como omissão.

**4. Confirmação explícita antes de excluir.**
`DESIGN.md` pede "sem ceremônia" para ações do dia a dia, mas excluir um pedido é irreversível e definitivo — uma categoria diferente de "checar estoque" ou "logar uma movimentação". A ação usa o padrão de confirmação já existente no projeto (`ConfirmInline`, já usado em cancelamentos) antes de disparar a exclusão. Não é uma violação do "Flat-By-Default"/"sem ceremônia" — é a mesma lógica que já se aplica a cancelar, só que para uma ação ainda mais destrutiva.

**5. Rename "Beneficiamento" → "Serviços Externos": renomear tudo, sequenciado por dependência.**
Ordem: (a) backend — módulo, rotas, migration de rename de tabela; (b) frontend — tipos, hooks, serviços, páginas, rotas, sidebar. O frontend depende do contrato do backend já estar com o novo nome de rota/tabela antes de apontar para ele (mesmo padrão do change anterior: backend primeiro, frontend depois, ou os dois lados coordenados na mesma sessão de deploy). Nomes escolhidos: rota frontend `/servicos-externos`, diretório `src/pages/servicos-externos/`, tipo `ServicoExterno`/`TipoServicoExterno`/`StatusServicoExterno`, hook `useServicosExternos`, módulo backend `src/modules/servicos-externos/`, tabela `servicos_externos`. Alternativa considerada — manter nomes internos (rotas, tabela, tipos) como estão e só trocar o texto visível na UI — mais barato e sem risco de migration estrutural, mas o usuário confirmou explicitamente "pode renomear tudo", então essa opção mais barata foi descartada por instrução direta.

## Risks / Trade-offs

- **[Risco] Exclusão em cascata de romaneios/reservas é irreversível e pode remover dados que pareciam "só teste" mas não eram** → Mitigação: confirmação explícita na UI (decisão 4), e a lista de romaneios/reservas afetados deveria aparecer no texto de confirmação antes de excluir, para o usuário ver o que vai junto.
- **[Risco] Rename de tabela (`beneficiamentos` → `servicos_externos`) quebra qualquer requisição em trânsito durante o deploy**, diferente das migrations puramente aditivas feitas até agora → Mitigação: aplicar essa migration especificamente fora do horário de uso, e coordenar deploy do backend (rotas novas) com o frontend (que passa a chamar as rotas novas) o mais próximo possível um do outro.
- **[Risco] Rename espalhado por 35 arquivos em dois repositórios tem alta chance de deixar uma referência órfã** (import quebrado, rota antiga esquecida, string visível ainda em português antigo) → Mitigação: tasks.md inclui uma tarefa explícita de re-grep por "beneficiamento"/"Beneficiamento" em ambos os repositórios como último passo de validação, esperando zero resultados fora de comentários históricos/changelog.
- **[Risco] Excluir um pedido `faturado` remove um registro financeiro que já "aconteceu" de verdade** → Mitigação: aceito conscientemente pelo usuário (fase de testes); revisitar se algum dia o sistema for para uso 100% real com faturamento fiscal de verdade — nesse momento vale reconsiderar restringir a exclusão de pedidos faturados.

## Migration Plan

1. Backend: criar migration trocando `RESTRICT` → `CASCADE` em `romaneios.pedido_id` e `reservas_materia_prima.pedido_id`; implementar `excluir()` em `pedidos/service.ts` + rota `DELETE /pedidos/:id`.
2. Backend: renomear módulo `beneficiamentos` → `servicos-externos` (arquivos, rotas Express, referências em `pedidos/service.ts`); migration de rename da tabela `beneficiamentos` → `servicos_externos` (incluindo constraints/índices/nome da FK em `pedido_itens`... na verdade em `pedido_item_id`, que referencia essa tabela).
3. Frontend: descrição sempre visível em `NovoPedido.tsx`/`PedidoDetalhe.tsx`; ação de excluir pedido na UI.
4. Frontend: rename completo (rotas, arquivos, tipos, hooks, sidebar, textos).
5. Re-grep de validação final nos dois repositórios.

Todas as migrations continuam seguindo o acordo já estabelecido: o agente escreve, o usuário roda (`npm run migrate`) e confirma antes do deploy — em especial a migration de rename de tabela, que deve ser aplicada num momento sem uso concorrente do sistema.

## Open Questions

- O texto de confirmação de exclusão deve listar os romaneios/reservas que serão removidos junto, ou basta um aviso genérico "esta ação não pode ser desfeita"?
- Depois do rename, vale manter um redirect de `/beneficiamento` → `/servicos-externos` por um tempo (caso haja algum link salvo), ou pode remover a rota antiga de uma vez, dado que o sistema tem um único usuário?
