---
target: beneficiamento/prestadores module
total_score: 34
p0_count: 0
p1_count: 1
timestamp: 2026-07-17T10-05-34Z
slug: src-pages-beneficiamento
---
# Critique — Beneficiamento/Prestadores Module (Meu Inventário)

Method: dual-agent

## Design Health Score: 34/40 (Good)

| # | Heuristic | Score |
|---|-----------|-------|
| 1 | Visibility of system status | 3 |
| 2 | Match system/real world | 4 |
| 3 | User control and freedom | 3 |
| 4 | Consistency and standards | 3 |
| 5 | Error prevention | 3 |
| 6 | Recognition vs recall | 4 |
| 7 | Flexibility and efficiency | 3 |
| 8 | Aesthetic and minimalist design | 4 |
| 9 | Error recovery | 4 |
| 10 | Help and documentation | 3 |

## Anti-Patterns Verdict
Faithful extension of the existing system, not bolted-on. Detector clean (exit 0, 0 findings) on beneficiamento/prestadores. Zero hardcoded colors — dark-mode safe. Shares tab/status/table/form primitives with sibling modules (Producao, Pedidos).

## Priority Issues
- P1: Beneficiamentos.tsx PageHeader has no create-action button (unlike Producoes.tsx/Prestadores.tsx)
- P2: No "send another" path after creating a beneficiamento — real usage is batches
- P3: Focus management inconsistency (NovoBeneficiamento no setFocus; ReceberForm reveal not announced)
- P4: Deactivating a prestador doesn't warn about in-flight (enviado) beneficiamentos

## Strengths
- Zero hardcoded colors — module will not need a dark-mode follow-up
- Deliberately minimal status lifecycle (enviado/recebido/cancelado, no "em processamento" bloat)
- Real cross-module integration: BeneficiamentoSecao embedded live in ProducaoDetalhe

## Domain-fit gaps
- Producoes.tsx list shows no signal a production has material out with a prestador
- Prestadores list has no reverse link / active-job count back to Beneficiamentos
