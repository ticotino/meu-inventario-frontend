# Especificação: Beneficiamento (terceirização)

## 1. Visão Geral

O Meu Inventário já conecta matérias-primas → produção → pedidos → romaneios num único registro contínuo. Esta feature adiciona o elo que faltava: o controle de peças enviadas para terceiros — costureiras externas, silk-screen e bordado — entre a produção e o momento em que ficam prontas para venda/envio. O dono da oficina passou a registrar manualmente (fora do sistema) quais peças foram cortadas, enviadas para cada tipo de beneficiamento, e quanto voltou; esta feature move esse controle para dentro do Meu Inventário.

## 2. Objetivo

Permitir que o dono da oficina registre, para qualquer Produção já lançada, o envio de peças a um prestador terceirizado (costura externa, silk ou bordado), acompanhe o status de cada envio (enviado/recebido/cancelado), reconcilie a quantidade que voltou contra a que foi enviada, e registre o custo cobrado pelo prestador — sem confundir esse custo com o faturamento ao cliente final, que já existe em Pedidos.

## 3. Requisitos Funcionais

- RF1. Cadastrar, editar, buscar e desativar Prestadores (nome, contato, telefone, e-mail, tipos de serviço que oferecem).
- RF2. A partir de uma Produção, enviar uma quantidade de peças para um Prestador de um tipo específico (costura externa, silk ou bordado), registrando data de envio e, opcionalmente, previsão de recebimento, valor cobrado e nota fiscal.
- RF3. Uma mesma Produção pode ter múltiplos envios de Beneficiamento independentes, de qualquer tipo, em qualquer ordem, sem limite além da quantidade produzida.
- RF4. Listar e filtrar Beneficiamentos por tipo, status e prestador.
- RF5. Marcar um Beneficiamento enviado como recebido, informando a quantidade que voltou (pode ser menor que a enviada — perda no processo é normal) e, opcionalmente, o valor cobrado e a nota fiscal (podem ser preenchidos só no recebimento, quando o valor final é conhecido).
- RF6. Cancelar um Beneficiamento que ainda está no status "enviado".
- RF7. Ver, na tela de uma Produção, todos os Beneficiamentos vinculados a ela, com atalho para enviar um novo.
- RF8. Nunca sobrepor terminologia com o faturamento do Pedido ao cliente final — o custo do Beneficiamento é sempre "Valor cobrado", nunca "Faturado".

## 4. Requisitos Não-Funcionais

- RNF1. Seguir integralmente os padrões visuais do DESIGN.md ("The Workshop Ledger"): superfícies planas, Ledger Blue reservado a elementos acionáveis/ativos, status como texto neutro/verde/vermelho (nunca badge azul), sem modais, sem ceremônia extra em ações do dia a dia.
- RNF2. Reusar os padrões de arquitetura já estabelecidos no repositório (types → services → hooks → pages, React Query, react-hook-form + zod) sem introduzir novas bibliotecas visuais.
- RNF3. Ser acessível: navegável só por teclado, rótulos e mensagens de erro associados via `aria-describedby`, sem depender de cor isoladamente para transmitir status.
- RNF4. Ter cobertura de testes automatizados para a lógica de validação/reconciliação e para os fluxos de formulário mais arriscados (receber além do enviado, tipos de serviço vazios).
- RNF5. Compilar e passar em `npm run build` / `npm run lint` sem novos erros ou warnings.

## 5. Restrições

- Esta sessão de trabalho não tem acesso ao repositório de backend — o contrato REST descrito na seção 8 é assumido, não implementado nem testado ao vivo. É uma dependência explícita para outra equipe/sessão.
- Não há framework de testes de UI ponta a ponta (Cypress/Playwright) no repositório — a verificação é por testes unitários/de componente (Vitest + RTL) e por QA manual.
- Não existe Modal nem componente de Badge/Tag no design system atual — todas as confirmações são inline, todo status é texto colorido.

## 6. Casos de Uso

### UC1 — Cadastrar um prestador
Ator: dono da oficina.
1. Abre "Beneficiamento" → aba "Prestadores".
2. Clica em "Novo prestador", preenche nome e ao menos um tipo de serviço.
3. Salva; o prestador aparece na lista e passa a estar disponível nos formulários de envio para os tipos de serviço marcados.

### UC2 — Enviar peças de uma produção para beneficiamento
Ator: dono da oficina.
1. Abre uma Produção já registrada.
2. Clica em "Enviar para beneficiamento".
3. Escolhe o tipo (costura externa/silk/bordado); a lista de prestadores se restringe aos que atendem aquele tipo.
4. Informa a quantidade enviada (limitada pelo que foi produzido) e a data de envio.
5. Opcionalmente informa previsão de recebimento, valor cobrado e nota fiscal.
6. Salva; o registro aparece com status "Enviado" na lista de Beneficiamento e na seção da Produção de origem.

### UC3 — Registrar o recebimento (com ou sem perda)
Ator: dono da oficina.
1. Abre o Beneficiamento com status "Enviado".
2. Clica em "Marcar como recebido".
3. Informa a quantidade recebida.
   - Se for igual ou menor que a enviada: aviso informativo (se menor) e o sistema aceita — perda no processo é esperada.
   - Se for maior que a enviada: erro bloqueante, não é possível salvar.
