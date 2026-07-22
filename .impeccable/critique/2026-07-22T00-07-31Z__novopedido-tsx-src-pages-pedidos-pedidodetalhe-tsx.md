---
target: NovoPedido.tsx + PedidoDetalhe.tsx (fase 3 — descrição sempre visível)
total_score: 27
p0_count: 0
p1_count: 2
timestamp: 2026-07-22T00-07-31Z
slug: novopedido-tsx-src-pages-pedidos-pedidodetalhe-tsx
---
Method: dual-agent (A: ab672eb9cb738d558 · B: a8a2911d3215d0bd7)

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Skeletons, aria-busy, aria-live presentes; falta confirmação explícita pós-criação do pedido |
| 2 | Match System/Real World | 3 | Coluna "Instrução" mistura texto livre com status/link de workflow externo |
| 3 | User Control and Freedom | 3 | ConfirmInline com cancelamento claro, sem gaps graves |
| 4 | Consistency and Standards | 3 | Checkbox de acabamento é `<input>` cru em vez de componente compartilhado |
| 5 | Error Prevention | 2 | Risco não coberto: perda silenciosa de vínculo instrução↔acabamento |
| 6 | Recognition Rather Than Recall | 3 | Pequena carga de "lembrar" o termo acabamento antes de defini-lo |
| 7 | Flexibility and Efficiency | 2 | Sem atalhos/ação em lote por item (pré-existente) |
| 8 | Aesthetic and Minimalist Design | 3 | Hint do campo de instrução tenta cobrir dois cenários numa frase densa |
| 9 | Error Recovery | 3 | Mensagens específicas e acionáveis, erro não apaga formulário |
| 10 | Help and Documentation | 2 | Hint sobrecarregado documentando dois fluxos |
| **Total** | | **27/40** | **Aceitável (limite superior)** |

## Anti-Patterns Verdict

Não é AI slop — segue rigorosamente o One Accent Rule, progressive disclosure real, skeletons com motion-reduce. Detector automático (Assessment B): 0 achados, CLI limpo. Sem evidência de navegador (superfície autenticada, sem servidor rodando nesta sessão — pulado com justificativa, não inventado).

## Priority Issues

- **[P1] Coluna "Instrução" mistura duas naturezas de dado sem diferenciação visual** — `PedidoDetalhe.tsx:478`. A célula pode ser só texto livre, ou texto + tipo de acabamento + link + status — tudo sob o mesmo header, quebrando "trustworthy at a glance". Fix: separar visualmente as duas naturezas dentro da célula. → `/impeccable clarify`
- **[P1] Desacoplamento entre Instrução e checkbox de acabamento pode perder dados silenciosamente** — `NovoPedido.tsx:258-278`. Hint da Instrução menciona "detalhes do acabamento" antes do checkbox existir; se o usuário descreve acabamento em texto livre mas não marca o checkbox, `destino_beneficiamento` vira "nenhum" e a imagem é descartada sem aviso. Fix: reordenar (checkbox antes do Textarea) e enxugar o hint. → `/impeccable clarify`
- **[P2] Sobrecarga cognitiva na linha de item (até 7 campos simultâneos)** — `NovoPedido.tsx:206-308`. Fix: heading curto pro bloco condicional reforçando a fronteira. → `/impeccable layout`
- **[P2] Dívida de nomenclatura**: componente ainda chamado `AcabamentoItem` (`PedidoDetalhe.tsx:39`), comentários desatualizados. → `/impeccable harden`
- **[P3] Hint do Textarea de Instrução denso** — `NovoPedido.tsx:262`. → `/impeccable clarify`

## Persona Red Flags

**Jordan**: lê "detalhes do acabamento" no hint antes de saber o que isso significa; na tabela, encontra um link acionável "Enviar para beneficiamento" disfarçado dentro de uma coluna que parece nota passiva.
**Riley**: caso de borda confirmado — texto de acabamento + checkbox desmarcado perde destino/imagem silenciosamente; Textarea com `rows` padrão=3 sem affordance de rolagem para até 500 caracteres.

## Minor Observations

Checkbox cru em vez de componente compartilhado; sem contador de caracteres visível (limite 500); nomenclatura "acabamento" coerente dentro do bloco condicional, ambígua só na fronteira externa (coluna/hint).
