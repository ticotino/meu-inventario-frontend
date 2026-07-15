# Orientações para agentes — Frontend

## Fontes de verdade

- Leia `PRODUCT.md`, `DESIGN.md`, `README.md`, `package.json` e os componentes afetados antes de alterar a interface.
- Preserve a identidade Workshop Ledger, os tokens semânticos e os componentes existentes.
- Não altere arquivos locais ou mudanças preexistentes fora da tarefa, especialmente `.env` e `.env.example`.

## Regras permanentes

- Mantenha Ledger Blue para ações, rota ativa e foco; sidebar `#0f172a`, fundo `#f8fafc`, superfícies brancas e tipografia do sistema.
- Não introduza gradientes, novas fontes, imagens decorativas ou bibliotecas visuais sem decisão explícita.
- Use labels visíveis, mensagens com `role="alert"` ou `role="status"`, foco perceptível, alvos de 44px, teclado completo e movimento reduzido.
- Preserve `ProtectedRoute`, `RequireAdmin`, tokens em memória, refresh por cookie HTTP-only e a base da API terminada em `/api`.
- O topbar e o aside ficam fora da rolagem do `<main>`; o drawer mobile abre abaixo do topbar e funciona como diálogo modal.
- No rail desktop, os botões de ícone controlam abertura e os links de texto realizam navegação.

## Delegação

- Dê a cada subagente objetivo, arquivos permitidos, arquivos proibidos e validações obrigatórias.
- Um agente `feature_frontend` pode editar tipos, serviço, hook, componentes e páginas do próprio recurso.
- Para interfaces complexas, separe `estado_ui`, `interacao_ui` e `a11y_visual`, evitando edição concorrente do mesmo arquivo.
- Reserve `src/App.tsx`, `AppLayout`, navegação global, dashboard, tokens, documentação, dependências, commits e deploy ao agente principal.
- Não permita commits ou push por subagentes. Eles devem entregar resumo, arquivos alterados, validações e riscos restantes.

## Validação

- Rode ESLint direcionado durante a implementação, seguido de `npm run lint` e `npm run build`.
- Execute o detector Impeccable e `git diff --check`.
- Verifique teclado, foco, leitor de tela, zoom de 200%, movimento reduzido e larguras de 320, 768, 1024 e 1440px.
- Teste estados de loading, erro, vazio e sucesso sem depender apenas de cor.
- Se o navegador estiver indisponível, complemente com inspeção de código, build, detector e HTTP, sem declarar validação visual concluída.
- Após o deploy, confirme rotas diretas com HTTP 200 e compare o asset principal do `dist/index.html` com o HTML publicado na Vercel.

## Critério de conclusão

Uma tarefa termina somente quando lint, build, acessibilidade e fluxos afetados passam; o diff respeita `PRODUCT.md` e `DESIGN.md`; mudanças preexistentes permanecem intactas; e o commit e o deploy foram verificados quando solicitados.
