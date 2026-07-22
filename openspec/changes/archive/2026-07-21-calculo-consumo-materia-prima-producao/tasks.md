## 1. Backend — dimensões e largura de rolo

- [x] 1.1 Migration (repositório `meu-inventario-backend`): adicionar `largura_cm` e `comprimento_cm` (decimal, nullable) à tabela `produtos`
- [x] 1.2 Migration: adicionar `largura_rolo_cm` (decimal, nullable) à tabela `materias_primas`
- [x] 1.3 Atualizar `src/modules/produtos/schema.ts` e `service.ts` para aceitar/retornar `largura_cm`/`comprimento_cm` (opcionais) em create/update
- [x] 1.4 Atualizar `src/modules/materias-primas/schema.ts` e `service.ts` para aceitar/retornar `largura_rolo_cm` (opcional) em create/update
- [x] 1.5 Rodar `npm run lint` e `npm run build`; NÃO rodar a migration (fica com o usuário)

## 2. Frontend — cadastro de dimensões e largura de rolo

- [x] 2.1 Estender `src/types/produto.ts` (`Produto`, `ProdutoCreateInput`, `ProdutoUpdateInput`) com `largura_cm`/`comprimento_cm` opcionais
- [x] 2.2 Estender `src/types/materiaPrima.ts` (`MateriaPrima`, `MateriaPrimaCreateInput`) com `largura_rolo_cm` opcional. Também estendido `MateriaPrimaUpdateInput` (não listado na tarefa original, mas necessário — sem isso, matérias-primas já cadastradas nunca poderiam ganhar a largura de rolo depois, contradizendo a decisão 5 do design.md)
- [x] 2.3 Adicionar campos opcionais de largura/comprimento em `src/pages/producao/NovoProduto.tsx` e na tela de edição (`ProdutoDetalhe.tsx`, `FormEdicao`) — mesmo motivo acima, produtos existentes precisam poder ganhar dimensões depois
- [x] 2.4 Adicionar campo opcional de largura de rolo em `src/pages/materias-primas/NovaMateriaPrima.tsx`, exibido/editado em metros na UI (convertido para/de cm ao salvar/carregar) — exibir e editar também em `MateriaPrimaDetalhe.tsx` (resumo + `FormEdicao`)

## 3. Frontend — cálculo e sugestão de consumo

- [x] 3.1 Criar função pura `calcularConsumoSugerido` (novo arquivo, ex. `src/pages/producao/consumoSugerido.ts`, com teste próprio) implementando a regra: dado produto (`largura_cm`/`comprimento_cm`) e matéria-prima (`largura_rolo_cm`) e quantidade produzida, retorna a quantidade sugerida em metros ou `null` quando não há dimensão compatível ou dados faltando — seguir exatamente a fórmula do design.md (decisão 3), incluindo o caso de ambas dimensões batendo (usa `comprimento_cm`). Teste cobre os dois exemplos reais do design.md (1,65m e 2,85m) + casos de borda (8 testes)
- [x] 3.2 Em `src/pages/producao/NovaProducao.tsx`, ao selecionar produto e matéria-prima (e ter quantidade produzida preenchida), pré-preencher `quantidade_consumida` do item com o resultado de `calcularConsumoSugerido`, mantendo o campo editável (sem travar). Extraído `ItemProducao` como subcomponente por linha (mesmo padrão de `ItemCaixas` em `NovoRomaneio.tsx`), evitando o problema de re-render em cadeia que watch-ar o array `itens` inteiro causaria
- [x] 3.3 Recalcular a sugestão quando a quantidade produzida mudar, apenas se o usuário ainda não tiver editado manualmente o campo (não sobrescrever um valor já digitado pelo usuário). Rastreado com uma flag local `editadoManualmente` setada no `onChange` do campo, em vez de `dirtyFields` — distingue precisamente "usuário digitou" de "setValue programático da sugestão", que não deve marcar o campo como editado

## 4. Frontend — formatação de metragem

- [x] 4.1 Em `src/utils/format.ts`, ajustar `formatarQuantidade` para usar `minimumFractionDigits: 2` quando a unidade for `metro` (mantendo `maximumFractionDigits: 3`); demais unidades sem alteração
- [x] 4.2 Rodar a suíte de testes existente que cobre `formatarQuantidade` (se houver) e ajustar/criar teste cobrindo o novo comportamento (valor inteiro exibido com 2 casas, valor com 3 casas mantendo a 3ª). 5 novos testes adicionados (7/7 passam)

## 5. Validação cruzada

- [x] 5.1 Rodar `npm run build` e `npm test` no frontend. Build e lint limpos; 91/95 testes passam — as 4 falhas restantes são as mesmas pré-existentes em `PrestadorForm.test.tsx`, já confirmadas não relacionadas em change anterior
- [x] 5.2 Rodar `npm run lint` e `npm run build` no backend. Ambos limpos
- [x] 5.3 Revisar as telas alteradas contra `DESIGN.md`. Achado de polish corrigido: o hint combinado ("Sugestão calculada pelas dimensões cadastradas: X m. Disponível: Y") quebraria em várias linhas dentro da coluna estreita (`sm:w-44`, 176px) do campo Quantidade em `NovaProducao.tsx` — encurtado para "Sugerido: X m · Disponível: Y", consistente com o estilo `hint` compacto já usado no resto do form. Demais telas (cadastro/edição de Produto e Matéria-Prima) já auditadas em 20/20 na fase 3
- [x] 5.4 Confirmar com o usuário que as duas migrations aditivas (dimensões de produto, largura de rolo de matéria-prima) ainda precisam ser rodadas manualmente antes do cálculo automático funcionar de ponta a ponta. Confirmado
