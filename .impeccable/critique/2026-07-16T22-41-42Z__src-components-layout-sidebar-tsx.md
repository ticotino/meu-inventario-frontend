---
target: sidebar navigation (Sidebar.tsx)
total_score: 20
p0_count: 2
p1_count: 1
timestamp: 2026-07-16T22-41-42Z
slug: src-components-layout-sidebar-tsx
---
# Critique — Sidebar Navigation (Meu Inventário)

Method: dual-agent

## Design Health Score: 20/40 (Acceptable)

| # | Heuristic | Score |
|---|-----------|-------|
| 1 | Visibility of system status | 2 |
| 2 | Match system/real world | 3 |
| 3 | User control and freedom | 2 |
| 4 | Consistency and standards | 1 |
| 5 | Error prevention | 1 |
| 6 | Recognition vs recall | 2 |
| 7 | Flexibility and efficiency | 2 |
| 8 | Aesthetic and minimalist design | 2 |
| 9 | Error recovery | 3 |
| 10 | Help and documentation | 2 |

## Anti-Patterns Verdict
Interaction slop, not visual slop. Detector clean (exit 0, 0 findings) on Sidebar.tsx/AppLayout.tsx/Topbar.tsx. The nav icon toggles pin/collapse instead of navigating, in every state including expanded.

## Priority Issues
- P0: Nav icons don't navigate (Sidebar.tsx:290, onTogglePinned on every icon button)
- P0: Screen-reader model misleading (Sidebar.tsx:298-300, composite aria-label + aria-pressed on destination-named button)
- P1: Fractured active-state pill + doubled tab stops (Sidebar.tsx:292-296, 310-315)
- P2: Nav search is ceremony at 10-11 items
- P2: 100ms hover-preview delay too eager; preview visually identical to pinned state

## Strengths
- Mobile drawer is production-grade a11y (dialog, focus trap, Escape, focus restore)
- pt-BR locale-aware search normalization (NFD diacritics)
- System cohesion: One Accent Rule, 44px targets, motion-reduce everywhere

## Recommended fix
Merge icon+label into a single NavLink per row that navigates in every state (expanded or collapsed). Add one dedicated expand/collapse control (chevron), separate from nav items. Remove "pin" as a user-facing concept — collapsed/expanded state already persists via localStorage.