4. Opcionalmente informa/atualiza valor cobrado e nota fiscal (o valor final do serviço geralmente só é conhecido na volta).
5. Confirma; o status muda para "Recebido" (estado terminal).

### UC4 — Cancelar um envio
Ator: dono da oficina.
1. Abre um Beneficiamento "Enviado" enviado por engano ou que não vai mais acontecer.
2. Clica em "Cancelar envio", confirma inline.
3. Status muda para "Cancelado" (estado terminal).

## 7. Cenários de Teste / Critérios de Aceitação

| # | Cenário | Resultado esperado |
|---|---|---|
| 1 | Cadastrar prestador sem nenhum tipo de serviço marcado | Erro "Selecione ao menos um tipo de serviço", formulário não envia |
| 2 | Cadastrar prestador com nome de 1 caractere | Erro "Informe ao menos 2 caracteres" |
| 3 | Enviar beneficiamento com quantidade = 0 ou negativa | Erro de validação, não envia |
| 4 | Enviar beneficiamento com quantidade acima da produzida | Erro client-side "Disponível: X", não envia (backend também deve rejeitar) |
| 5 | Enviar beneficiamento com 4+ casas decimais na quantidade | Erro "Use no máximo 3 casas decimais" |
| 6 | Receber com quantidade > enviada | Erro bloqueante, não salva |
| 7 | Receber com quantidade < enviada | Aviso não bloqueante de perda, salva normalmente |
| 8 | Receber com quantidade = enviada | Salva sem aviso |
| 9 | Cancelar um Beneficiamento já "Recebido" ou "Cancelado" | Ação não aparece (só é possível a partir de "Enviado") |
| 10 | Ver a palavra "Faturado" em qualquer tela de Beneficiamento | Nunca ocorre — o termo usado é sempre "Valor cobrado" |
| 11 | Build (`npm run build`) e lint (`npm run lint`) | Sem erros nem warnings novos |
| 12 | Suíte de testes (`npm run test`) | Todos os testes passam |

Critério de aceitação geral: todos os cenários acima passam, e um passo a passo manual (`npm run dev`) reproduz UC1–UC4 sem erros de console, com o app usável só por teclado.

## 8. Modelos de Dados

Ver `src/types/prestador.ts` e `src/types/beneficiamento.ts` para as definições TypeScript completas. Resumo:

**Prestador**: `id, nome, contato, telefone, email, tipos_servico[], ativo, criado_em`.

**Beneficiamento**: `id, codigo, producao_id, prestador_id, tipo (costura_externa|silk|bordado), status (enviado|recebido|cancelado), quantidade_enviada, quantidade_recebida, data_envio, data_recebimento_prevista, data_recebimento, valor_cobrado, nota_fiscal, observacoes` + campos de auditoria (`criado_por/em`, `atualizado_em`, `recebido_em`, `cancelado_em`) + campos denormalizados de listagem (`producao_codigo, produto_nome, prestador_nome, usuario_nome`).

## 9. Interfaces (contrato REST assumido)

**Prestadores**: `GET /api/prestadores`, `POST /api/prestadores`, `PUT /api/prestadores/:id`, `DELETE /api/prestadores/:id` (desativação lógica).

**Beneficiamentos**: `GET /api/beneficiamentos`, `GET /api/beneficiamentos/:id`, `POST /api/beneficiamentos`, `POST /api/beneficiamentos/:id/receber`, `POST /api/beneficiamentos/:id/cancelar`.

Todas as respostas seguem o envelope `{ success: true, data: T }` já usado em todo o resto do app (`src/services/api.ts`). Detalhes de payload e validações assumidas estão documentados nos comentários de `src/services/beneficiamentosService.ts` e `src/services/prestadoresService.ts`, e no plano de implementação original (`/root/.claude/plans/instru-es-gerais-voc-cryptic-pearl.md`, mantido como referência histórica da decisão).

**Este contrato ainda não existe no backend** — é uma dependência externa a este repositório.

## 10. Riscos e Dependências

- **Dependência crítica**: o backend precisa implementar os endpoints acima com o mesmo formato de envelope e os mesmos nomes de campo. Sem isso, as telas compilam e renderizam, mas toda chamada de rede falha.
- **Risco de saldo entre múltiplas etapas**: a v1 não valida que a soma de todos os envios de uma Produção não ultrapasse o que foi produzido — só valida por registro individual. Se o dono enviar a mesma peça "duas vezes" (ex.: 100 unidades para silk e depois mais 100 para bordado, quando só 100 foram produzidas), o sistema não impede hoje. Fica como item para v2, junto com a decisão de backend sobre a questão 1 da seção 9.
- **Risco de estoque "fantasma"**: como nenhuma movimentação de estoque é criada ao enviar/receber peças (decisão deliberada da v1), não há hoje uma visão de "quantas peças estão fora, em beneficiamento, neste momento" fora da tela de Beneficiamento em si. Se isso for necessário no dia a dia, é candidato a v2.
- **Sem verificação end-to-end nesta sessão**: como não há backend disponível, o fluxo completo (criar prestador → enviar → receber) só foi verificado com hooks mockados em teste, não contra dados reais.
