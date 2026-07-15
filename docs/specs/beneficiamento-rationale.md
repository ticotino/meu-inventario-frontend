# Rationale técnico: Beneficiamento (terceirização)

Este documento registra as decisões de design tomadas ao implementar o módulo de Beneficiamento e os trade-offs considerados. Complementa `docs/specs/beneficiamento.md`.

## Por que um módulo novo, e não um campo na Produção existente

A alternativa mais simples seria adicionar um campo `etapa` (cortado → em beneficiamento → pronto) direto no registro de Produção. Foi descartada porque o dono da oficina confirmou que uma mesma produção pode passar por **múltiplas etapas terceirizadas independentes** (ex.: parte vai para bordado, outra parte para silk, em datas diferentes, com prestadores diferentes). Um único campo de status não representa "N envios paralelos, cada um com seu próprio ciclo de vida". Um registro por envio (`Beneficiamento`) é a modelagem mínima que captura isso sem inventar uma estrutura mais complexa (como itens aninhados) que o domínio não pede — cada envio já é granular o suficiente.

## Por que o vocabulário de status evita a palavra "faturado"

`Pedido.status` já usa `"faturado"` para dizer "nota emitida ao cliente final". O Beneficiamento também tem um conceito de custo — o que o prestador terceirizado cobra pelo serviço. Reusar a palavra "faturado" para os dois criaria uma ambiguidade real: um dono de oficina olhando rapidamente ("fast in, fast out", princípio do DESIGN.md) não deveria precisar se perguntar "faturado em relação a quem?". A solução foi usar um vocabulário totalmente disjunto (`enviado | recebido | cancelado`) e nomear o campo de custo como "Valor cobrado" em vez de "Faturamento", mantendo os dois conceitos em árvores de rotas diferentes (`/pedidos/*` vs. `/beneficiamento/*`). O custo de duas palavras diferentes para "dinheiro que muda de mãos" é baixo comparado ao custo de ambiguidade numa tela que o dono consulta em sessões curtas e frequentes.

## Por que perda é esperada, não um erro

O padrão mais próximo no código existente é a reconciliação de caixas do Romaneio (`fechaComPedido` em `NovoRomaneio.tsx`), que **exige soma exata** — porque um romaneio empacota um pedido fixo, e sobrar ou faltar caixa é sempre um erro de digitação. Beneficiamento é fisicamente diferente: bordado, silk e costura externa rejeitam peças no processo com regularidade (erro de cor, falha de tecido, etc.), e isso não é um erro de operação do dono da oficina. Copiar a exigência de soma exata do Romaneio produziria fricção artificial toda vez que o processo real tivesse uma perda normal — exatamente o tipo de "ceremônia" que o DESIGN.md pede para evitar. Por isso `excedeQuantidadeEnviada` só bloqueia quando a quantidade recebida é **maior** que a enviada (fisicamente impossível, e portanto sempre um erro real), e `diferencaRecebimento` mostra a perda como informação, não como bloqueio.

## Por que nenhuma mudança em `movimentacoes_estoque` na v1

Enviar uma peça para beneficiamento não muda quantas unidades prontas o dono possui — a peça já tinha entrado no estoque via `entrada_producao` no momento em que a Produção foi registrada; beneficiamento é uma camada de "onde essa peça está fisicamente agora e em que etapa", não uma nova entrada ou saída de estoque. Criar uma nova movimentação a cada envio/recebimento inflaria o histórico de movimentações sem mudar o saldo, e obrigaria a decidir uma semântica nova (`saida_beneficiamento`/`entrada_beneficiamento`) que ninguém pediu ainda. Ficou deliberadamente fora do escopo da v1 e documentado como pergunta em aberto para o backend — se o dono da oficina precisar no futuro de uma visão "quantas peças estão fora, em beneficiamento", essa é a extensão natural (v2).

## Por que Prestadores é aninhado sob Beneficiamento (aba), e não um item de menu próprio

O padrão já existente no código tem dois formatos para "entidade de apoio": Fabricantes é um item de menu de primeiro nível (porque é referenciado por múltiplas telas — matérias-primas, compras), enquanto Clientes vive como aba dentro de Pedidos (porque só existe para servir Pedidos). Prestadores só é referenciado por Beneficiamento, então segue o padrão de Clientes/Pedidos, não o de Fabricantes — mantém a navegação do app enxuta em vez de adicionar mais um item de topo por entidade de apoio.

## Por que os schemas zod foram extraídos para arquivos próprios

`prestadorSchema` e `novoBeneficiamentoSchema` precisavam ser exportados para serem testados diretamente (sem passar por render de componente). Exportar uma constante de um arquivo que também exporta um componente React quebra o Fast Refresh do Vite (warning do `eslint-plugin-react-refresh`) — o próprio código já resolve esse problema em outro lugar: `formStyles.ts` existe exatamente para isolar constantes compartilhadas fora dos arquivos de componente. Os novos arquivos `prestadorSchema.ts` e `novoBeneficiamentoSchema.ts` seguem essa mesma convenção.

## Trade-off aceito: sem verificação end-to-end real

Como esta sessão não tem acesso ao repositório de backend, todo o código foi verificado com `tsc`, `eslint` e testes com hooks mockados — nunca contra um servidor real. Isso é um risco residual explícito (documentado na seção 10 de `beneficiamento.md`): é possível que o contrato assumido não bata exatamente com o que o backend vier a implementar (nomes de campo, códigos de erro), exigindo um ajuste de integração quando o backend existir.
